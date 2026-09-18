@echo off
chcp 65001 > nul
title 유튜브 모바일 라이브 PC 관제탑

echo ========================================================
echo   🔴 유튜브 모바일 라이브 PC 관제탑 (Control Tower)
echo ========================================================
echo.
echo [1/3] 작업 폴더 확인 중...
cd /d "%~dp0"

echo [2/3] 프로덕션 빌드 확인...
if not exist "dist\index.html" (
    echo 빌드 파일이 없습니다. 새로 빌드합니다...
    call npm run build
)

echo [3/3] 브라우저 자동 실행 및 관제탑 서버 구동 중...
echo.
echo  ▶ PC 접속 주소   : http://localhost:5173/
echo  ▶ 스마트폰 접속  : http://192.168.45.114:5173/
echo    (스마트폰과 PC가 같은 와이파이에 연결되어 있을 때)
echo.
echo --------------------------------------------------------
echo 관제탑을 종료하려면 이 창을 닫거나 Ctrl+C를 누르세요.
echo --------------------------------------------------------
echo.

start http://localhost:5173/
call npm run preview
pause
