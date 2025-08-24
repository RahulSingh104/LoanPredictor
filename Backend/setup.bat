@echo off
echo ================================
echo LoanPredictor Environment Setup
echo ================================

:menu
echo.
echo Select an option:
echo 1. Install runtime dependencies (backend only)
echo 2. Install dev dependencies (backend + ML)
echo 3. Run Flask backend
echo 4. Retrain model
echo 5. Clean cache files
echo 0. Exit
echo.

set /p choice="Enter choice: "

if "%choice%"=="1" (
    pip install -r requirements.txt
    goto menu
)
if "%choice%"=="2" (
    pip install -r requirements.txt -r requirements-dev.txt
    goto menu
)
if "%choice%"=="3" (
    flask --app app run --host 127.0.0.1 --port 5001
    goto menu
)
if "%choice%"=="4" (
    python utils\improved_train.py
    goto menu
)
if "%choice%"=="5" (
    del /s /q *.pyc
    for /d /r . %%d in (__pycache__) do @if exist "%%d" rd /s /q "%%d"
    goto menu
)

if "%choice%"=="6" (
    python utils\seed_data.py
    goto menu
)


if "%choice%"=="0" exit

goto menu
