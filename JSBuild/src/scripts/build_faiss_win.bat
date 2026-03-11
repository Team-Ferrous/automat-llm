@echo off
REM Check if WSL is installed
where wsl >nul 2>&1
IF ERRORLEVEL 1 (
    echo WSL not found. Installing...
    wsl --install
) ELSE (
    echo WSL is already installed.
)

REM Make the shell script executable
chmod +x setup_faiss_node.sh

REM Run the build script
sh build_faiss_wsl.sh