/**
 * @file quasar.js
 * @author Ken Eucker <keneucker@gmail.com>
 */

const gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	inject = require('gulp-inject-string'),
	insert = require('gulp-insert'),
	concat = require('gulp-concat'),
	flatmap = require('gulp-flatmap'),
	mustache = require('gulp-mustache'),
	cleanCSS = require('gulp-clean-css'),
	include = require('gulp-include'),
	beautify = require('gulp-html-beautify'),
	browserify = require('gulp-browserify'),
	babel = require('gulp-babel'),
	del = require('del'),
	unzip = require('extract-zip'),
	path = require('path'),
	htmlMin = require('html-minifier'),
	colors = require('colors'),
	fs = require('fs'),
	yargs = require('yargs'),
	asciiArt = require('asciiart-logo'),
	mkdir = require('mkdirp-sync'),
	tryRequire = require('try-require'),
	lib = require(path.resolve(`${__dirname}/lib.js`)),
	QuasarConfig = require(path.resolve(`${__dirname}/config.js`));
// QuasarTask = require(path.resolve(`${__dirname}/task.js`));

const STATUS_CREATED = 'created',
	STATUS_QUEUED = 'queued',
	STATUS_COMPLETED = 'completed',
	STATUS_FAILED = 'failed';

/**
 * @classdesc The quasar Runtime [use the quasar API, not this class directly].
 * @description the build pipeline of the quasar framework
 * @export
 * @hideconstructor
 * @class QuasarRuntime
 * @requires gulp for handling streams and globbing files
 * @requires gulp-template for inserting the quasArgs data into templates
 * @requires gulp-rename for naming output files
 * @requires gulp-inject-string for inserting content into templates at specific locations
 * @requires gulp-insert for inserting content into templates at any location
 * @requires gulp-concat for concatenating streams into a single output
 * @requires gulp-flatmap for making file specific modifications in streams
 * @requires gulp-mustache for processing mustache html templates with template data
 * @requires gulp-clean-css for formatting css outputFiles
 * @requires gulp-include for requiring and including files into outputFiles at build time
 * @requires gulp-html-beautify for formatting tabbing and newlines in html outputFiles
 * @requires gulp-bro for compiling jsx files ahead of build time
 * @requires gulp-babel for compiling es6 javascript at ahead of build time
 * @requires gulp-s3-upload for uploading outputFiles to Amazon AWS S3
 * @requires gulp-dropbox for uploading outputFiles to Dropbox
 * @requires gulp-download-files for downloading sourceFiles from a url
 */
class QuasarRuntime {
	constructor(config) {
		/** @type {QuasarConfig} */
		this.config = config || new QuasarConfig();

		const quasarPackageJsonPath = path.resolve(`${this.config.moduleRoot}/package.json`);
		const quasarPackageJson = require(quasarPackageJsonPath);

		if (quasarPackageJson) {
			/** @type {string} */
			this.quasarRuntimeVersion = quasarPackageJson.version;

			if (yargs.argv['showRuntimeLogo']) {
				this.logQuasarLogo('QUASAR', quasarPackageJson, 'white');
			}
		} else {
			this.debug('quasar package json not found', quasarPackageJsonPath);
		}

		/** @type {string} */
		this.STATUS_COMPLETED = STATUS_COMPLETED;
		/** @type {string} */
		this.STATUS_CREATED = STATUS_CREATED;
		/** @type {string} */
		this.STATUS_FAILED = STATUS_FAILED;
		/** @type {string} */
		this.STATUS_QUEUED = STATUS_QUEUED;
	}

	/**
	 * @description cleans local files in the application root for development testing
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	cleanDevFolders() {
		const devPaths = [
			`${this.config.applicationRoot}/app`,
			`${this.config.applicationRoot}/dist`,
			`${
			this.config.applicationRoot
			}/templates/quasar-webform/quasar-webform.mustache.json`
		];
		this.debug('will cleanDevFolders', devPaths);
		return lib.cleanPaths(devPaths);
	}

	/**
	 * @description deletes the contents of the output root folder and all subdirectories
	 * @param {QuasArgs} quasArgs
	 * @param {boolean} [allFolders=false]
	 * @async
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	cleanOutputFolders(allFolders = false) {
		const outputFolders = allFolders ?
			path.resolve(`${this.config.outputFolder}/`, `../`) :
			this.config.outputFolder;
		this.debug('will cleanOutputFolders', outputFolders);
		return lib.cleanPaths(`${outputFolders}`, true);
	}

	/**
	 * @description deletes the contents of the assets folder for this quasar
	 * @param {QuasArgs} quasArgs
	 * @param {string} subdirectory
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	cleanAssetsFolder(quasArgs, subdirectory) {
		const cleanFolder = `${quasArgs.assetsFolder}${subdirectory ? `/${subdirectory}` : ''}`;
		this.debug(`will delete all files in the output path`, cleanFolder);
		return lib.cleanPaths(cleanFolder, true);
	}

	/**
	 * @description Compiles jsx templates in the templates folder and outputs the targetFile into the assets folder.
	 * @param {QuasArgs} quasArgs
	 * @param {array|string} files gulp src input
	 * @param {string} outputFilename
	 * @returns {Promise} gulp chain
	 * @memberof QuasarRuntime
	 */
	compileScriptsToAssetsFolder(quasArgs, files, outputFilename) {
		this.debug('will compileScriptsToAssetsFolder');

		if (!files) {
			files = `/**/*.jsx`;
		}
		if (!outputFilename) {
			outputFilename = `${quasArgs.qType}.js`;
		}
		process.env.BABEL_ENV = 'development';

		return (
			gulp
				.src(`${quasArgs.templatesFolder}/${files}`)
				// Make it useful
				.pipe(
					babel({
						presets: ['env', 'react'], //, 'babel-preset-react-app', 'syntax-dynamic-import' ],
					})
				)
				.on(
					'error',
					function (err) {
						this.logError('js compilation error:', err);
					}.bind(this)
				)
				// Make it compatible
				.pipe(
					browserify({
						ignoreMissing: true,
						noBuiltins: true,
						noCommondir: true
					})
				)
				.on(
					'error',
					function (err) {
						this.logError('js compilation error:', err);
					}.bind(this)
				)
				// Bundle source files
				.pipe(
					concat(outputFilename, {
						newLine: `;\n`
					})
				)
				// Ouput single file in asset folder for use with build task
				.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
				.on(
					'error',
					function (err) {
						this.logError('js compilation error:', err);
					}.bind(this)
				)
				.on(
					'end',
					function () {
						this.logInfo(
							`Scripts compiled into ${quasArgs.assetsFolder}/${
							quasArgs.qType
							}.js`
						);
					}.bind(this)
				)
		);
	}

