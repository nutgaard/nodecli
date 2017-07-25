@echo off

DOSKEY ls=dir /B
DOSKEY gs=git status
DOSKEY gl=git pull $*
DOSKEY gp=git push $*
DOSKEY lg=git lg
DOSKEY glg=git glg
DOSKEY mci=mvn clean install $*
DOSKEY =cls