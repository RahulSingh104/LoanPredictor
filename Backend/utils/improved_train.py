# Backend/utils/improved_train.py
"""
Improved training script (preprocessing + train + eval + save pipeline).
Run inside Backend/:  python utils/improved_train.py
"""

import pandas as pd
import numpy as np
import pickle
from pathlib import Path
from datetime import datetime
import json
import warnings

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix
)

# Candidate models
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

warnings.filterwarnings("ignore")

# -------------------
# Config
# -------------------
ROOT_DIR = Path(__file__).resolve().parent.parent  # Backend/
DATA_PATH = ROOT_DIR / "data" / "loan_approval_dataset.csv"
MODEL_OUT = ROOT_DIR / "model" / "loan_pipeline.pkl"
META_PATH = ROOT_DIR / "model" / "loan_pipeline_meta.json"

RANDOM_STATE = 42
TEST_SIZE = 0.2
N_JOBS = 1
MODEL_CHOICE = "randomforest"  # options: "randomforest", "logreg", "xgb"

# -------------------
# Utility functions
# -------------------
def load_and_clean(path):
    df = pd.read_csv(path)
    df.columns = df.columns.str.strip()

    # 🔥 Rename columns to expected names
    df = df.rename(columns={
        "no_of_de": "no_of_dependents",
        "self_empl": "self_employed",
        "income_a": "income_annum",
        "loan_amc": "loan_amount",
        "residentia": "residential_assets_value",
        "commerci": "commercial_assets_value",
        "luxury_as": "luxury_assets_value",
        "bank_ass": "bank_asset_value",
    })

    # Strip whitespace from string columns
    for c in df.select_dtypes(include=['object']).columns:
        df[c] = df[c].astype(str).str.strip()
    return df

def map_target(df, col='loan_status'):
    df[col] = df[col].astype(str).str.strip().str.lower()
    df[col] = df[col].apply(lambda v: 1 if 'approve' in v else (0 if 'reject' in v else np.nan))
    df.dropna(subset=[col], inplace=True)
    df[col] = df[col].astype(int)
    return df

def add_features(df):
    df["debt_to_income"] = df["loan_amount"] / (df["income_annum"] + 1)
    df["asset_coverage"] = (
        df["residential_assets_value"] +
        df["commercial_assets_value"] +
        df["luxury_assets_value"] +
        df["bank_asset_value"]
    ) / (df["loan_amount"] + 1)
    df["loan_to_income"] = df["loan_amount"] / (df["income_annum"] + 1)
    return df

# -------------------
# Train pipeline
# -------------------
def train_pipeline(df,
                   model_out=MODEL_OUT,
                   test_size=TEST_SIZE,
                   random_state=RANDOM_STATE,
                   n_jobs=N_JOBS,
                   model_choice=MODEL_CHOICE):
    if 'loan_id' in df.columns:
        df = df.drop(columns=['loan_id'])
    df = df.dropna().reset_index(drop=True)

    X = df.drop(columns=['loan_status'])
    y = df['loan_status']

    cat_cols = X.select_dtypes(include=['object']).columns.tolist()
    num_cols = X.select_dtypes(include=[np.number]).columns.tolist()

    try:
        ohe = OneHotEncoder(handle_unknown='ignore', sparse=False)
    except TypeError:
        ohe = OneHotEncoder(handle_unknown='ignore', sparse_output=False)

    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), num_cols),
        ('cat', ohe, cat_cols)
    ], remainder='drop')

    if model_choice == "randomforest":
        model = RandomForestClassifier(
            n_estimators=200, random_state=random_state, n_jobs=n_jobs
        )
    elif model_choice == "logreg":
        model = LogisticRegression(max_iter=500, random_state=random_state, n_jobs=n_jobs)
    elif model_choice == "xgb" and HAS_XGB:
        model = XGBClassifier(
            n_estimators=300, max_depth=5, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8, random_state=random_state, n_jobs=n_jobs
        )
    else:
        raise ValueError(f"Invalid MODEL_CHOICE={model_choice}. Use randomforest/logreg/xgb")

    pipe = Pipeline([
        ('pre', preprocessor),
        ('model', model)
    ])

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    pipe.fit(X_train, y_train)

    results = eval_and_save_pipeline(
        pipe=pipe,
        X_train=X_train, y_train=y_train,
        X_test=X_test, y_test=y_test,
        X_full=X, y_full=y,
        num_cols=num_cols, cat_cols=cat_cols,
        model_out=model_out,
        n_jobs=n_jobs,
        verbose=True
    )

    return pipe, results

# -------------------
# Evaluation helper
# -------------------
def eval_and_save_pipeline(pipe,
                           X_train, y_train,
                           X_test, y_test,
                           X_full, y_full,
                           num_cols, cat_cols,
                           model_out=MODEL_OUT,
                           n_jobs=1,
                           verbose=True):

    def _metrics(y_true, y_pred):
        return {
            "accuracy": float(accuracy_score(y_true, y_pred)),
            "precision": float(precision_score(y_true, y_pred, zero_division=0)),
            "recall": float(recall_score(y_true, y_pred, zero_division=0)),
            "f1": float(f1_score(y_true, y_pred, zero_division=0)),
            "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
            "classification_report": classification_report(y_true, y_pred, zero_division=0)
        }

    y_train_pred = pipe.predict(X_train)
    train_metrics = _metrics(y_train, y_train_pred)

    y_test_pred = pipe.predict(X_test)
    test_metrics = _metrics(y_test, y_test_pred)

    if verbose:
        print("\n--- TRAIN metrics ---")
        print(train_metrics)
        print("\n--- TEST metrics ---")
        print(test_metrics)

    try:
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(pipe, X_full, y_full, cv=cv, scoring='accuracy', n_jobs=n_jobs)
        cv_mean = float(cv_scores.mean())
        cv_std = float(cv_scores.std())
    except Exception as e:
        cv_scores, cv_mean, cv_std = None, None, None
        print("CV failed:", e)

    # Save pipeline
    with open(model_out, 'wb') as f:
        pickle.dump(pipe, f)
    print("\n✅ Saved pipeline to", model_out)

    # Save metadata
    meta = {
        "train_metrics": train_metrics,
        "test_metrics": test_metrics,
        "cv_mean_accuracy": cv_mean,
        "cv_std_accuracy": cv_std,
        "categorical_features": cat_cols,
        "numeric_features": num_cols,
        "saved_at": datetime.utcnow().isoformat() + "Z",
        "model_path": str(model_out)
    }
    with open(META_PATH, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"✅ Metadata saved to {META_PATH}")

    return meta

# -------------------
# Main
# -------------------
if __name__ == "__main__":
    df = load_and_clean(DATA_PATH)
    df = map_target(df, 'loan_status')
    df = add_features(df)

    _, results = train_pipeline(
        df, model_out=MODEL_OUT, test_size=TEST_SIZE,
        random_state=RANDOM_STATE, n_jobs=N_JOBS, model_choice=MODEL_CHOICE
    )

    print("\nSummary results keys:", list(results.keys()))
    print("Test accuracy:", results['test_metrics']['accuracy'])
