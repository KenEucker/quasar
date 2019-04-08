/**
 * @file lib.js
 * @author Ken Eucker <keneucker@gmail.com>
 */

// throw 'requiring LIB';
const gulp = require('gulp'),
	rename = require('gulp-rename'),
	gulpS3 = require('gulp-s3-upload'),
	gulpif = require('gulp-if'),
	gulpDownload = require('gulp-download-files'),
	gulpDropbox = require('gulp-dropbox'),
	prompt = require('inquirer'),
	sass = require('dart-sass'),
	through = require('through2'),
	del = require('del'),
	path = require('path'),
	cssMin = require('clean-css'),
	jsMin = require('uglify-es'),
	colors = require('colors'),
	fs = require('fs'),
	request = require('request'),
	yargs = require('yargs'),
	envConfig = require('dotenv');

const LOG_DEFAULT = LOG_CRITICAL = 'CRITICAL',
	LOG_SUCCESS = 'SUCCESS',
	LOG_DEBUG = 'DEBUG',
	LOG_DEBUG_NODATA = 'DEBUG-NODATA',
	LOG_ALL = 'ALL',
	LOG_DATED = 'DATED',
	LOG_NODATA = 'NODATA',
	LOG_NONE = 'NONE',
	LOG_FAILURE = 'FAIL',
	LOG_ERROR = 'ERROR',
	LOG_INFO = 'INFO',
	LOG_END = LOG_DONE = 'END';

envConfig.config();

const getCommandArgument = (names, _default) => {
	let value = null;

	// Enforce an array
	if (!Array.isArray(names) && typeof names == 'string') {
		names = [names];
	}
	names.forEach(name => {
		// Try to get the value from CLI args
		const newValue = Array.isArray(yargs.argv[name]) ? yargs.argv[name[yargs.argv[name].length - 1]] : yargs.argv[name];
		// Use the value we already have, or if it is null use the newValue from CLI args, or if that is null use the environment variables
		value = value || newValue || process.env[name];
	});

	return value || _default;
}

// Command arguments
const logToFile = getCommandArgument('logFile', false),
	logDate = getCommandArgument('logDate'),
	logLevel = getCommandArgument(['logLevel', 'log'], LOG_DEFAULT).toUpperCase();

/**
 * @private
 * @param {string} paths
 * @param {boolean} [force=true]
 * @returns {string[]}
 */
const cleanPaths = (paths, force = true) => {
	return del.sync(paths, {
		force
	});
}

/**
 * @description converts the quasar prompt into a json schema form object
 * @private
 * @param {object} prompt
 * @returns {object} json schema form object
 */
const convertPromptToJsonSchemaFormProperty = (prompt) => {
	let title = prompt.message,
		type = prompt.type,
		_default = prompt.default;
	let property = {
		type,
		title
	};

	if (_default) {
		property.default = _default;
	}

	switch (type) {
		case 'input':
			property.type = 'string';
			break;
		case 'checkbox':
			property.type = 'array';
			property.items = {
				type: 'string',
				enum: prompt.choices,
				enumNames: prompt.choices,
			};
			break;
		case 'list':
			// TODO: add fields, on the quasar side, for what type of field this should be
			if (prompt.widget == 'file') {
				property.type = 'string';
			} else {
				property.type = 'string';
				property.enum = prompt.choices;
			}
			break;
		case 'confirm':
			property.type = 'boolean';
			property.enum = [true, false]
			property.enumNames = ['yes', 'no']
			property.default = property.default ? 'yes' : 'no';
		default:
			break;
	}

	return property;
}

/**
 * @private
 * @param {object} prompt
 * @returns {object}
 */
const convertPromptToJsonSchemaUIFormProperty = (prompt) => {
	let title = prompt.shortMessage || prompt.name || '',
		widget = prompt.widget || prompt.type || 'input',
		help = prompt.message || prompt.help || '',
		classNames = '',
		options = {
			icon: 'text_fields'
		};

	switch (widget) {
		case 'input':
			widget = 'text';
			break;

		case 'checkbox':
			widget = 'checkboxes';
			options.orderable = true;
			break;

		case 'confirm':
		case 'list':
			widget = 'radio';
			break;
	}

	if (prompt.optional) {
		classNames += 'optional hide';
	}

	return {
		'ui:title': title,
		'ui:widget': widget,
		'ui:options': options,
		classNames,
		help
	};
}

