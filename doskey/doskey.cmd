@echo off

DOSKEY gs=git status
DOSKEY gl=git pull $*
DOSKEY gp=git push $*
DOSKEY gf=git fetch $*
DOSKEY gr=git rebase $*
DOSKEY lg=git lg
DOSKEY glg=git glg
DOSKEY mci=mvn clean install $*
DOSKEY mcd=mvn clean deploy $*
DOSKEY jo=open jira $*
DOSKEY co=git co $*
DOSKEY =cls