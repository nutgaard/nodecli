# NodeCLI

Forskjellige CLI-utils bygget med nodeJS.


#### For å sette opp
```
git clone ....
npm i
npm link
```


### Kommandoer
`npm link` setter opp flere ulike kommandoer som er tilgjengelige på ditt shell etter kommendoen er kjørt.
 
#### branch
```
branch list             - tilsvarende git branch -a
branch prune            - kjører 'git remote prune origin', og prøver deretter å finne alle lokale branches som ikke er på remote
```

#### commit
```
commit                  - Gir det ett preset at endrings-typer alà conventional-changelog
```

#### deploy
```
deploy <app> <miljø> <versjon> - Bestiller jira-deploy
```

#### deploydaemon
Denne er ikke nødvendig å kalle selv, alle andre kommandoer som deployer vil automatisk starte daemonen. 
```
deploydaemon status     - Status på daemon
deploydaemon start      - Start daemon
deploydaemon stop       - Stop daemon
deploydaemon kill       - Kill daemon
deploydaemon restart    - Restart daemon
```

#### open cisbl
```
# Om det bare er ett treff etter ett søk vil det bli åpnet automatisk. 
# Ved flere treff får man opp muligheten til å velge.
 
open cisbl . <suffix>   - Prøver å åpne cisbl utifra mappenavn og suffix 
open cisbl . pipeline   - I mappen mininnboks vil denne prøve å finne jobben `mininnboks-pipeline` 
open cisbl tps master   - Vil søke etter jobben tps-master og åpne denne.
```

#### open fasit
``` 
open fasit <query>      - Åpner https://fasit.adeo.no/search?q=<query> 
```

#### open fasit
``` 
open stash .            - Åpner stash basert på `git remote -v` (origin)
open stash [query]      - Søker etter repos, og viser muligheten for å velge hvilken du vil åpne of det er flere treff
```

#### open vera
``` 
open vera <query> [envs]    - Åpner vera basert <query> og [envs]
```

#### vera sjekk
vera kommandoene bruker `fuzzysearch` for å matche mot applikasjonene, i motsetning til vera.adeo.no som har nærmest eksakt match.
Dette betyr at `arb-tekster` og `arbtekster` begge matcher `veiledningarbeidssoker-tekster`, `veilarbportefoljeflatefs-tekster` og ett par til.
```
vera sjekk <query> <...envs>    - Viser samme tabell som `open vera <query> <envs>`
```

#### vera diff
Veldig lik `vera sjekk`, men filterer bort innslag hvor applikasjonen har samme versjon i miljøene
```
vera diff <query> <env1> <env2> - Viser alle applikasjoner som matcher <query> med forskjellige verjson i <env1> og <env2>
```

#### vera lift
Bruker `vera diff` for å finne applikasjoner, gir deg mulighet til å velge hvilke appliaksjoner som skal løftes, og bestiller så jira-deploy-saker
```
vera lift <query> <env1> <env2> - Løft alle applikasjoner som ikke er like fra <env1> til <env2>
```