/**
 *
 *
 * @private
 * @param {*} filePath
 * @param {*} outputFolder
 * @param {*} name
 * @returns {string}
 */
const copyFileToFolder = (filePath, outputFolder, name) => {
	name = name || path.basename(filePath);

	if (fs.existsSync(filePath)) {
		const outputPath = `${outputFolder}/${name}`;

		logInfo(`copying file to path: ${outputPath}`, filePath);
		fs.createReadStream(filePath).pipe(fs.createWriteStream(outputPath));

		return outputPath;
	}

	return null;
}

/**
 *
 *
 * @private
 * @param {*} sourcePath
 * @param {*} destinationPath
 * @param {*} files
 * @param {*} [excludeFiles=[]]
 * @returns {Promise}
 */
const copyFilesFromFolderToFolder = (sourcePath, destinationPath, files, excludeFiles = []) => {
	return new Promise((resolve) => {
		files = files.map(file => `${sourcePath}/${file}`);
		excludeFiles = excludeFiles.map(excludeFile => `!${sourcePath}/${excludeFile}`);

		logInfo(`copying files (${files.join()}) from ${sourcePath}/ to ${destinationPath}`);
		return gulp.src(files.concat(excludeFiles), {
			base: sourcePath,
			allowEmpty: true,
		})
			.on('error', err => {
				logError('copying error', err);
			})
			.pipe(gulp.dest(destinationPath))
			.on('error', err => {
				logError('copying error', err);
			})
			.on('end', resolve);
	});
}

/**
 *
 *
 * @private
 * @param {string} message
 * @param {*} obj
 * @param {boolean} [condition=true]
 */
const debug = (message, obj, condition = true) => {
	log(message, obj, 'debug', condition ? colors.blue : colors.red)
}

/**
 * @private
 * @param {*} url
 * @param {*} directory
 * @param {*} filename
 * @returns {Promise}
 */
const downloadFile = (url, directory, filename) => {
	return new Promise((resolve, reject) => {
		gulpDownload(url)
			.pipe(rename(filename))
			.pipe(gulp.dest(directory))
			.on('finish', function () {
				resolve();
			})
			.on('error', function (e) {
				reject(e);
			});
	});
}

/**
 * @private
 * @param {*} startPath
 * @param {string} [filter='']
 * @param {string} [extension='']
 * @returns {string}
 */
const fromDir = (startPath, filter = '', extension = '') => {
	let found = '';
	filter = filter || '';

	if (!extension.length) {
		const split = filter.split('.');
		extension = split.length > 1 ? `.${split.pop()}` : '';
		filter = filter.replace(extension, '');
	}

	if (!fs.existsSync(startPath)) {
		return;
	}

	var files = fs.readdirSync(startPath);
	for (var i = 0; i < files.length; i++) {
		var filename = path.join(startPath, files[i]);
		var stat = fs.lstatSync(filename);

		if (stat.isDirectory()) {
			found = fromDir(filename, filter, extension); //recurse
		} else if (!filter.length && path.extname(filename) == extension) {
			return filename;
		} else if (path.basename(filename) == `${filter}${extension}`) {
			return filename;
		};
	};

	return found;
}

/**
 * @description Parses the arguments passed in and filters out objects and functions
 * @private
 * @param {QuasArgs} quasArgs
 * @param {array} [onlyObjects=null]
 * @returns {array} command line arguments in --key=value strings
 */
const getActualArgObjects = (quasArgs, onlyObjects = null) => {
	const noArgTypes = ['object', 'function'];
	const skipKeys = ['/bin/zsh', '$0', 'noPrompt'];
	let recordedKeys = [];

	return Object.keys(quasArgs).map(k => {
		const skipValue =
			noArgTypes.indexOf(typeof quasArgs[k]) != -1 ||
			skipKeys.indexOf(k) != -1 ||
			recordedKeys.indexOf(k) != -1 ||
			(onlyObjects ? onlyObjects.indexOf(k) == -1 : false);
		if (!skipValue) {
			recordedKeys.push(k);
			return `--${k}=\'${quasArgs[k]}\'`;
		}
	});
}

