# Command Line Interface

## Install Dependencies

1. install nodejs
2. run `yarn install` to install dependencies

## CLI scripts

- run `bin/cli` to use the cli of quasar
- run `bin/watch` to automate jobs using json files in the /json folder
- run `bin/web` to run an api and web server with form @ http://localhost:3000

## CLI flags

`--port=3000` argument to set the port number to run the application on

`--runAsDaemon=true` argument to run the web api or watch jobs tasks in the background

`--runWebApi=true` argument to run the api @ http://localhost:3000

`--watchJobs=true` argument to autoload json files to build quasars

`--runWebform=true` to run the webform @ http://localhost:3000

`--autoBuildWebForm=true` to build the quasarWebform task on startup

`--autoBuildWebApp=true` to build the quasarWebApp task on startup

`--reRun=true` to rebuild the last successfully run arguments back through quasar
