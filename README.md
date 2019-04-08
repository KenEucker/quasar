# Quasar

<table>
<tr>
<td>Package</td><td>quasar</td>
</tr>
<tr>
<td>Description</td>
<td></td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 6.0.0 </td>
</tr>
<tr>
<td>Gulp Version</td>
<td>>= 4.0.0</td>

</tr>
</table>

Quasar is a build pipeline and application runtime that you can use to build web snippets of html with embedded javascript and css.

You can read more about this project:

[About Quasar](about/about.md)

[Command Line Interface](about/cli.md)

[API Documentation](about/scripts.md)

[Development Tutorials](about/development.md)

[Development Philosophy](about/philosophy.md)

[Development History](about/history.md)

[Development Roadmap](about/history.md)

# Run Quasar as an application

run `bin/app` to install and run the entire application in an electron app complete with api and webserver. You do not need to follow any additional steps if all you want to do is use quasar as an application.

# Install Quasar

1. install nodejs
2. run `yarn install` to install dependencies

# Use Quasar from command prompt

- run `bin/cli` to use the cli of quasar
- run `bin/watch` to automate jobs using json files in the /json folder
- run `bin/web` to run an api and web server with form @ http://localhost:3000

# Run Quasar as a process

1. run `bin/cli` to run the application as a process
   - optionall add the `--runAsDaemon=true` argument to run the web api or watch jobs tasks in the background
   - optionally add the `--runWebApi=true` argument to run the api @ http://localhost:2720
   - optionally add the `--watchJobs=true` argument to autoload json files to build quasars
   - optionally add the `--runWebform=true` to run the webform @ http://localhost:3000
   - optionally add the `--autoBuildWebForm=true` to build the quasarWebform task on startup
   - optionally add the `--autoBuildWebApp=true` to build the quasarWebApp task on startup
   - optionally add the `--reRun=true` to rebuild the last successfully run arguments back through quasar

# Package it as a standalone app

1. run `bin/package` to create an executable that you can distribute as a standalone application

# Templating with the files in the /assets folder

Files located in the /assets folder are used in build tasks for quasar ouput. The default target of a quasar is `${qType}.hml`, so if the quasar is of type 'page' then the default target would be `page.html`. Similarly, css and js assets are defaulted to `${qType}.css` and `${qType}.js` respectively. These default values can be overriden at runtime.

# Logging

Logging to the console from the CLI happens with data off by default and only the most top level messages. Other debug options are set with the argument `--log=` and available options are `ALL`,`DEBUG`,`NONE`,`NODATA`. Successful build outputs are logged in a '.log' file in the root of the project.

# Vendors that really make this project possible

- [gulp](https://github.com/gulpjs/gulp)
- [browserify](https://github.com/browserify/browserify)
- [dart-sass](https://github.com/sass/dart-sass)
- [mustache](https://github.com/janl/mustache.js)
- [babel](https://github.com/babel/babel)
- [react](https://github.com/facebook/react)
- [electron](https://github.com/electron/electron)
- [electron-packager](https://github.com/electron-userland/electron-packager)