/**
 * @description Gets the metadata for a dropbox share link.
 * @private
 * @param {string} shareLink
 * @param {object} dropboxConfig
 * @returns {Promise}
 */
const getDropboxShareLinkMetadata = (shareLink, dropboxConfig) => {
	return new Promise(function (resolve) {
		const dropboxSharingGetLinkMetadataURI = 'https://api.dropboxapi.com/2/sharing/get_shared_link_metadata';
		const options = {
			url: dropboxSharingGetLinkMetadataURI,
			json: true,
			headers: {
				'Authorization': `Bearer ${dropboxConfig.accessToken}`
			},
			body: {
				url: shareLink,
			},
		};

		request.post(options, (error, response, data) => {
			if (error) {
				logError(`dropbox get sharelink metadata failure`, error);
			}
			return resolve(data);
		});
	});
}

/**
 * @description Gets the icon from files in the rootpath matching .ico, .icns, .png, or .jpg of the iconName.
 * @private
 * @param {*} [rootPath=process.cwd()]
 * @param {string} [iconName='icon']
 * @param {string} [iconExt='.ico']
 * @returns {string} false if not found
 */
const getIconFilePath = (rootPath = process.cwd(), iconName = 'icon', iconExt = '.ico') => {
	if (fs.existsSync(`${rootPath}/${iconName}${iconExt}`)) {
		return `${rootPath}/${iconName}${iconExt}`;
	}

	const iconExtensionsInOrder = ['ico', 'icns', 'png', 'jpg'],
		nextIconExtension = iconExtensionsInOrder.indexOf(iconExt);
	if (nextIconExtension >= 0) {
		return getIconFilePath(rootPath, nextIconExtension);
	} else {
		return false;
	}
}

/**
 * @private
 * @param {string} directory
 * @param {array} [extensions=[]]
 * @param {boolean} [removeExtension=false]
 * @returns {string}
 */
const getFilenamesInDirectory = (directory, extensions = [], removeExtension = false) => {
	let filenames = [];

	if (fs.existsSync(directory)) {
		filenames = fs.readdirSync(directory)
			.filter((file) => {
				const notADirectory = !fs.statSync(path.join(directory, file)).isDirectory();
				if (notADirectory && extensions.length) {
					let ext = path.extname(file);
					ext = ext ? ext.split('.').pop() : ext;

					if (extensions.includes(ext)) {
						return true;
					} else {
						return false;
					}
				}

				return notADirectory;
			});

		if (removeExtension) {
			return filenames.map(filename => filename.replace(path.extname(filename), ''));
		}
	}

	return filenames;
}

/**
 * @private
 * @param {*} filePath
 * @param {*} contents
 * @param {*} injectionTarget
 * @param {*} injectionTag
 * @param {boolean} [after=true]
 * @returns {string}
 */
const injectFilesIntoString = (filePath, contents, injectionTarget, injectionTag, after = true) => {
	if (filePath) {
		let fileContents = fs.readFileSync(filePath);

		if (!fileContents.length) {
			return contents;
		}

		switch (injectionTag) {
			case 'style':
				const cssMinOptions = {};
				const cssMinified = new cssMin(cssMinOptions).minify(fileContents);
				if (cssMinified.styles) {
					fileContents = cssMinified.styles;
				} else {
					logError(cssMinified.error);
				}
				break;
			case 'script':
				const jsMinified = jsMin.minify(fileContents);
				if (jsMinified.error) {
					logError(jsMinified.error.message || jsMinified.error);
				} else {
					fileContents = jsMinified.code;
				}

				break;
		}
		return injectTagStringIntoString(fileContents, contents, injectionTarget, injectionTag, after);
	}

	return contents;
}

/**
 * @private
 * @param {*} s
 * @param {*} contents
 * @param {*} injectionTarget
 * @param {*} injectionTag
 * @param {boolean} [insertAfterTag=true]
 * @returns {string}
 */
