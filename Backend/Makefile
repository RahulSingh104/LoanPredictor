.PHONY: install install-dev run train clean

# Install only backend runtime deps
install:
	pip install -r requirements.txt

# Install backend + ML training deps
install-dev:
	pip install -r requirements.txt -r requirements-dev.txt

# Run Flask backend
run:
	flask --app app run --host 127.0.0.1 --port 5001

# Retrain model (using improved_train.py)
train:
	python utils/improved_train.py

# Clean Python cache and build files
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete


seed:
	python utils/seed_data.py