	/**
	 * @description Compiles sass templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.
	 * @param {QuasArgs} quasArgs
	 * @param {array|string} files gulp src input
	 * @param {string} outputFilename
	 * @returns {Promise} gulp chain
	 * @memberof QuasarRuntime
	 */
	compileStylesToAssetsFolder(quasArgs, files, outputFilename) {
		this.debug('will compileStylesToAssetsFolder');

		if (!files) {
			files = `/**/*.scss`;
		}
		if (!outputFilename) {
			outputFilename = `${quasArgs.qType}.css`;
		}
		return (
			gulp
				.src(`${quasArgs.templatesFolder}/${files}`)
				// Compile sass
				.pipe(lib.sassify())
				.on(
					'error',
					function (err) {
						this.logError('css compilation error', err);
					}.bind(this)
				)
				.pipe(cleanCSS())
				.on(
					'error',
					function (err) {
						this.logError('css compilation error', err);
					}.bind(this)
				)
				// Bundle source files
				.pipe(concat(outputFilename))
				// Ouput single file in asset folder for use with build task
				.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
				.on(
					'error',
					function (err) {
						this.logError('css compilation error', err);
					}.bind(this)
				)
				.on(
					'end',
					function () {
						this.logInfo(
							`Styles compiled into ${quasArgs.assetsFolder}/${
							quasArgs.qType
							}.css`
						);
					}.bind(this)
				)
		);
	}

	/**
	 * @description compiles mustache templates in the templates folder, using json files for data input which mirror the input filenames, and outputs the targetFile into the assets folder.
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise} gulp chain
	 * @memberof QuasarRuntime
	 */
	compileTargetFileToAssetsFolder(quasArgs) {
		this.debug('will compileTargetFileToAssetsFolder');

		return (
			gulp.src(`${quasArgs.templatesFolder}/**/*.mustache`)
				// Compile mustache file
				.pipe(
					flatmap((stream, file) => {
						const filename = `${file.path}.json`;
						if (fs.existsSync(filename)) {
							return stream.pipe(mustache(filename, {}, {}));
						} else {
							return stream.pipe(mustache());
						}
					})
				)
				.on(
					'error',
					function (err) {
						this.logError('html compilation error', err);
					}.bind(this)
				)
				// Bundle source files
				.pipe(
					concat(`${quasArgs.qType}.html`), {
						newLine: `<!-- Section -->`
					}
				)
				// Ouput single file in asset folder for use with build task
				.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
				.on(
					'error',
					function (err) {
						this.logError('html compilation error', err);
					}.bind(this)
				)
				.on(
					'end',
					function () {
						this.logInfo(
							`Documents compiled into ${quasArgs.assetsFolder}/${
							quasArgs.qType
							}.html`
						);
					}.bind(this)
				)
		);
	}

	/**
	 * @description converts the quasar prompt into a json schema form object
	 * @private
	 * @param {object} prompt
	 * @returns {object} json schema form object
	 */
	convertPromptToJsonSchemaFormProperty(prompt) {
		return lib.convertPromptToJsonSchemaFormProperty(prompt);
	}

	/**
	 * @description converts the quasar prompt into a json schema form object
	 * @private
	 * @param {object} prompt
	 * @returns {object} json schema form object
	 */
	convertPromptToJsonSchemaUIFormProperty(prompt) {
		return lib.convertPromptToJsonSchemaUIFormProperty(prompt);
	}

	/**
	 * @description copies files from the assets folder to the output folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @param {*} files
	 * @param {*} excludeFiles
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyFilesFromAssetsFolderToOutput(quasArgs, files, excludeFiles = [], excludeTemplateFiles = true) {
		this.debug('will copyFilesFromAssetsFolderToOutput');

		if (excludeTemplateFiles) {
			excludeFiles = excludeFiles.concat([
				`${quasArgs.target}`,
				`${quasArgs.qType}.html`,
				`${quasArgs.qType}.css`,
				`${quasArgs.qType}.js`,
				`${quasArgs.oType}.html`,
				`${quasArgs.oType}.css`,
				`${quasArgs.oType}.js`,
			]);
		}

		return this.copyFilesToOutputFolder(
			quasArgs,
			quasArgs.assetsFolder,
			files,
			excludeFiles
		);
	}

	/**
	 * @description copies files the sources folder to the output folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @param {*} [files=null]
	 * @param {*} [excludeFiles=[]]
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyFilesFromSourcesFolderToOutput(
		quasArgs,
		files = null,
		excludeFiles = []
	) {
		this.debug('will copyFilesFromSourcesFolderToOutput');

		return new Promise(
			function (resolve) {
				if (!files && quasArgs.source && quasArgs.source.length) {
					if (quasArgs.sourceExt === '.zip') {
						this.logInfo(
							`unpacking files from archive ${quasArgs.source}${
							quasArgs.sourceExt
							}`
						);
						return this.unpackSourceFiles(quasArgs)
							.then(
								function () {
									return this.copyFilesFromAssetsFolderToOutput(quasArgs, [
										'**'
									]);
								}.bind(this)
							)
							.then(resolve)
							.catch(
								function (err) {
									this.logError('unpack error:', err);
								}.bind(this)
							);
					}
				} else {
					return resolve();
				}

				files = [`${quasArgs.source}${quasArgs.sourceExt}`];
				return this.copyFilesToOutputFolder(
					quasArgs,
					quasArgs.sourcesFolder,
					files,
					excludeFiles
				).then(resolve);
			}.bind(this)
		);
	}

	/**
	 * @description copies files from the templates folder to the assets folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @param {*} files
	 * @param {*} [excludeFiles=[]]
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyFilesFromTemplatesFolderToAssetsFolder(
		quasArgs,
		files,
		excludeFiles = []
	) {
		this.debug('will copyFilesFromTemplatesFolderToAssetsFolder');

		return lib.copyFilesFromFolderToFolder(
			quasArgs.templatesFolder,
			quasArgs.assetsFolder,
			files,
			excludeFiles
		);
	}

	/**
	 * @description copies files from the templates folder to the output folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @param {*} files
	 * @param {*} [excludeFiles=[]]
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyFilesFromTemplatesFolderToOutput(quasArgs, files, excludeFiles = []) {
		this.debug('will copyFilesFromTemplatesFolderToOutput');

		return this.copyFilesToOutputFolder(
			quasArgs,
			quasArgs.templatesFolder,
			files,
			excludeFiles
		);
	}

	/**
	 * @description copies files from a directory to the output folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @param {*} fromDirectory
	 * @param {*} files
	 * @param {*} [excludeFiles=[]]
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyFilesToOutputFolder(quasArgs, fromDirectory, files, excludeFiles = []) {
		const destinationPath = this.getQuasarOutputPath(quasArgs);

		this.debug('will copyFilesToOutputFolder', destinationPath)

		return lib.copyFilesFromFolderToFolder(
			fromDirectory,
			destinationPath,
			files,
			excludeFiles
		);
	}

	/**
	 * @description copies files from the templates folder to the assets folder given the quasArgs folder information
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	copyTemplateFilesToAssetsPath(quasArgs) {
		let targetFilePath = fs.existsSync(quasArgs.targetFilePath) ?
			quasArgs.targetFilePath :
			this.findTargetFile(quasArgs);

		this.debug('will copyTemplateFilesToAssetsPath', targetFilePath);

		const getDefaultAssetFileNames = name => {
			return {
				cssAssetFile: `${name}.css`,
				cssPreAssetFile: `pre${name}.css`,
				cssPostAssetFile: `post${name}.css`,
				jsAssetFile: `${name}.js`,
				jsPreAssetFile: `pre${name}.js`,
				jsPostAssetFile: `post${name}.js`
			};
		};

		const templateFiles = getDefaultAssetFileNames(quasArgs.qType);
		const oTypeTemplateFiles = getDefaultAssetFileNames(quasArgs.oType);

		mkdir(quasArgs.assetsFolder);
		this.debug(
			`will copy template files to assetsFolder`,
			quasArgs.assetsFolder
		);
		return lib
			.copyFilesFromFolderToFolder(
				quasArgs.templatesFolder,
				quasArgs.assetsFolder,
				Object.values(templateFiles)
			)
			.then(
				lib.copyFilesFromFolderToFolder(
					quasArgs.templatesFolder,
					quasArgs.assetsFolder,
					Object.values(oTypeTemplateFiles)
				)
			)
			.then(
				function () {
					// Discover the target file
					if (fs.existsSync(targetFilePath)) {
						if (
							quasArgs.overwriteTargetFileFromTemplate &&
							targetFilePath ===
							path.resolve(`${quasArgs.assetsFolder}/${quasArgs.qType}.html`)
						) {
							const templateTargetFilePath = path.resolve(
								`${quasArgs.templatesFolder}/${quasArgs.qType}.html`
							);

							if (fs.existsSync(templateTargetFilePath)) {
								this.logInfo(
									`clobbering with template targetFile ${templateTargetFilePath}`
								);
								targetFilePath = templateTargetFilePath;
							}
						}

						const outfile1 = fs.readFileSync(targetFilePath, 'utf-8');
						const target = path.basename(targetFilePath);
						const outputTargetFilePath = path.resolve(`${quasArgs.assetsFolder}/${target}`);

						if (outfile1) {
							this.logInfo(
								`copying target file from ${targetFilePath} to assets path: ${outputTargetFilePath}`
							);
							fs.writeFileSync(outputTargetFilePath, outfile1);
							quasArgs.targetFilePath = outputTargetFilePath;
							quasArgs.target = target;
						} else {
							this.logError(
								`could not read targetFile for copying to assets path ${targetFilePath}`
							);
							quasArgs.targetFilePath = targetFilePath;
						}
					}

					// Discover default assets, checking the outputType first before
					// using the qType asset files, then assign them to the quasArgs
					// if a match is found
					for (var i in templateFiles) {
						if (
							fs.existsSync(`${quasArgs.assetsFolder}/${oTypeTemplateFiles[i]}`)
						) {
							quasArgs[i] = oTypeTemplateFiles[i];
						} else if (
							fs.existsSync(`${quasArgs.assetsFolder}/${templateFiles[i]}`)
						) {
							quasArgs[i] = templateFiles[i];
						}
					}

					return quasArgs;
				}.bind(this)
			);
	}

	/**
	 * @description creates the required folders for building outputs
	 * @memberof QuasarRuntime
	 */
	createOutputFolders() {
		mkdir(this.config.jobsFolder);
		mkdir(this.config.outputFolder);
		mkdir(this.config.sourcesFolder);
		mkdir(this.config.assetsFolder);
		mkdir(`${this.config.jobsFolder}/${this.STATUS_CREATED}`);
		mkdir(`${this.config.jobsFolder}/${this.STATUS_COMPLETED}`);
		mkdir(`${this.config.jobsFolder}/${this.STATUS_QUEUED}`);
		mkdir(`${this.config.jobsFolder}/${this.STATUS_FAILED}`);
	}

