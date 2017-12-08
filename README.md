# quasar
A light version of the quasi app runtime that uses simple web files to generate a single html output. Intended to be used with small purpose html snippets and single paged websites, supporting only a single html, css, and js file for input. 

# Framework
QUASAR framework - a gulp based framework that imports html web files which injects template data into a compiled output of an html snippet _(or quasars)_.

# Install it
1. install nodejs
2. run `npm install`
3. run `bin/build`

# Run as a process
* optionally run `build/watch` to autoload json files to build quasars
* optionally run `bin/app --autoBuildWebForm=true` to run quasar as a process with a web api and form

## Templating with the files in the /assets folder
Files located in the /assets folder are used in build tasks for quasar ouput. The default target of a quasar is `${qType}.hml`, so if the quasar is of type 'page' then the default target would be `page.html`. Similarly, css and js assets are defaulted to `${qType}.css` and `${qType}.js` respectively. These default values can be overriden at runtime.

# Build
There is a build process for copying the assets to the ouput folder and then injecting files from the code folder into the output. Run `build` on the project to create the folder `build/public` to be served by the app.

# Vendors that really make this project possible
* phantom
* gulp

# Roadmap
## 1.0.0
### Features 
- [x] Upload to AWS buckets
- [x] Express based web UI with live preview for quasar building
- [ ] Bundler import (take a bunch of css, js, and html files and run them through webpack or rollup to get a single html, css, and js file on the other end -- probably shouldn't minify or uglify in this process)
- [ ] Asset mutation on output (minification, tree shaking, code splitting, uglification)
- [ ] Builder packaged as an electron application