const injectTagStringIntoString = (s, contents, injectionTarget, injectionTag, insertAfterTag = true, defaultBeforeContent = true) => {
	let injectionLocation = contents.search(injectionTarget);

	if (s.length) {
		if (injectionTag.length) {
			s = `<${injectionTag}>\n${s}\n</${injectionTag}>`;
		}

		if (injectionLocation == -1) {
			logInfo(`injection location not found: '${injectionTarget}', using default location of the document`);
			if (defaultBeforeContent) {
				return `${s}${contents}`;
			} else if (!defaultBeforeContent && insertAfterTag) {
				return `${contents}${s}`;
			} else {
				return `${s}${contents}`;
			}
		} else {
			if (insertAfterTag) {
				injectionLocation = injectionLocation + injectionTarget.length;
			}

			return `${contents.substring(0, injectionLocation)}${s}${contents.substring(injectionLocation)}`;
		}
	} else {
		debug('string to inject was empty', s);
		return contents;
	}
}

/**
 * @description used with inquirer questions to ensure that values entered have a length
 * @private
 * @param {*} input
 */
const makePromptRequired = function (input) {
	// This method has to be typehinted as a function for the async method

	// Declare function as asynchronous, and save the done callback
	var done = this.async();

	// Do async stuff
	setTimeout(function () {
		if (!input.length) {
			// Pass the return value in the done callback
			done('This value is required');
			return;
		}
		// Pass the return value in the done callback
		done(null, true);
	}, 100);
}

/**
 * @description used with inquirer questions to ensure that values entered from the CLI follow the required ruleset
 * @private
 * @param {string} input
 */
const makePromptRequiredAndSanitary = function (input) {
	// Declare function as asynchronous, and save the done callback
	var done = this.async();

	// Do async stuff
	setTimeout(function () {
		if (!input.length) {
			// Pass the return value in the done callback
			done('This value is required');
			return;
		} else if (/(^\s+|\s)|[A-Z]/g.test(input)) {
			done('This value cannot contain spaces and must be all lowercase');
			return;
		}
		// Pass the return value in the done callback
		done(null, true);
	}, 100);
}

/**
 * @description calls log asynchronously
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [type=null]
 * @param {*} [color=colors.grey]
 * @private
 * @returns {Promise}
 */
const logAsync = (message = '', obj, type = null, color = colors.grey) => {
	return new Promise((resolve) => {
		log(message, obj, type, color);
		return resolve();
	})
}

/**
 * @description logs a Data message
 * @private
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [color=colors.yellow]
 */
const logData = (message = '', obj, color = colors.yellow) => {
	log(message, obj, LOG_DATA, color)
}

/**
 * @description logs an Info message
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [color=colors.yellow]
 * @private
 */
const logInfo = (message = '', obj, color = colors.yellow) => {
	log(message, obj, LOG_INFO, color)
}

/**
 * @description logs a Critical message
 * @private
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [color=colors.red]
 */
const logCritical = (message = '', obj, color = colors.red) => {
	log(message, obj, LOG_CRITICAL, color)
}

/**
 * @description logs an Error message
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [color=colors.red]
 * @private
 */
const logError = (message = '', obj, color = colors.red) => {
	log(message, obj, LOG_ERROR, color)
}

/**
 * @description logs a Success message
 * @private
 * @param {string} [message='']
 * @param {*} obj
 * @param {*} [color=colors.green]
 */
const logSuccess = (message = '', obj, color = colors.green) => {
	log(message, obj, LOG_SUCCESS, color)
}

/**
 * @description logs an End message
 * @private
 * @param {string} [message='FiN!']
 * @param {*} obj
 * @param {*} [color=colors.rainbow]
 */
const logEnd = (message = 'FiN!', obj, color = colors.rainbow) => {
	log(message, obj, LOG_END, color)
}

/**
 * @description logs to the logger set
 * @private
 * @param {string} [message='']
 * @param {*} obj
 * @param {string} [type=LOG_INFO]
 * @param {*} [color=colors.grey]
 * @param {boolean} [showType=true]
 */
