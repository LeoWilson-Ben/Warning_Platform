@echo off
chcp 65001 >nul
title 一键启动：Django + FastAPI + Redis（当前窗口）

echo 正在启动 Redis...
start /b "" "redis-server.exe"

echo 启动 Django 项目（study 环境）...
call conda activate study
cd /d D:\pycharm\pythonprojects\Warning_Platform
start /b python manage.py runserver 127.0.0.1:8000
cd /d %~dp0

echo 启动 FastAPI 项目（tf_gpu 环境）...
call conda activate tf_gpu
cd /d D:\pycharm\pythonprojects\fastApiProject1
start /b uvicorn main:app --host 127.0.0.1 --port 8001 --reload
cd /d %~dp0

echo.
echo ✅ 所有服务已启动！浏览器访问：
echo ▶ Django: http://127.0.0.1:8000
echo ▶ FastAPI: http://127.0.0.1:8001/docs
pause
