@echo off
git init || exit /b
git checkout --orphan latest_branch || exit /b
git add . || exit /b
git commit -m "initial commit" || exit /b
git remote add origin https://github.com/PlumGame/plum.git || exit /b
git branch -m main || exit /b
git push -f origin main || exit /b
pause