	/**
	 * @description makes a call to log and is used as a canary for testing
	 * @param {string} message
	 * @param {object} obj
	 * @param {string} condition
	 * @memberof QuasarRuntime
	 */
	debug(message, obj, condition) {
		lib.debug(message, obj, condition);
	}

	/**
	 * @description downloads source files from a url into the sources folder to be used at build time
	 * @param {QuasArgs} quasArgs
	 * @param {string} url
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	downloadFileFromUrlToSourcesFolder(quasArgs, url) {
		var sourceFile = quasArgs.source;

		this.debug('will downloadFileFromUrlToSourcesFolder', quasArgs.sourcesFolder);

		var indexOfLastSlash = sourceFile.lastIndexOf('/');
		var indexOfQueryStringStart = sourceFile.lastIndexOf('?');
		const filename = sourceFile.substr(
			indexOfLastSlash + 1,
			indexOfQueryStringStart - indexOfLastSlash - 1
		);

		return new Promise(resolve => {
			lib.downloadFile(url, quasArgs.sourcesFolder, filename)
				.then(function () {
					resolve(filename);
				})
				.catch(function (e) {
					this.logCritical('Downloading file caused error', e);
				}.bind(this));
		});
	}

	/**
	 * @description downloads source files from a url into the sources folder to be used at build time
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	downloadSourceFilesToSourcesFolder(quasArgs) {
		this.debug('will downloadSourceFilesToSourcesFolder', quasArgs.source);

		return new Promise(
			async function (resolve) {
				// Loop through all source variables (file prompts)
				if (quasArgs.source) {
					// Check if the source is a URL
					const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;
					if (urlRegex.test(quasArgs.source)) {
						// Check if dropbox link
						if (quasArgs.source.indexOf('dropbox')) {
							// set the end of the url to a download, then download
							// the file
							quasArgs.source = decodeURIComponent(quasArgs.source).replace(
								'?dl=0',
								'?dl=1'
							);
						}
						this.logInfo(
							'source file is a URL, downloading from',
							quasArgs.source
						);
						var filename = await this.downloadFileFromUrlToSourcesFolder(
							quasArgs,
							quasArgs.source
						);
						quasArgs.source = filename;
					}
				}

				resolve(quasArgs);
			}.bind(this)
		);
	}

	/**
	 * @description searches for a target file in the various available folders by name, qType, oType, and extension until it finds one
	 * @param {QuasArgs} quasArgs
	 * @param {string} nextPath
	 * @param {string} originalPath
	 * @param {string} exhausted
	 * @returns {string}
	 * @memberof QuasarRuntime
	 */
	findTargetFile(quasArgs) {
		let targetFilePath = quasArgs.targetFilePath;

		if (!fs.existsSync(targetFilePath)) {
			const targetFileInAssetsFolder = lib.fromDir(quasArgs.assetsFolder, quasArgs.target);
			const oTypeFileInAssetsFolder = lib.fromDir(quasArgs.assetsFolder, quasArgs.oType, '.html');
			const oTypeFileInTemplatesFolder = lib.fromDir(quasArgs.templatesFolder, quasArgs.oType, '.html');
			const qTypeFileInAssetsFolder = lib.fromDir(quasArgs.templatesFolder, quasArgs.qType, '.html');
			const qTypeFileInTemplatesFolder = lib.fromDir(quasArgs.templatesFolder, quasArgs.qType, '.html');
			const anyHtmlFileInAssetsFolder = lib.fromDir(quasArgs.assetsFolder, null, '.html');
			const anyHtmlFileInTemplatesFolder = lib.fromDir(quasArgs.templatesFolder, null, '.html');

			targetFilePath =
				oTypeFileInAssetsFolder ||
				oTypeFileInTemplatesFolder ||
				qTypeFileInAssetsFolder ||
				qTypeFileInTemplatesFolder ||
				anyHtmlFileInAssetsFolder ||
				anyHtmlFileInTemplatesFolder;
		}


		this.logInfo(`targetFile for templating is: ${targetFilePath}`);

		return path.resolve(targetFilePath);
	}

	/**
	 * @description gets the filenames of the source extension type from the sources folder
	 * @param {QuasArgs} quasArgs
	 * @returns {array} list of filenames from sources folder
	 * @memberof QuasarRuntime
	 */
	getAvailableSourceFilenames(quasArgs) {
		return lib.getFilenamesInDirectory(quasArgs.sourcesFolder, [
			quasArgs.sourceExt.substr(1)
		]);
	}

