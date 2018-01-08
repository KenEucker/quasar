# quasar
A light version of the quasi app runtime that uses simple web files to generate a single html output. Intended to be used with small purpose html snippets and single paged websites, supporting only a single html, css, and js file for input. 

# Framework
QUASAR framework - a gulp based framework that imports html web files which injects template data into a compiled output of an html snippet _(or quasars)_.

# Run as an application
run `bin/app` to run the entire application in an electron app complete with api and webserver. You do not need to follow any additional steps if all you want to do is use quasar as an application.

# Development
Usefule commands:
* `bin/dev` will run `bin/clean` and then `bin/web` so you can test quasar output
* `bin/clean` will delete the outputFolder.
* `bin/cleanOutput` will delete the outputFolder.
* `bin/cleanDev` will delete the local development folders and the dist folder.
* `bin/app` takes the has the following default arguments that you can override the cli with --[arg]=[val] _(eg: --runAsProcess=true --runWebApi=true )_:
```
defaults = {
		port: process.env.PORT,
		runAsProcess: false,
		runStandalone: false,
		watchJobs: false,
		qType: false,
		runWebForm: false,
		autoBuildWebForm: false,
		runWebApi: false }
```
* there is a `.vscode/launch.json` file in the repository that enables debugging of the application in vscode. You can use the above arguments in your IDE and override any of the above arguments.

## Install it
1. install nodejs
2. run `npm install` to install dependencies

## Use it
* run `bin/cli` to use the cli of quasar
* run `bin/watch` to automate jobs using json files in the /json folder
* run `bin/web` to run an api and web server with form @ http://localhost:3720

## Run as a process
1. run `bin/cli --runAsProcess=true` to run the application as a process
	* optionally add the `--runWebApi=true` argument to run the api @ http://localhost:3720
	* optionally add the `--watchJobs=true` argument to autoload json files to build quasars
	* optionally add the `--runWebform=true` to run the webform @ http://localhost:3720
	* optionally add the `--autoBuildWebForm=true` to build the quasarWebform task on startup
	* optionally add the `--reRun=true` to rebuild the last successfully run arguments back through quasar

## Package it as a standalone app
1. run `bin/package` to create an executable that you can distribute as a standalone application

## Templating with the files in the /assets folder
Files located in the /assets folder are used in build tasks for quasar ouput. The default target of a quasar is `${qType}.hml`, so if the quasar is of type 'page' then the default target would be `page.html`. Similarly, css and js assets are defaulted to `${qType}.css` and `${qType}.js` respectively. These default values can be overriden at runtime.

## Logging
Logging to the console from the CLI happens with data off by default and only the most top level messages. Other debug options are set with the argument `--logSeverity=` and available options are `ALL`,`DEBUG`,`NONE`,`NODATA`. Successful build outputs are logged in a '.log' file in the root of the project.

# Vendors that really make this project possible
* [phantom](https://github.com/amir20/phantomjs-node)
* [gulp](https://github.com/gulpjs/gulp)
* [browserify](https://github.com/browserify/browserify)
* [dart-sass](https://github.com/sass/dart-sass)
* [mustache](https://github.com/janl/mustache.js)
* [babel](https://github.com/babel/babel)
* [react](https://github.com/facebook/react)
* [electron](https://github.com/electron/electron)
* [electron-packager](https://github.com/electron-userland/electron-packager)
# Roadmap
## 1.0.0
### Features 
- [x] Upload to AWS buckets
- [x] Express based web UI with live preview for quasar building
- [x] Asset compiler and bundler
- [x] Builder packaged as an electron application
- [x] Asset mutation on output (minification, tree shaking, code splitting, uglification)
- [ ] Image compression before upload
