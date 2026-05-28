@echo off
SETLOCAL
pushd %~dp0

echo [1/2] Installing/Updating dependencies...
python -m pip install -r requirements.txt

echo [2/2] Starting FastAPI server...
python main.py

popd
ENDLOCAL
