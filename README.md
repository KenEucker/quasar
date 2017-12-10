# quasar
A light version of the quasi app runtime that uses simple web files to generate a single html output. Intended to be used with small purpose html snippets and single paged websites, supporting only a single html, css, and js file for input. 

# Framework
QUASAR framework - a gulp based framework that imports html web files which injects template data into a compiled output of an html snippet _(or quasars)_.

# Install it
1. install nodejs
2. run `npm install` to install dependencies

# Use it
run `bin/cli` to use the cli of quasar
run `bin/watch` to automate jobs using json files in the /json folder
run `bin/web` to run an api and web server with form @ http://localhost:3720
run `bin/app` to run the entire application in an electron app complete with api and webserver

# Run as a process
* optionally run `bin/watch` to autoload json files to build quasars
* optionally run `bin/app --autoBuildWebForm=true` to run quasar as a process with a web api and form

## Templating with the files in the /assets folder
Files located in the /assets folder are used in build tasks for quasar ouput. The default target of a quasar is `${qType}.hml`, so if the quasar is of type 'page' then the default target would be `page.html`. Similarly, css and js assets are defaulted to `${qType}.css` and `${qType}.js` respectively. These default values can be overriden at runtime.

# Development
Usefule commands:
* `bin/dev` will run `bin/clean` and then `bin/web` so you can test quasar output
* `bin/clean` will delete the assets and output folders. Use this if you want to do lib testing or new quasar development.
* `bin/app` takes the has the following default arguments that you can override the cli with --[arg]=[val] _(eg: --runAsProcess=true --runApi=true )_:
```
defaults = {
		port: process.env.PORT,
		runAsProcess: false,
		runStandalone: false,
		watchJobs: false,
		qType: false,
		runWebForm: false,
		autoBuildWebForm: false,
		runApi: false }
```
* there is a `.vscode/launch.json` file in the repository that enables debugging of the application in vscode. You can use the above arguments in your IDE and override any of the above arguments.


# Vendors that really make this project possible
* phantom
* gulp
* browserify
* dart-sass
* mustache
* babel
* react
* electron

# Roadmap
## 1.0.0
### Features 
- [x] Upload to AWS buckets
- [x] Express based web UI with live preview for quasar building
- [x] Asset compiler and bundler
- [x] Builder packaged as an electron application
- [ ] Asset mutation on output (minification, tree shaking, code splitting, uglification)