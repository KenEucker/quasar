# Getting Started With Quasar

## Install it

1. install nodejs
2. run `yarn install` to install dependencies

## Use it

- run `bin/cli` to use the cli of quasar
- run `bin/watch` to automate jobs using json files in the /json folder
- run `bin/web` to run an api and web server with form @ http://localhost:3000

## Run as a process

1. run `bin/cli` to run the application as a process
   - optionally add the `--runWebApi=true` argument to run the api @ http://localhost:2720
   - optionally add the `--watchJobs=true` argument to autoload json files to build quasars
   - optionally add the `--runWebform=true` to run the webform @ http://localhost:3000
   - optionally add the `--autoBuildWebForm=true` to build the quasarWebform task on startup
   - optionally add the `--autoBuildWebApp=true` to build the quasarWebApp task on startup
   - optionally add the `--reRun=true` to rebuild the last successfully run arguments back through quasar
