@ECHO OFF
:loop
  echo.
  cls
  %*
  echo.
  timeout /t 5 > NUL
goto loop