const log = (message = '', obj, type = LOG_INFO, color = colors.grey, showType = true, outputData = true, prettyMessage = true, force = false) => {
	if (!message.length) {
		return;
	}

	if (logLevel != LOG_ALL && !force) {
		if ((logLevel == LOG_CRITICAL) && ([LOG_SUCCESS, LOG_END, LOG_FAILURE, LOG_CRITICAL].indexOf(type) == -1)) {
			return;
		}

		if (logLevel != LOG_DEBUG && type == LOG_DEBUG) {
			return;
		} else if (logLevel == LOG_DEBUG) { } else if (logLevel != LOG_DEFAULT && type != logLevel) {
			// show these levels always
			if (type != LOG_SUCCESS && type != LOG_END) {
				return;
			}
		}
	}

	let logger = console;
	let logPrefix = `<~-`,
		logPostfix = `${logPrefix[1]}${logPrefix.replace('<', '>')[0]}`;

	switch (type) {
		case null:
			logger = logger.log;
			break;

		case LOG_ERROR:
			if (logToFile) {
				logger = logger.error;
			} else {
				logger = logger.error;
			}
			break;

		case 'LOG':
			if (logToFile) {
				logger = logger.log;
			} else {
				logger = logger.log;
			}
			break;

		case '':
		case LOG_INFO:
		default:
			if (logToFile) {
				logger = logger.info;
			} else {
				logger = logger.info;
			}
			break;
	}

	const datedMessage = `[${new Date(Date.now()).toLocaleString('en-US')}]${showType ? ` ${type.toLowerCase()}:` : ''} ${color(message)}`;
	message = prettyMessage ? color(`${logPrefix} ${message} ${logPostfix}`) : color(message);

	switch (logLevel) {
		case LOG_DEBUG_NODATA:
			outputData = false;
		case LOG_DATED:
			message = datedMessage;

		case LOG_DEBUG:
		case LOG_CRITICAL:
		case LOG_ALL:
			logger(message);

			if (outputData && obj) {
				logger(`=`, obj);
			}
			break;

		case LOG_NODATA:
		case LOG_DEFAULT:
		case LOG_INFO:
		default:
			logger(message);

			if (outputData && obj) {
				logger(`=`, obj);
			}
			break;

		// Logging turned off
		case 'NONE':
			if (force) {
				logger(message);

				if (outputData && obj) {
					logger(`=`, obj);
				}
			}
			break;
	}
}

/**
 * @description prompts the terminal with questions
 * @private
 * @param {array} questions the questions to ask the user
 * @param {function} getResults callback after prompt has completed
 * @param {boolean} [showOptional=false]
 * @param {boolean} [optionalOnly=null]
 * @returns {Promise} the Promise of a prompt of the user to the command line interface
 */
const promptConsole = (questions, getResults, showOptional = false, optionalOnly = null) => {
	let questionsToAsk = [],
		addQuestion = false;
	optionalOnly = optionalOnly != null ? optionalOnly : showOptional;

	questions.forEach(question => {
		addQuestion = false;
		question.message += `\n`;

		if (question.optional) {
			question.message = colors.yellow(question.message);

			if (showOptional) {
				addQuestion = true;
			}
		} else if (!optionalOnly) {
			addQuestion = true;
			question.message = colors.cyan.underline(question.message);
		}

		if (addQuestion) {
			questionsToAsk.push(question);
		}
	});

	return prompt.prompt(questionsToAsk).then(getResults);
}

/**
 * @description Runs sass on a stream
 * @private
 * @param {object} options
 * @returns {stream} through stream
 */
const sassify = (options) => {
	return through.obj((file, enc, cb) => {
		options = options || {};
		options.file = file.path;
		// if (file.sourceMap) {
		// options.sourceMap = true;
		// options.outFile = output.path('css');
		// }
		sass.render(options, (err, result) => {
			if (err) {
				logError(`Sass Error: ${err.message}`);
			} else {
				file.contents = result.css;
				// if (file.sourceMap) {
				// applySourceMap(file, result.map);
				// }
			}
			cb(err, file);
		});
	})
}

/**
 * @description uploads files to Amazon AWS S3
 * @param {string} toS3BucketPath
 * @param {string[]} includeFiles
 * @param {string} fromDirectory
 * @param {string[]} [excludeFiles=[]]
 * @param {object} config
 * @param {object} [metadata={}]
 * @private
 * @returns {Promise}
 */
