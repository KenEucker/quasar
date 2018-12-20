# Development History

## 0.0.1 / 2017-11-24 (Thanksgiving Day!)

- Initial release

## 0.1.0 - initial refactor / 2017-11-26

- This is basically what Quasi should have been, a more simple pipeline. The scope creep of that project really torpedo'd it, but I like the ebb and flow and how it brought me to this point. I could actually see quasar become the underlying engine for Quasi, and Quasi becoming the quasar generation tool.

## 0.4.0 - structure / 2017-12-09

- This is the biggest set of functionality yet byeond the core, that brings with it a lot of breaking changes to make the core more robust. Heading towards a milestone of "0.5.0 robustness", this version introduces a more complex version of an example quasar, 'quasar-webform' that demonstrates; a precompile method, asset compiling for the html, css, and js files, accompanying files from the templates folder to be bundled as an express application complete with package.json, and other use cases not present in the more simple example, 'page' quasar. This quasar webForm is a client application that runs in the browser with a web api, in addition to the cli, [UNFINISHED]

## 0.5.0 - robustness / 2018-01-01

- Description changed to "a Quick, Usable, And Simple; Application Runtime" to fit the QUASAR acronym.
- This milestone represents a functional usage of quasar in the wild on a daily basis. From nothing to something, this milestone includes the following featureset:
  - build pipeline that globs html, js, and css files alongside imported assets and using templating to generate a single html outputFile that can be used as an Single Page Application.
  - globbed sources files can be minified on output.
  - template sourcefiles can be precompiled from the languages: mustache, sass, jsx into html, css, and javascript respectively.
  - application available as a process, a CLI app, an express webForm Application, and an express webApi; from the terminal, independently or concurrently.
  - application can be packaged into a multi-platform electron application.
  - every feature of the pipeline is available through the CLI which is the core of all functionality wrapped by the API and webForm and electron App.

## 0.6.0 - architecture / 2018-07-07

- Major breaking change which now uses classes for each task, unifying core functionality across all tasks.
- This milestone represents a shift in the direction towards true modularity and abstraction of the core components of the quasar runtime, setting this project up for a future and final refactor before 1.0:
  - lib : The static utility methods that stores no knowledge of the objects it manipulates from outside of itself. This library can be shimmed, but is not a class because it shouldn't follow inheritance rules. The core functionality of the runtime lives here. The core functionality could later be refactored into a runtime object that has awareness of `QuasarTasksFactory` and compiles a build pipeline usng them.
  - api : The programmable interface to the core library. This could be refactored in the future to; take all of the functionality out of this file and put it into the runtime, include only passthrough methods for the runtime and lib.
  - cli : The orchestrator of the core library and api together. This could be refactored in the future to; take all of the functionality out of this file and put it into the runtime, be an orchestrator that is command based which uses the runtime.
  - config : The configuration object that is used with each `QuasarTask` and in the core library. This object contains absolute paths to environment files and folders.
  - electron : The electron wrapper around the cli and api for running an electron application for the `quasarWebform` or `quasarWebapp`.
  - task : The base class for each `QuasarTask` which contains core functionality of a task that is run by the runtime (or build pipeline).

## 0.7.0 - core / 2018-09-03

- Another breaking change, as now the core modules have been reorganized into their final v1.0.0 states. The functionality of these core modules are now locked and this version is the basis of what will become the contract with consumers. The API will evolve from here to include different use cases of the runtime as methods and will not include methods of the library directly.
- The core modules:
  - lib : The abstracted utility methods of the runtime live here.
  - runtime : the build pipeline that processes `QuasarTask`s.
  - api : The programmable interface to the core library and runtime.
  - cli : The orchestrator of the api and runtime.
  - web : the express application that takes POST requests and serves the `quasarWebform` or `quasarWebapp`.
  - config : The configuration object that is used with each `QuasarTask` to load lib methods.
  - task : The base class for each `QuasarTask` that is processed by the runtime.
  - electron : The electron wrapper around the cli and api for running an electron application for the `quasarWebform` or `quasarWebapp`.

## 0.8.0 - programmable interface / TBD

- The `QuasarApi` class functionality is now purely defined within the class and each method of the runtime is overloaded 1:1. Documentation of the API is available to built using the `api-docs` quasar on the scripts folder and exists in the `about/scripts.md` file. The API offers the following quasar build pipeline functionality to be used by quasars:
  - load and run quasars
  - log information with quasar for debugging and progress reporting
  - clean (delete) public and build folders
  - move files between quasar temporary build and public folders
  - compile assets into singular file within assets folder to be used in the outputFile
  - inject debris, required, and included files within the template files
  - download and unpack source files to assets folder
  - output to HTML, JSON, and TXT file pipeline methods
  - upload outputFiles to S3 and Dropbox

## 0.9.0 - webform and application / TBD

## 1.0.0 - Version 1 / TBD

- Quasar Runtime and web interface is complete for the original roadmap:

  - Upload to AWS buckets
  - Express based web UI with live preview for quasar building
  - Asset compiler and bundler
  - Builder packaged as an electron application
  - Asset mutation on output (minification, tree shaking, code splitting, uglification)
  - Command line interface and bin files for local use of the runtime
  - Application Programmable Interface for use in production applicaitons as a build utility
  - Web Form interface to run quasars in a browser with a simple menu and form which use the API
  - SAAS application suite for all things Quasar including plugins that consume the API and middleware that uses the core modules.

- Version 1 lifecycle:
  - Locked functionality across runtime and API. No new runtime methods. No new `QuasarTask` methods, no new external lib methods.
  - Contract with consuming developers locked at version 1 of `QuasarTask` base methods and fields.
  - No refactors of the architecture or core modules allowed.
  - Version will see minor and patch updates for as long as the code is being used in production environments.
