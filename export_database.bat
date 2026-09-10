@echo off
REM Windows Batch Script - Database Export
REM Run this to export your database to a single SQL file

echo.
echo ========================================
echo  DATABASE EXPORT - Nouzen Clothes
echo ========================================
echo.

REM Load DATABASE_URL from .env
for /f "tokens=1,* delims==" %%a in ('type server\.env 2^>nul ^| findstr DATABASE_URL') do set %%a=%%b

if "%DATABASE_URL%"=="" (
    echo ERROR: DATABASE_URL not found in server/.env
    echo.
    echo Please set DATABASE_URL in server/.env file
    pause
    exit /b 1
)

REM Generate timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set mytime=%mytime: =0%
set TIMESTAMP=%mydate%_%mytime%

set OUTPUT_FILE=nouzen_database_%TIMESTAMP%.sql

echo Exporting database to: %OUTPUT_FILE%
echo.
echo This may take a few minutes...
echo.

REM Export database using pg_dump
pg_dump "%DATABASE_URL%" -F p -c --if-exists -O -x -f "%OUTPUT_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Database exported
    echo ========================================
    echo.
    echo File: %OUTPUT_FILE%
    echo Size:
    dir /-C "%OUTPUT_FILE%" | findstr /C:"%OUTPUT_FILE%"
    echo.
    echo To restore this backup:
    echo   psql -d nouzen_db -f %OUTPUT_FILE%
    echo.
) else (
    echo.
    echo ERROR: Export failed!
    echo.
    echo Make sure PostgreSQL is installed and pg_dump is in PATH
    echo Or run: set PATH=%PATH%;C:\Program Files\PostgreSQL\16\bin
    echo.
)

pause