	/**
	 * @description gets the debris filenames from the debris folder
	 * @param {QuasArgs} quasArgs
	 * @returns {array} list of filenames from debris folder
	 * @memberof QuasarRuntime
	 */
	getAvailableDebrisFilenames(quasArgs) {
		return lib.getFilenamesInDirectory(quasArgs.debrisFolder);
	}

	/**
	 * @description gets an array of the loaded task names
	 * @returns {array}
	 * @memberof QuasarRuntime
	 */
	getAvailableTaskNames() {
		return Array.prototype.map.call(this.config.tasks, task => {
			return task.qType;
		});
	}

	/**
	 * @description gets the outputPath for quasars
	 * @param {QuasArgs} [quasArgs={}]
	 * @returns {string}
	 * @memberof QuasarRuntime
	 */
	getQuasarOutputPath(quasArgs = {}) {
		const outputSubdirectory =
			quasArgs.domain.length && quasArgs.signature.length ?
				`${quasArgs.domain}/${quasArgs.signature}` :
				'';
		return `${quasArgs.outputFolder.replace(path.resolve(`${quasArgs.outputFolder}../`), '')}/${outputSubdirectory}`;
	}

	/**
	 * @description gets the task names from the tasks folder
	 * @param {string} [dir=null]
	 * @returns {array}
	 * @memberof QuasarRuntime
	 */
	getTaskNames(dir) {
		if (!dir) {
			dir = path.resolve(this.config.quasarsFolder);
		}

		return lib.getFilenamesInDirectory(dir, ['js'], true);
	}

	getRunArgs(quasArgs) {
		const runArgs = {
			qType: quasArgs.qType,
			oType: quasArgs.oType,
			...quasArgs.fromFile,
		};

		quasArgs.requiredArgs.forEach(arg => {
			const argIsSetAndNotTheDefault = (arg.default && arg.default !== quasArgs[arg.name]);
			const argIsSetAndDefaultIsNothing = ((!arg.default || arg.default == '') && quasArgs[arg.name]);
			if (argIsSetAndNotTheDefault || argIsSetAndDefaultIsNothing) {
				runArgs[arg.name] = quasArgs[arg.name];
			}
		});

		return runArgs;
	}

	/**
	 * @description gets task names associated with the oType field
	 * @param {array} taskNames
	 * @param {boolean} [orderByQuasar=false]
	 * @returns {object}
	 * @memberof QuasarRuntime
	 */
	getTasksAssociatedByOutputType(taskNames, orderByQuasar = false) {
		taskNames = taskNames || getTaskNames() || [];
		const associations = [];

		for (var task of taskNames) {
			let resolvedFilePath = tryRequire.resolve(task);
			resolvedFilePath = resolvedFilePath ? `${resolvedFilePath}.js` : null;

			if (!resolvedFilePath) {
				resolvedFilePath = tryRequire.resolve(
					`${_config.quasarsFolder}/${task}.js`
				);
			}

			if (resolvedFilePath) {
				const TaskClass = require(resolvedFilePath);
				TaskClass.oTypes.map(oType => {
					if (orderByQuasar) {
						associations[TaskClass.qType] = associations[TaskClass.qType] || [];
						if (associations[TaskClass.qType].indexOf(oType) !== -1) {
							associations[TaskClass.qType].push(oType);
						}
					} else {
						associations[oType] = associations[oType] || [];
						if (associations[oType].indexOf(qType) !== -1) {
							associations[oType].push(TaskClass.qType);
						}
					}
				});
			}
		}

		return associations;
	}

	/**
	 * @description Injects asset file references into the output file in the assets folder.
	 * @param {QuasArgs} quasArgs
	 * @returns {object} the quasargs used
	 * @memberof QuasarRuntime
	 */
	injectCode(quasArgs) {
		this.debug('will injectCode');

		return new Promise(
			function (resolve, reject) {
				const urlToPrependCDNLink = quasArgs.target ?
					quasArgs.target.replace('.html', '') :
					quasArgs.targetFilePath
						.split('/')
						.pop()
						.replace('.html', '');
				const cdnTemplate = `<%= cdnUrlStart %><%= bucketPath %>/`;

				this.logInfo(
					'injecting code prior to applying template parameters',
					quasArgs
				);
				this.logInfo(
					`getting assets from assets folder`,
					quasArgs.assetsFolder
				);
				this.logInfo(
					`getting template file`,
					`${quasArgs.targetFilePath.replace(quasArgs.assetsFolder, '')}`
				);
				this.logInfo(
					`injecting style assets`,
					`${quasArgs.cssAssetFile ? ` css:${quasArgs.cssAssetFile}` : ''}${
					quasArgs.cssPreAssetFile ? ` pre:${quasArgs.cssPreAssetFile}` : ''
					}${
					quasArgs.cssPostAssetFile
						? ` post:${quasArgs.cssPostAssetFile}`
						: ''
					} `
				);
				this.logInfo(
					`injecting script assets`,
					`${quasArgs.jsAssetFile ? ` js:${quasArgs.jsAssetFile}` : ''}${
					quasArgs.jsPreAssetFile ? ` pre:${quasArgs.jsPreAssetFile}` : ''
					}${
					quasArgs.jsPostAssetFile ? ` post:${quasArgs.jsPostAssetFile}` : ''
					} `
				);

				return gulp
					.src(quasArgs.targetFilePath, {
						base: this.config.applicationRoot
					})
					.on(
						'error',
						function (err) {
							this.logCritical('injection error', err);
						}.bind(this)
					)
					.pipe(inject.before(`${urlToPrependCDNLink}.`, cdnTemplate))
					.on(
						'error',
						function (err) {
							this.logCritical('injection error', err);
						}.bind(this)
					)
					.pipe(
						insert.transform(
							function (contents) {
								contents = this.injectDebrisFilesIntoStream(quasArgs, contents);
								contents = this.injectRequiredFilesIntoStream(
									quasArgs,
									contents
								);

								return contents;
							}.bind(this)
						)
					)
					.on(
						'error',
						function (err) {
							this.logCritical('injection error', err);
						}.bind(this)
					)
					.pipe(
						inject.append(
							`<!-- Generated by quasar (v${this.config.quasarVersion}) on: ${Date()} by: ${quasArgs.buildUser} -->`
						)
					)
					.pipe(gulp.dest(this.config.applicationRoot))
					.on(
						'error',
						function (err) {
							this.logCritical('injection error', err);
							quasArgs = this.logArgsToFile(quasArgs, null, true);
							return reject(quasArgs);
						}.bind(this)
					)
					.on(
						'end',
						function (msg) {
							this.logSuccess('injection pipeline ended successfully');
							return resolve(quasArgs);
						}.bind(this)
					);
			}.bind(this)
		);
	}

