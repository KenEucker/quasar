0.0.1 / 2017-11-24 (Thanksgiving Day!)
==================

  * Initial release

0.1.0 - initial refactor / 2017-11-26
==================

  * This is basically what Quasi should have been, a more simple pipeline. The scope creep of that project really torpedo'd it, but I like the ebb and flow and how it brought me to this point. I could actually see quasar become the underlying engine for Quasi, and Quasi becoming the quasar generation tool.

  0.4.0 - structure refactor / 2017-12-09
==================

  * This is the biggest set of functionality yet byeond the core, that brings with it a lot of breaking changes to make the core more robust. Heading towards a milestone of "0.5.0 robustness", this version introduces a more complex version of an example quasar, 'quasarWebform' that demonstrates; a precompile method, asset compiling for the html, css, and js files, accompanying files from the templates folder to be bundled as an express application complete with package.json, and other use cases not present in the more simple example, 'page' quasar. This quasar webForm is a client application that runs in the browser with a web api, in addition to the cli, [UNFINISHED]

   0.5.0 - robustness refactor / 2018-01-01
==================

  * Description changed to "a Quick, Usable, And Simple; Application Runtime" to fit the QUASAR acronym. 
  * This milestone represents a functional usage of quasar in the wild on a daily basis. From nothing to something, this milestone includes the following featureset:
    - build pipeline that globs html, js, and css files alongside imported assets and using templating to generate a single html outputFile that can be used as an Single Page Application.
    - globbed sources files can be minified on output.
    - template sourcefiles can be precompiled from the languages: mustache, sass, jsx into html, css, and javascript respectively.
    - application available as a process, a CLI app, an express webForm Application, and an express webApi; from the terminal, independently or concurrently.
    - application can be packaged into a multi-platform electron application.
    - every feature of the pipeline is available through the CLI which is the core of all functionality wrapped by the API and webForm and electron App.
