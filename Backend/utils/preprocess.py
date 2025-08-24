# utils/preprocess.py

def preprocess_input(data):
    try:
        return [
            int(data['no_of_dependents']),
            1 if data['education'].lower() == "graduate" else 0,
            1 if data['self_employed'].lower() == "yes" else 0,
            float(data['income_annum']),
            float(data['loan_amount']),
            float(data['loan_term']),
            float(data['cibil_score']),
            float(data['residential_assets_value']),
            float(data['commercial_assets_value']),
            float(data['luxury_assets_value']),
            float(data['bank_asset_value']),
        ]
    except Exception as e:
        raise ValueError("Invalid input data: " + str(e))