	/**
	 * @description Injects require statements for debris.
	 * @param {QuasArgs} quasArgs
	 * @param {stream} contents
	 * @param {boolean} [minify=false]
	 * @returns {stream} the stream written to
	 * @memberof QuasarRuntime
	 */
	injectDebrisFilesIntoStream(quasArgs, contents, insertAfter = true, minify = false) {
		this.debug('will injectDebrisFilesIntoStream', quasArgs.debris);

		const styleInjectionLocation = quasArgs.cssInjectTargets.length ?
			quasArgs.cssInjectTargets[0] :
			quasArgs.cssInjectTargets;
		const scriptInjectionLocation = quasArgs.jsInjectTargets.length ?
			quasArgs.jsInjectTargets[0] :
			quasArgs.jsInjectTargets;

		for (var debrisFile of quasArgs.debris.reverse()) {
			switch (path.extname(debrisFile)) {
				case '.css':
					contents = lib.injectTagStringIntoString(
						`/*=require ${debrisFile} */`,
						contents,
						styleInjectionLocation,
						'style',
						insertAfter
					);
					break;
				case '.js':
					contents = lib.injectTagStringIntoString(
						`/*=require ${debrisFile} */`,
						contents,
						scriptInjectionLocation,
						'script'
					);
					break;
			}
		}

		return contents;
	}