const uploadFilesToS3 = (toS3BucketPath, includeFiles, fromDirectory, excludeFiles = [], config, metadata = {}) => {
	return new Promise(
		function (resolve, reject) {
			if (!config) {
				logError(`Could not find AWS configuration, aborting upload.`);
				return resolve();
			}

			const s3 = gulpS3(config);
			const metadataMap = {};
			// Amazon requires that all metadata values be strings
			Object.keys(metadata).forEach((key) => {
				metadataMap[key] = metadata[key].toString();
			});
			logInfo(
				`Uploading files from ${fromDirectory} to AWS S3 into path: ${toS3BucketPath}`, {
					includeFiles,
					excludeFiles,
					metadataMap: metadataMap,
				}
			);

			includeFiles = includeFiles.map(
				includeFile => `${fromDirectory}${includeFile}`
			);
			excludeFiles = excludeFiles.map(
				excludeFile => `!${fromDirectory}${excludeFile}`
			);

			return gulp
				.src(includeFiles.concat(excludeFiles))
				.pipe(
					s3({
						Bucket: toS3BucketPath,
						ACL: 'public-read',
						metadataMap,
					}, {
							maxRetries: 5,
						})
				)
				.on('error', function (err) {
					logCritical('S3 error', err);
					return reject(err);
				})
				.on(
					'end',
					function () {
						logSuccess(
							`Files successfully uploaded to S3 to the path: /${toS3BucketPath}`
						);
						return resolve();
					}
				);
		}
	);
}

/**
 * @description uploads files, or a single file, to Dropbox
 * @param {string[]} includeFiles
 * @param {string} fromDirectory
 * @param {string} [toDropboxPath='']
 * @param {string[]} [excludeFiles=[]]
 * @param {object} dropboxConfig
 * @param {string} outputFileName
 * @private
 * @returns {Promise}
 */
const uploadFilesToDropbox = (includeFiles, fromDirectory, toDropboxPath, excludeFiles = [], dropboxConfig, outputFileName) => {
	return new Promise(function (resolve, reject) {
		if (!dropboxConfig) {
			logError(`Could not find Dropbox configuration, aborting upload.`);
			return resolve();
		}
		let renameOutputFile = false;

		logInfo(
			`Uploading files from ${fromDirectory} to Dropbox into path: ${toDropboxPath}`, {
				includeFiles,
				excludeFiles,
				outputFileName,
			}
		);

		if (includeFiles.length === 1 && outputFileName) {
			renameOutputFile = true;
		}

		includeFiles = includeFiles.map(
			includeFile => `${fromDirectory}${includeFile}`
		);
		excludeFiles = excludeFiles.map(
			excludeFile => `!${fromDirectory}${excludeFile}`
		);

		return gulp.src(includeFiles.concat(excludeFiles), {
			base: '/'
		})
			.pipe(gulpif(renameOutputFile, rename(outputFileName)))
			.pipe(gulpDropbox({
				token: dropboxConfig.accessToken,
				path: toDropboxPath,
			}))
			.on('error', (err) => {
				logCritical('Dropbox error', err);
				reject(err);
			})
			.on('end', function () {
				logSuccess(`Files successfully uploaded to Dropbox to the path: ${toDropboxPath}`);
				resolve();
			});
	});
};

module.exports = {
	cleanPaths,
	convertPromptToJsonSchemaFormProperty,
	convertPromptToJsonSchemaUIFormProperty,
	copyFilesFromFolderToFolder,
	copyFileToFolder,
	downloadFile,
	fromDir,
	getActualArgObjects,
	getDropboxShareLinkMetadata,
	getFilenamesInDirectory,
	injectFilesIntoString,
	injectTagStringIntoString,
	logAsync,
	log,
	debug,
	logCritical,
	logInfo,
	logError,
	logEnd,
	logSuccess,
	makePromptRequired,
	makePromptRequiredAndSanitary,
	promptConsole,
	sassify,
	uploadFilesToDropbox,
	uploadFilesToS3,

	// CONSTANTS
	LOG_DEFAULT,
	LOG_CRITICAL,
	LOG_SUCCESS,
	LOG_DEBUG,
	LOG_DEBUG_NODATA,
	LOG_ALL,
	LOG_DATED,
	LOG_NODATA,
	LOG_NONE,
	LOG_FAILURE,
	LOG_ERROR,
	LOG_INFO,
	LOG_END,
	LOG_DONE,
}
