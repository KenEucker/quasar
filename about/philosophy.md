# Ethos

Web components should be isolated, self-contained, modular, consistent, pluggable, injectable, renderable, updatable, and testable. These things mean different, but separate, solutions for different people - but those differences between developers shouldn't hold hostage the stack and course of development in order to accomplish small website features and frontend solutions for larger applications. Data layer interactions, state management, api interactions, and the setup and teardown of components shouldn't be handled by the components themselves; this is a given.

To think that language, stack, or framework used to create a component should also dictate the implementation of the stack is limiting as well. As long as you know how to get access to the data, can make api interactions from a common core, be able to attach to global events, and have your render managed externally then you should be enabled to implement your component however you see fit. With the advent of transpilers like Babel and compilers like Sass, in addition to tools that do minification and tree shaking and code splitting, we can do a lot more to support the wide range of developer experience and comfort with different stacks and tools to build their frontends.

The architecture of view and view model separated by how data is set and how that data is rendered has always been littered with business rules and data processing before and after long term storage retrieval.

# Implementation Philosophy

_When writing a quasar_

`quasars` are build tasks that associate user provided data with template files in a pipeline to produce a single text file output. The output can have dependency files associated with it, or it can be a single, self contained, piece of code.

The base class for a quasar can be overloaded for your custom specifications or used in place and extended. By default, the build pipeline will run the following methods sequentially:

`validateRequiredArgs`

`build`

`cleanUp`

And, by default, each of those methods will follow the build pipeline from downloading or unpacking source files, verifying and setting required data, and cleaning up after moving and staging files. The build method in the base class, by default, does not produce an outputFile as this is a scaffolding class and the logic behind an outputFile is too specific to the implementation, in most cases, to be handled dynamically.

_When writing debris_

`debris` are text based assets that are injected into quasars in an ordered fashion as they are included, or directly as comments within the quasars template files using the convention below. Debris can be the file itself or it can be a manifest that points to a file src to either be included as a tag or downloaded and replaced inline with wrapping code (`.uri` file). Debris do not have access to template data at build time, so they must follow the practice of creating an initializing method for templated data to pass params to if they are needed.

To require or include debris in your template files use the following convention. A file that is included with require will only be included if it has not been included before. Files included with include will always be included.

```
//=require vendor/**/*.js

//=require relative/path/to/file.js

/*=include relative/path/to/file.css */

<!--=include relative/path/to/file.html -->
```

_When writing a template_

`templates` are the target files for each quasar build and can comprise the entire source of the quasar build or be partial components that wrap external sources for the desired output. Data is injected into template files during build time following the convention.

Template files can be lodash or \_ (underscore) templates and data is typically inserted in that way. These templating methods can be used in any template file type (js, css, html).