	/**
	 * @description Injects require statements for the default asset files (css and js).
	 * @param {QuasArgs} quasArgs
	 * @param {stream} contents
	 * @returns {stream} the stream written to
	 * @memberof QuasarRuntime
	 */
	injectRequiredFilesIntoStream(quasArgs, contents) {
		this.debug('will injectRequiredFilesIntoStream');

		const preCssInjectionLocation = quasArgs.cssInjectTargets.length ?
			quasArgs.cssInjectTargets[0] :
			quasArgs.cssInjectTargets;
		const postCssInjectionLocation =
			quasArgs.cssInjectTargets.length > 1 ?
				quasArgs.cssInjectTargets[1] :
				quasArgs.cssInjectTargets;
		const preJsInjectionLocation = quasArgs.jsInjectTargets.length ?
			quasArgs.jsInjectTargets[0] :
			quasArgs.jsInjectTargets;
		const postJsInjectionLocation =
			quasArgs.jsInjectTargets.length > 1 ?
				quasArgs.jsInjectTargets[1] :
				quasArgs.jsInjectTargets;

		if (quasArgs.cssPreAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.cssPreAssetFile} */`,
				contents,
				preCssInjectionLocation,
				'style'
			);
		}
		if (quasArgs.cssAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.cssAssetFile} */`,
				contents,
				postCssInjectionLocation,
				'style',
				false
			);
		}
		if (quasArgs.cssPostAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.cssPostAssetFile} */`,
				contents,
				postCssInjectionLocation,
				'style',
				false
			);
		}
		if (quasArgs.jsPreAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.jsPreAssetFile} */`,
				contents,
				preJsInjectionLocation,
				'script'
			);
		}
		if (quasArgs.jsAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.jsAssetFile} */`,
				contents,
				postJsInjectionLocation,
				'script',
				false
			);
		}
		if (quasArgs.jsPostAssetFile) {
			contents = lib.injectTagStringIntoString(
				`/*=require ${quasArgs.jsPostAssetFile} */`,
				contents,
				postJsInjectionLocation,
				'script',
				false
			);
		}

		return contents;
	}

	/**
	 * @description loads the quasar task into the gulp taskList with the supplied args
	 * @param {string} task
	 * @param {QuasArgs} quasArgs the QuasArgs to load with the task
	 * @returns {array} the tasks loaded
	 * @memberof QuasarRuntime
	 */
	loadTask(task, args = {}) {
		let resolvedFilePath = tryRequire.resolve(task),
			newTask = null;
		resolvedFilePath = resolvedFilePath ? `${resolvedFilePath}.js` : null;

		if (!resolvedFilePath) {
			resolvedFilePath = tryRequire.resolve(
				`${this.config.quasarsFolder}/${task}.js`
			);
		}

		if (resolvedFilePath) {
			this.debug('loading task', task);
			const TaskClass = require(resolvedFilePath);
			newTask = new TaskClass(this.config, this.config.applicationRoot, args);
			this.config.tasks.push(newTask);
		} else {
			this.logError(`could not load task at ${task} or ${resolvedFilePath}`);
		}
	}

	/**
	 * @description loads the quasar tasks into the gulp taskList
	 * @param {array}
	 * @param {boolean} [loadDefaults=false]
	 * @param {boolean} [clobber=true]
	 * @returns {array} the tasks loaded
	 * @memberof QuasarRuntime
	 */
	loadTasks(taskPaths, loadDefaults = false, clobber = true) {
		this.debug('will loadTasks', taskPaths);

		if (clobber) {
			this.config.tasks = [];
		}

		if (!taskPaths && loadDefaults) {
			taskPaths = this.getTaskNames();
			taskPaths.splice(taskPaths.indexOf('quasar-webform'), 1);
			taskPaths.splice(taskPaths.indexOf('quasar-webapp'), 1);
			this.logInfo(`Loading default quasars (${taskPaths})`);
		} else if (!taskPaths) {
			this.debug('no tasks to load');
			return null;
		}

		for (var task of [].concat(taskPaths)) {
			this.loadTask(task);
		}

		return Array.prototype.map.call(this.config.tasks, task => {
			return task.qType;
		});
	}

	/**
	 * @description writes the args to file with the status passed in
	 * @param {QuasArgs} quasArgs
	 * @param {string} [toStatus=null]
	 * @param {boolean} [overwite=false]
	 * @returns {QuasArgs}
	 * @memberof QuasarRuntime
	 */
	logArgsToFile(quasArgs, toStatus = null, overwite = false) {
		this.debug('will logArgsToFile', toStatus);

		if (overwite || !(quasArgs.status == STATUS_CREATED && toStatus == null)) {
			if (overwite && quasArgs.status == toStatus) {
				quasArgs.error = `${quasArgs.error ? `${quasArgs.error} \n>` : ''}WARN: overwriting jobfile. Was this done intentionally?`;
			}
			if (quasArgs.argsFile && fs.existsSync(quasArgs.argsFile)) {
				quasArgs.outputFilePath = path.resolve(`${this.getQuasarOutputPath(quasArgs)}/${quasArgs.output}${quasArgs.outputExt}`);
				fs.unlinkSync(quasArgs.argsFile);
			}

			quasArgs.argsFile = quasArgs.argsFile.replace(
				`/${quasArgs.status}`,
				`/${toStatus}`)
				.replace(
					`\\${quasArgs.status}`,
					`\\${toStatus}`
				);
			quasArgs.status = toStatus;
			const logFileData = {
				outputFilePath: quasArgs.outputFilePath,
				...this.getRunArgs(quasArgs),
			};

			fs.writeFileSync(quasArgs.argsFile, JSON.stringify(logFileData));
			this.debug(
				`did write contents to build file: ${quasArgs.argsFile}`,
				logFileData
			);
		}

		return quasArgs;
	}

	/**
	 * @description logs quasArgs to the jobFile
	 * @param {QuasArgs} quasArgs
	 * @returns {QuasArgs} the quasargs logged with updated argsFile entry
	 * @memberof QuasarRuntime
	 */
	logBuildCompleted(quasArgs) {
		const toStatus = STATUS_COMPLETED;

		if (
			quasArgs.status != toStatus ||
			!fs.existsSync(
				`${quasArgs.jobsFolder}/${toStatus}/${quasArgs.qType}_${
				quasArgs.jobTimestamp
				}.json`
			)
		) {
			quasArgs = this.logArgsToFile(quasArgs, toStatus, true);
		} else {
			quasArgs.status = toStatus;
		}
		this.debug(`did successfully complete build with args`, quasArgs);

		return quasArgs;
	}

	/**
	 * @description logs quasArgs to the jobFile
	 * @param {QuasArgs} quasArgs
	 * @returns {QuasArgs} the quasargs logged with updated argsFile entry
	 * @memberof QuasarRuntime
	 */
	logBuildFailed(quasArgs) {
		const toStatus = STATUS_FAILED;

		if (
			quasArgs.status != toStatus ||
			!fs.existsSync(
				`${quasArgs.jobsFolder}/${toStatus}/${quasArgs.qType}_${
				quasArgs.jobTimestamp
				}.json`
			)
		) {
			quasArgs = this.logArgsToFile(quasArgs, toStatus, true);
		} else {
			quasArgs.status = toStatus;
		}
		this.debug(`did successfully fail build with args`, quasArgs);

		return quasArgs;
	}

	/**
	 * @description logs quasArgs to the jobFile
	 * @param {QuasArgs} quasArgs
	 * @returns {QuasArgs} the quasargs logged with updated argsFile entry
	 * @memberof QuasarRuntime
	 */
	logBuildQueued(quasArgs) {
		const toStatus = STATUS_QUEUED;

		if (
			quasArgs.status != toStatus ||
			!fs.existsSync(
				`${quasArgs.jobsFolder}/${toStatus}/${quasArgs.qType}_${
				quasArgs.jobTimestamp
				}.json`
			)
		) {
			quasArgs = this.logArgsToFile(quasArgs, toStatus, true);
		} else {
			quasArgs.status = toStatus;
		}
		this.debug(`did successfully queue build with args`, quasArgs);

		return quasArgs;
	}

	/**
	 * @description ogs a critical message
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 * @memberof QuasarRuntime
	 */
	logCritical(message, obj, color) {
		lib.logCritical(message, obj, color);
	}

	/**
	 * @description Logs a data message
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 * @memberof QuasarRuntime
	 */
	logData(message, obj, color) {
		lib.logData(message, obj, color);
	}

	/**
	 * @description Logs an end message
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 */
	logEnd(message, obj, color) {
		lib.logEnd(message, obj, color);
	}

	/**
	 * @description Logs an error message
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 * @memberof QuasarRuntime
	 */
	logError(message, obj, color) {
		lib.logError(message, obj, color);
	}

	/**
	 * @description Logs an info message (default)
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 * @memberof QuasarRuntime
	 */
	logInfo(message, obj, color) {
		lib.logInfo(message, obj, color);
	}

	/**
	 * @description prints a logo to the console
	 * @param {string} tagline the tagline of the logo
	 * @param {object} version an object to get information
	 * @param {color} color the color to print the logo in
	 * @memberof QuasarRuntime
	 */
	logQuasarLogo(name, packageJson = {}, color = 'magenta', font = 'Slant') {
		const quasarPackageJson = tryRequire.resolve('@digitaltrends/quasar/package.json') ? require('@digitaltrends/quasar/package.json') : null;
		return lib.log(
			asciiArt({
				name: name || packageJson.name,
				font,
			})
				.emptyLine()
				.left(packageJson.description)
				.emptyLine()
				.right(`version ${packageJson.version}`)
				.emptyLine()
				.right(quasarPackageJson ? `Quasar Runtime version ${quasarPackageJson.version}` : '')
				.render(),
			packageJson,
			lib.LOG_CRITICAL,
			colors[color],
			null,
			null,
			false,
			true,
		);
	}

	/**
	 * @description Logs a success message
	 * @param {string} message
	 * @param {object} obj
	 * @param {color} color
	 * @memberof QuasarRuntime
	 */
	logSuccess(message, obj, color) {
		lib.logSuccess(message, obj, color);
	}

	/**
	 * @description used with inquirer questions to ensure that values entered have a length
	 * @returns {function}
	 */
	makePromptRequired() {
		return lib.makePromptRequired;
	}

	/**
	 * @description used with inquirer questions to ensure that values entered from the CLI follow the required ruleset
	 * @returns {function}
	 */
	makePromptRequiredAndSanitary() {
		return lib.makePromptRequiredAndSanitary;
	}

	/**
	 * @description moves the target html, js, and css files to the assetsFolder
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	moveTargetFilesToRootOfAssetsPath(quasArgs) {
		this.debug('will moveTargetFilesToRootOfAssetsPath');

		return new Promise(
			function (resolve, reject) {
				let targetFilePath = this.findTargetFile(quasArgs);

				if (!targetFilePath) {
					this.logInfo(
						`did not find a templated target file, using first available file that matches the target (${
						quasArgs.target
						}) in the assets path: ${quasArgs.assetsFolder}`
					);
					targetFilePath = lib.fromDir(quasArgs.assetsFolder, quasArgs.target);
					this.logInfo(`new targetFile: ${targetFilePath}`);
				}

				// Error
				if (!targetFilePath) {
					return resolve(quasArgs);
				}

				const baseDir = path.dirname(targetFilePath);
				if (targetFilePath !== `${quasArgs.assetsFolder}/${quasArgs.target}` && baseDir !== quasArgs.assetsFolder) {
					// logInfo(`Moving files from deep folder structure (${baseDir})
					// to base assets path (${quasArgs.assetsFolder})`);
					return gulp
						.src(`${baseDir}/**`)
						.pipe(gulp.dest(quasArgs.assetsFolder))
						.on(
							'error',
							function (err) {
								this.logCritical(err);
								return reject(quasArgs);
							}.bind(this)
						)
						.on(
							'end',
							function () {
								this.logSuccess(
									`files moved from deep folder structure (${baseDir}) to base assets path (${
									quasArgs.assetsFolder
									})`
								);
								quasArgs.targetFilePath = targetFilePath;
								let remove = baseDir
									.replace(quasArgs.assetsFolder, '')
									.substr(1)
									.split('/');
								remove = path.resolve(`${quasArgs.assetsFolder}/${remove[0]}`);
								del.sync(path.resolve(remove), {
									force: true
								});

								return resolve(quasArgs);
							}.bind(this)
						);
				}

				return resolve(quasArgs);
			}.bind(this)
		);
	}

	/**
	 * @description Compiles the quasar into the outputFile alongside the assets into the outputFolder as HTML.
	 * @param {QuasArgs} quasArgs
	 * @returns {object} quasArgs including errors if they exist
	 * @memberof QuasarRuntime
	 */
	outputToHtmlFile(quasArgs) {
		this.debug('will outputToHtmlFile');

		return new Promise(
			function (resolve, reject) {
				const versionPrefix = `_v`;
				const outputPath = this.getQuasarOutputPath(quasArgs);
				let outputFile = `${outputPath}/${
					quasArgs.outputVersion == 1
						? quasArgs.output
						: `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`
					}${quasArgs.outputExt}`;
				this.logInfo(
					`Applying the following parameters to the template (${
					quasArgs.targetFilePath
					}) and building output`
				);

				if (fs.existsSync(outputFile) && quasArgs.versionOutputFile) {
					while (fs.existsSync(outputFile)) {
						quasArgs.outputVersion += 1;
						outputFile = `${outputPath}/${quasArgs.output}${versionPrefix}${
							quasArgs.outputVersion
							}${quasArgs.outputExt}`;
					}
					quasArgs.output = `${quasArgs.output}${versionPrefix}${
						quasArgs.outputVersion
						}`;
					this.logInfo(
						`existing version detected, version number (${
						quasArgs.outputVersion
						}) appended to outputFile`
					);
				}

				return gulp
					.src(quasArgs.targetFilePath)
					.pipe(
						include({
							extensions: ['js', 'css', 'html'],
							hardFail: false,
							includePaths: [quasArgs.assetsFolder]
						})
					)
					.on(
						'error',
						function (err) {
							this.logCritical('Assets Including Error:', err.message);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.pipe(
						template(quasArgs, {
							interpolate: /<%=([\s\S]+?)%>/g
						})
					)
					.on(
						'error',
						function (err) {
							this.logCritical('Templating Error:', err.message);
							quasArgs.error = err.message;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.pipe(
						rename({
							// dirname: outputPath,
							basename: quasArgs.output,
							extname: quasArgs.outputExt
						})
					)
					.pipe(
						insert.transform(
							function (contents, file) {
								if (quasArgs.wrapInHtmlTags) {
									if (
										!(
											contents.indexOf('</html>') !== -1 &&
											contents.indexOf('</body>') !== -1
										)
									) {
										contents = `<html>
												<body>
													${contents}
												</body>
											</html>`;
									}
								}

								if (quasArgs.minifyHtml) {
									const minifiedHtml = htmlMin.minify(contents);

									if (minifiedHtml) {
										contents = minifiedHtml;
										this.debug(`did minify html`);
									} else {
										this.logError(`error minifying html: ${minifiedHtml}`);
									}
								}

								return contents;
							}.bind(this)
						)
					)
					.on(
						'error',
						function (err) {
							this.logCritical('HTML transform Error:', err.message);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.pipe(
						include({
							extensions: ['js', 'css'],
							hardFail: false,
							includePaths: [quasArgs.debrisFolder]
						})
					)
					.on(
						'error',
						function (err) {
							this.logCritical('Debris Including Error:', err.message);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.pipe(
						beautify({
							indent_with_tabs: true
						})
					)
					.on(
						'error',
						function (err) {
							this.logCritical(err);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.pipe(gulp.dest(outputPath))
					.on(
						'error',
						function (err) {
							this.logCritical(err);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.on(
						'end',
						function () {
							if (
								quasArgs.cleanUpTargetFileTemplate &&
								quasArgs.targetFilePath.indexOf(
									`${quasArgs.output}${quasArgs.outputExt}`
								) == -1
							) {
								this.logInfo(
									`Removing templated file ${quasArgs.targetFilePath}`
								);
								fs.unlinkSync(quasArgs.targetFilePath);
							}
							this.logSuccess(`Output file saved as: ${outputFile}`);
							quasArgs.buildCompletedSuccessfully = true;

							return resolve(quasArgs);
						}.bind(this)
					);
			}.bind(this)
		);
	}

	/**
	 * @description Compiles the quasar into the outputFile alongside the assets into the outputFolder as JSON.
	 * @param {QuasArgs} quasArgs
	 * @returns {object} quasArgs including errors if they exist
	 * @memberof QuasarRuntime
	 */
	outputToJsonFile(quasArgs) {
		this.debug('will outputToJsonFile');

		return new Promise(
			function (resolve) {
				return resolve(quasArgs);
			}.bind(this)
		);
	}

	/**
	 * @description Compiles the quasar into the outputFile alongside the assets into the outputFolder as TXT.
	 * @param {QuasArgs} quasArgs
	 * @returns {object} quasArgs including errors if they exist
	 * @memberof QuasarRuntime
	 */
	outputToTextFile(quasArgs) {
		this.debug('will outputToTextFile');

		return new Promise(
			function (resolve, reject) {
				const versionPrefix = `_v`;
				const outputPath = this.getQuasarOutputPath(quasArgs);
				let outputFile = `${outputPath}/${
					quasArgs.outputVersion == 1
						? quasArgs.output
						: `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`
					}${quasArgs.outputExt}`;

				if (fs.existsSync(outputFile) && quasArgs.versionOutputFile) {
					while (fs.existsSync(outputFile)) {
						quasArgs.outputVersion += 1;
						outputFile = `${outputPath}/${quasArgs.output}${versionPrefix}${
							quasArgs.outputVersion
							}${quasArgs.outputExt}`;
					}
					quasArgs.output = `${quasArgs.output}${versionPrefix}${
						quasArgs.outputVersion
						}`;
					this.logInfo(
						`existing version detected, version number (${
						quasArgs.outputVersion
						}) appended to outputFile`
					);
				}

				return gulp
					.src(quasArgs.targetFilePath)
					.pipe(template(quasArgs))
					.pipe(
						rename({
							basename: quasArgs.output,
							extname: quasArgs.outputExt
						})
					)
					.pipe(gulp.dest(outputPath))
					.on(
						'error',
						function (err) {
							this.logCritical(err);
							quasArgs.error = err;
							quasArgs = this.logBuildFailed(quasArgs);
							return reject(quasArgs);
						}.bind(this)
					)
					.on(
						'end',
						function () {
							this.logSuccess(`Output file saved as: ${outputFile}`);
							quasArgs.buildCompletedSuccessfully = true;
							quasArgs = this.logBuildCompleted(quasArgs);

							return resolve(quasArgs);
						}.bind(this)
					);
			}.bind(this)
		);
	}

	/**
	 * @description prompts the terminal with questions
	 * @param {array} questions the questions to ask the user
	 * @param {function} getResults callback after prompt has completed
	 * @param {boolean} [showOptional=false]
	 * @param {boolean} [optionalOnly=null]
	 * @returns {Promise} the Promise of a prompt of the user to the command line interface
	 */
	promptConsole(questions, getResults, showOptional, optionalOnly) {
		this.debug('will promptConsole');

		return lib.promptConsole(questions, getResults, showOptional, optionalOnly);
	}

	/**
	 * @description spawns a task to run a quasar from quasArgs saved in a json file.
	 * @param {*} qType
	 * @param {*} argsFile
	 * @memberof QuasarRuntime
	 */
	runFromArgsFile(qType, args = {}, argsFile) {
		this.debug('will runFromArgsFile', argsFile);

		try {
			if (fs.existsSync(argsFile)) {
				const dataFile = fs.readFileSync(argsFile, "utf8");
				args = Object.assign({}, JSON.parse(dataFile), args);
			}

			return this.runQuasar(qType || args.qType, args);
		} catch (e) {
			this.logError('Run Error', e);
		}
	}

	/**
	 * @description runs the last successfully recorded argsFile
	 * @param {QuasArgs} [quasArgs=null]
	 * @returns {Promise} resolves to the QuasArgs used
	 * @memberof QuasarRuntime
	 */
	runLastSuccessfulBuild(quasArgs = null) {
		this.debug('will runLastSuccessfulBuild');

		return new Promise(
			function (resolve, reject) {
				if (!quasArgs) {
					quasArgs = {
						logFile: `.log`,
						applicationRoot: this.config.applicationRoot
					};
				}
				const logFilePath = path.resolve(
					`${this.config.applicationRoot}/${quasArgs.logFile}`
				);

				this.logError(`Could not find logfile: ${logFilePath}`);
				return reject();

			}.bind(this)
		);
	}

	/**
	 * @description Runs a quasar build task
	 * @param {string} quasar name of the quasar to run
	 * @param {QuasArgs} [quasArgs={}]
	 * @param {bool} registerTask whether or not to register the quasar with gulp
	 * @param {function} end the callback for when the task has completed
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	runQuasar(quasar, args = {}, end) {
		this.debug('will runQuasar', quasar);

		if (!gulp.task(quasar)) {
			this.loadTask(quasar, args);
		}

		return this.runTask(quasar, end);
	}

	/**
	 * @description runs a quasar task by name
	 * @private
	 * @param {string} task the name of the quasar task to run
	 * @param {QuasArgs} [args={}] the quasargs to run over the command line args
	 * @param {boolean} [registerTask=false]
	 * @param {function} end
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	runTask(task, end) {
		this.debug('will runTask', task);
		this.logSuccess(`running task: ${task}`, task);

		return new Promise(
			function (resolve, reject) {
				if (!end) {
					end = function (error) {
						this.logEnd(
							`quasar ${error ? `${task} finished with error:` : 'completed!'}`,
							error ? error.stack : task
						);
						resolve();
					}.bind(this);
				}

				this.debug(`will run task [${task}]`, task);
				try {
					return gulp.task(task)(end);
				} catch (e) {
					return reject(e);
				}

			}.bind(this)
		).catch(function (e) {
			this.logCritical('runTask error', e);
		}.bind(this));
	}

	/**
	 * @description Sets the logging level
	 * @param {string} level
	 */
	setLogLevel(level) {
		return lib.setLogLevel(level);
	}

	/**
	 * @description unzips or moves source files to the assets folder
	 * @param {QuasArgs} quasArgs
	 * @param {string} subDirectory the subdirectory of the assets folder to place the source files
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	unpackSourceFiles(quasArgs, subDirectory) {
		this.debug('will unpackSourceFiles');

		return new Promise(
			function (resolve, reject) {
				if (
					!quasArgs.unpackSourceFiles ||
					!quasArgs.source ||
					quasArgs.sourceExt != '.zip'
				) {
					return resolve(quasArgs);
				}

				const destinationPath = path.resolve(`${quasArgs.assetsFolder}${subDirectory ? `/${subDirectory}` : ''}`);

				if (quasArgs.overwriteUnpackDestination) {
					this.logInfo(
						`${
						destinationPathExists
							? `overwriting files in assets folder ${destinationPath}`
							: `leaving files in unpack destination (${destinationPath}) unmodified`
						}`
					);

					const destinationPathExists = fs.existsSync(destinationPath);
					if (destinationPathExists) {
						del.sync(destinationPath, {
							force: true
						});
					}
				}
				mkdir(destinationPath);

				const zipFilePath = path.resolve(
					`${quasArgs.sourcesFolder}/${quasArgs.source}${quasArgs.sourceExt}`
				);
				if (!fs.existsSync(zipFilePath)) {
					this.logCritical(`source could not be found`, zipFilePath);
					return reject();
				}
				this.logInfo(
					`unpacking source files from (${zipFilePath}) to the folder (${destinationPath}) before building output`
				);

				unzip(
					zipFilePath, {
						dir: destinationPath
					},
					function (err) {
						// extraction is complete. make sure to handle the err
						if (err) {
							this.logCritical(err.Error || err, colors.red);
							return reject();
						}

						this.logSuccess(`files successfully unzipped to ${destinationPath}`);
						return resolve(quasArgs);
					}.bind(this)
				);
			}.bind(this)
		);
	}

	/**
	 * @description Uploads output files to Amazon S3.
	 * @param {QuasArgs} quasArgs
	 * @param {array} [excludeFiles=[]]
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	uploadOutputFiles(quasArgs, excludeFiles = []) {
		if (quasArgs.uploadToS3) {
			this.debug('will uploadOutputFiles');

			// exclude the outputFile extension
			excludeFiles.push(`*${quasArgs.outputExt}`);

			const fromLocalDirectory = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signature}/`;
			const outputFile = `${quasArgs.output}${quasArgs.outputExt}`;
			const toS3BucketPath = `${quasArgs.bucket}/${quasArgs.bucketPath}`;
			const outputFileMetada = {
				qType: quasArgs.qType,
				oType: quasArgs.oType,
				outputFile,
			};

			this.debug(`will upload to ${toS3BucketPath}`, outputFileMetada);
			return Promise.resolve()
				.then(function () {
					return lib.uploadFilesToS3(toS3BucketPath, ['**'], fromLocalDirectory, excludeFiles, this.config.env.s3, outputFileMetada)
				}.bind(this))
				.then(function () {
					return this.uploadOutputFileWithMetadata(quasArgs);
				}.bind(this))
				.then(function () {
					return this.uploadOutputFileAsTxt(quasArgs);
				}.bind(this))
				.catch(function (err) {
					this.logCritical('Upload error', err.message);
					throw err;
				}.bind(this));
		} else {
			return this.uploadOutputFileAsTxt(quasArgs);
		}
	}

	/**
	 * @description Uploads the outputFile to Amazon S3.
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	uploadOutputFileAsTxt(quasArgs) {
		if (!quasArgs.uploadOutputFileAsTxtFile) {
			return;
		}
		this.debug('will uploadOutputFileAsTxt');

		const inferredPath = decodeURIComponent(quasArgs.destination).replace('https://www.dropbox.com/', '');
		const split = inferredPath.split('/');
		const inferredFolder = split.length ? split[0] : '';

		const fromLocalDirectory = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signature}/`;
		const outputFile = `${quasArgs.output}${quasArgs.outputExt}`;
		const outputFileName = `${quasArgs.output}.txt`;
		const dropboxFolder = inferredFolder.length ? inferredFolder : quasArgs.dbFolder;
		let toDropboxPath = inferredPath.replace(`${inferredFolder}/`, '');

		return lib.getDropboxShareLinkMetadata(quasArgs.destination, this.config.env.dropbox)
			.then((metadata) => {
				if (metadata) {
					toDropboxPath = metadata.id || toDropboxPath;
				}
				this.debug(`will uploadFilesToDropbox using the config`, this.config.env.dropbox);
				return lib.uploadFilesToDropbox([outputFile], fromLocalDirectory, toDropboxPath, [], this.config.env.dropbox, outputFileName);
			});
	}

	/**
	 * @description Uploads the outputFile to Amazon S3.
	 * @param {QuasArgs} quasArgs
	 * @returns {Promise}
	 * @memberof QuasarRuntime
	 */
	uploadOutputFileWithMetadata(quasArgs) {
		if (!quasArgs.uploadToS3 || quasArgs.excludeOutputFileFromUpload) {
			return;
		}
		this.debug('will uploadOutputFileWithMetadata');

		const fromLocalDirectory = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signature}/`;
		const outputFile = `${quasArgs.output}${quasArgs.outputExt}`;
		const toS3BucketPath = `${quasArgs.bucket}/${quasArgs.bucketPath}`;
		const outputFileMetada = this.getRunArgs(quasArgs);

		return lib.uploadFilesToS3(toS3BucketPath, [outputFile], fromLocalDirectory, [], this.config.env.s3, outputFileMetada);
	}
}
// Export the class to be consumed by a singleton
module.exports = QuasarRuntime;

// Export the status constants
module.exports.STATUS_CREATED = STATUS_CREATED;
module.exports.STATUS_QUEUED = STATUS_QUEUED;
module.exports.STATUS_COMPLETED = STATUS_COMPLETED;
module.exports.STATUS_FAILED = STATUS_FAILED;

// Export the classes for the runtime(self), config, and tasks for use with this version of quasar
module.exports.QuasarConfig = QuasarConfig;
// module.exports.QuasarTask = QuasarTask;
