@echo off

SETLOCAL
if "%1" == "" (
    SET openpath=%cd%
) else (
    SET openpath=%cd%\%1%
)

start /b "[IDEA]" "%IDEA_HOME%\idea64.exe" "%openpath%" &
ENDLOCAL