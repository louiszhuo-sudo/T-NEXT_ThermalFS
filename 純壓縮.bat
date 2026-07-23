@echo off
:: 設定編碼為 UTF-8，解決中文亂碼問題
chcp 65001 >nul
setlocal

:: 1. 執行 Thermal_FS_build.exe 並等待其結束
:: echo [Step 1] 正在執行 Thermal_FS_build.exe...
:: start /wait "" "Thermal_FS_build.exe"

:: 2. 獲取當前目錄名稱
for %%I in ("%CD%") do set "FOLDER_NAME=%%~nxI"

:: 3. 獲取並格式化時間 (YYYY-MM-DD_HHMMSS)
set "CUR_DATE=%date:~0,4%-%date:~5,2%-%date:~8,2%"
set "CUR_TIME=%time:~0,2%%time:~3,2%%time:~6,2%"
:: 處理小時小於 10 時可能產生的空白 (補0)
set "CUR_TIME=%CUR_TIME: =0%"
s
set "OUTPUT_NAME=%FOLDER_NAME%_%CUR_DATE%_%CUR_TIME%.7z"

:: 4. 設定 7-Zip 路徑
set ZIP_EXE="C:\Program Files\7-Zip\7z.exe"

echo.
echo [Step 2] 正在打包至: %OUTPUT_NAME%

:: 5. 執行打包
:: 使用 "-xr!..." 並確保在引號內，避免 ! 被批次檔錯誤解析
%ZIP_EXE% a -t7z "%OUTPUT_NAME%" "*" -mx=9 -ms=on "-xr!.git" "-xr!node_modules" "-x!*.7z"

echo.
if %ERRORLEVEL% EQU 0 (
    echo [Success] 任務已成功完成！
    echo 輸出檔案: %OUTPUT_NAME%
) else (
    echo [Error] 過程中出現錯誤，錯誤碼: %ERRORLEVEL%
)

pause