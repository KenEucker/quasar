// throw 'requiring LIB';
const gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	inject = require('gulp-inject-string'),
	insert = require('gulp-insert'),
	concat = require('gulp-concat'),
	flatmap = require('gulp-flatmap'),
	mustache = require('gulp-mustache'),
	browserify = require('gulp-browserify'),
	babel = require('gulp-babel'),
	gulpS3 = require('gulp-s3-upload'),
	spawn = require("child_process"),
	prompt = require('inquirer'),
	sass = require('dart-sass')
runSequence = require('run-sequence').use(gulp),
	aws = require('aws-sdk'),
	through = require('through2'),
	del = require('del'),
	unzip = require("extract-zip"),
	path = require('path'),
	cssMin = require('clean-css'),
	jsMin = require('uglify-es'),
	htmlMin = require('html-minifier'),
	colors = require('colors'),
	os = require('os'),
	lastLine = require('last-line'),
	fs = require('fs'),
	yargs = require('yargs');
mkdir = require('mkdirp-sync'),
	tryRequire = require('try-require'),
	promise = Promise;

const LOG_DEFAULT = LOG_CRITICAL = 'CRITICAL', LOG_SUCCESS = 'SUCCESS', LOG_DEBUG = 'DEBUG', LOG_DEBUG_NODATA = 'DEBUG-NODATA', LOG_ALL = 'ALL', LOG_DATED = 'DATED', LOG_NODATA = 'NODATA', LOG_NONE = 'NONE', LOG_ERROR = 'ERROR', LOG_INFO = 'INFO', LOG_END = LOG_DONE = 'END';
const STATUS_CREATED = 'created', STATUS_QUEUED = 'queued', STATUS_COMPLETED = 'completed', STATUS_FAILED = 'failed';
let _config = {};
let getConfig = () => {
	return _config;
}

// Logger
let logToFile = yargs.argv.logFile || false, logDate = yargs.argv.logDate, logSeverity = Array.isArray(yargs.argv.logSeverity) ? yargs.argv.logSeverity[yargs.argv.logSeverity.length - 1] : yargs.argv.logSeverity ? yargs.argv.logSeverity : LOG_DEFAULT;
logSeverity = logSeverity.toUpperCase();
const logAsync = (message, obj, type = null, color = colors.grey) => { return new promise((resolve, reject) => { log(message, obj, type, color); return resolve(); }) }
const logData = (message, obj, color = colors.yellow) => { log(message, obj, LOG_DATA, color) }
const logInfo = (message, obj, color = colors.yellow) => { log(message, obj, LOG_INFO, color) }
const logCritical = (message, obj, color = colors.red) => { log(message, obj, LOG_CRITICAL, color) }
const logError = (message, obj, color = colors.red) => { log(message, obj, LOG_ERROR, color) }
const logSuccess = (message, obj, color = colors.green) => { log(message, obj, LOG_SUCCESS, color) }
const logEnd = (message = 'FiN!', obj, color = colors.green) => { log(message, obj, LOG_END, color) }
const log = (message, obj, type = LOG_INFO, color = colors.grey) => {
	if (logSeverity.indexOf(LOG_DEBUG) == -1) {
		if ((logSeverity == LOG_CRITICAL) && ([ LOG_SUCCESS, LOG_ERROR, LOG_CRITICAL ].indexOf(type) == -1)) {
			return;
		}
		if (type == 'debug') {
			return;
		}
	} else if (type == 'error' && message == message) {
		console.log(message);
	}

	let logger = console;
	let logPrefix = `<~-`, logPostfix = `${logPrefix[1]}${logPrefix.replace('<', '>')[0]}`;

	switch (type) {
		case null:
			logger = logger.log;
			break;

		case 'error':
			if (logToFile) {
				logger = logger.error;
			} else {
				logger = logger.error;
			}
			break;

		case 'log':
			if (logToFile) {
				logger = logger.log;
			} else {
				logger = logger.log;
			}
			break;

		case '':
		case 'info':
		default:
			if (logToFile) {
				logger = logger.info;
			} else {
				logger = logger.info;
			}
			break;
	}

	const datedMessage = `${logDate ? `[${new Date(Date.now()).toLocaleString('en-US')}] ` : ``}${type && type.length ? ` ${type.toLowerCase()}: ` : ''}${message}`;
	const prettyMessage = `${logPrefix} ${datedMessage} ${logPostfix}`;

	switch (logSeverity) {
		case LOG_DEBUG_NODATA:
			obj = null;
		case LOG_DEBUG:
		case LOG_ALL:
			logger(color(prettyMessage));

			if (obj) {
				logger(color(`>`), obj);
			}
			break;

		case LOG_DATED:
			logger(color(datedMessage));
			break;

		case LOG_NODATA:
			logger(color(message));
			break;

		// Logging turned off
		case 'NONE':
			break;

		case LOG_DEFAULT:
		default:
			logger(color(prettyMessage));
			break;
	}

	return;
}

const debug = (message, obj, condition = true) => {
	log(message, obj, 'debug', condition ? colors.blue : colors.red)
}

const getActualArgObjects = (quasArgs, onlyObjects = null) => {
	const noArgTypes = ['object', 'function'];
	const skipKeys = ['/bin/zsh', '$0', 'noPrompt'];
	let recordedKeys = [];

	return Object.keys(quasArgs).map((k) => {
		const skipValue = noArgTypes.indexOf(typeof quasArgs[k]) != -1 || skipKeys.indexOf(k) != -1 || recordedKeys.indexOf(k) != -1 || (onlyObjects ? onlyObjects.indexOf(k) == -1 : false);
		if (!skipValue) {
			recordedKeys.push(k);
			return `--${k}=\"${quasArgs[k]}\"`;
		}
	});
}

const logArgsToFile = (quasArgs, toStatus = null, overwite = false) => {
	if (logToFile && toStatus == STATUS_COMPLETED) {
		const logFilePath = path.resolve(`${quasArgs.applicationRoot}/${quasArgs.logFile}`);
		const cliArgs = getActualArgObjects(quasArgs);
		fs.appendFileSync(logFilePath, `node cli.js ${cliArgs.join(' ')} --noPrompt=true\r\n`, (err) => {
			if (err) throw err;
			logSuccess(`Logged to logfile: ${logFilePath}`);
		});
	}

	if (overwite || !(quasArgs.status == STATUS_CREATED && toStatus == null)) {
		if (overwite && quasArgs.status == toStatus) {
			quasArgs.error = `${quasArgs.error ? `${quasArgs.error} \n>` : ''}WARN: overwriting jobfile. Was this done intentionally?`;
		}
		if (quasArgs.argsFile && fs.existsSync(quasArgs.argsFile)) {
			quasArgs.outputFilePath = `${getQuasarOutputPath(quasArgs)}/${quasArgs.output}${quasArgs.outputExt}`;
			fs.unlinkSync(quasArgs.argsFile);
		}

		quasArgs.argsFile = quasArgs.argsFile.replace(`/${quasArgs.status}`, `/${toStatus}`);
		quasArgs.status = toStatus;

		fs.writeFileSync(quasArgs.argsFile, JSON.stringify(quasArgs));
		debug(`did write contents to build file: ${quasArgs.argsFile}`, JSON.stringify(quasArgs));
	}

	return quasArgs;
}

const runLastSuccessfulBuild = (quasArgs = null) => {
	return new promise((resolve, reject) => {
		if (!quasArgs) {
			quasArgs = { logFile: `.log`, applicationRoot: _config.applicationRoot };
		}
		const logFilePath = path.resolve(`${quasArgs.applicationRoot}/${quasArgs.logFile}`);
		let command = null;

		if (fs.existsSync(logFilePath)) {
			lastLine(logFilePath, function (err, command) {
				if (err) {
					logError(`Could not read last line from logfile: ${logFilePath}`);
					return reject();
				}
				if (!command.length) {
					logError(`Nothing in logfile: ${logFilePath}`);
					return reject();
				}
				logSuccess(`Running the last found command in the logfile`);
				command = command.replace(`node cli.js`, ``);
				let args = command.split(' ');
				args = args.map(k => { return k.replace(/"/g, '') });
				spawnCommand(args);

				return resolve();
			});
		} else {
			logError(`Could not find logfile: ${logFilePath}`);
		}
	})
}

const getQuasArgs = (qType = null, requiredArgs = null, nonRequiredArgs = {}, registerArgs = true) => {
	let fromFile = {},
		jobTimestamp = Date.now(),
		cliArgs = {};
	argsFile = yargs.argv.argsFile,
		status = STATUS_CREATED,
		argsFileExists = argsFile && fs.existsSync(argsFile),
		assetsFolder = `${_config.assetsFolder}/${qType}`;

	// If the argsFile parameter is set and the file exists, load parameters from file
	if (argsFileExists) {
		const tempFile = fs.readFileSync(argsFile, "utf8");
		fromFile = JSON.parse(tempFile);
		jobTimestamp = (argsFile.split('_').pop().split('.')[0]);
	}

	// HACK for falsey values in yargs and multi values
	Object.keys(yargs.argv).forEach((k) => {
		if (k) {
			const v = yargs.argv[k];
			let arg = Array.isArray(v) ? v[v.length - 1] : v;
			arg = arg == "true" || arg == "false" ? arg == "true" : arg;
			if (arg != undefined || arg == null) {
				cliArgs[k] = arg;
			} else if (Array.isArray(v)) {
				arg = v[0];
				if (arg == undefined || arg == null) {
					return;
				}
				cliArgs[k] = arg;
			} else {
				return;
			}
		}
	});

	let quasArgs = Object.assign(
		// Defaults
		{
			jobTimestamp,
			applicationRoot: _config.applicationRoot,
			outputFolder: _config.outputFolder,
			sourceFolder: _config.sourceFolder,
			jobsFolder: _config.jobsFolder,
			templatesFolder: qType ? `${_config.templatesFolder}/${qType}` : undefined,
			assetsFolder: qType ? assetsFolder : undefined,
			targetFilePath: qType ? `${assetsFolder}/${qType}.html` : undefined,
			stylesPreAsset: qType ? `${assetsFolder}/${qType}.css` : undefined,
			scriptsPostAsset: qType ? `${assetsFolder}/${qType}.js` : undefined,
			target: qType ? `${qType}.html` : undefined,
			targetEnvironments: [],
			bucket: '%AWS%',
			sourceExt: '.zip',
			outputExt: '.txt',
			cdnUrlStart: 'https://cdn.com/',
			uploadToS3: false,
			unpackFiles: true,
			cssInjectLocations: ['<head>', '</head>'],
			jsInjectLocations: ['<body>', '</body>'],
			minifyScripts: true,
			minifyStyles: true,
			minifyHtml: true,
			overwriteUnpackDestination: true,
			overwriteTargetFileFromTemplate: true,
			cleanUpTargetFileTemplate: false,
			useJobTimestampForBuild: true,
			buildCompletedSuccessfully: false,
			excludeOutputFileFromUpload: true,
			versionOutputFile: true,
			outputVersion: 1,
			logFile: '.log',
			argsFile: argsFile || `${_config.jobsFolder}/${status}/${qType}_${jobTimestamp}.json`,
			requiredArgs: requiredArgs,
			status,
			qType
		},
		// CLI args
		cliArgs,
		// Loaded from file with arg --argsFile
		fromFile);

	if (quasArgs.useJobTimestampForBuild) {
		quasArgs.assetsFolder = `${quasArgs.assetsFolder}_${quasArgs.jobTimestamp}`;
		quasArgs.targetFilePath = `${quasArgs.assetsFolder}/${qType}.html`;
		quasArgs.stylesPreAsset = `${quasArgs.assetsFolder}/${qType}.css`;
		quasArgs.scriptsPostAsset = `${quasArgs.assetsFolder}/${qType}.js`;
	}

	if (registerArgs) {
		quasArgs = registerRequiredQuasArgs(quasArgs, requiredArgs, nonRequiredArgs);
	}

	return quasArgs;
}

const setSourceAndOutputArgs = (quasArgs) => {
	if (quasArgs.source == 'none') {
		quasArgs.source = null;
	} else if (quasArgs.source && quasArgs.source.length) {
		const split = quasArgs.source.split('.');

		if (split.length > 1) {
			quasArgs.sourceExt = `.${split.pop()}`;
			quasArgs.source = quasArgs.source.substr(0, quasArgs.source.length - quasArgs.sourceExt.length);
		}
	}

	if (quasArgs.output && quasArgs.output.length) {
		const split = quasArgs.output.split('.');

		if (split.length > 1) {
			quasArgs.outputExt = `.${split.pop()}`;
			quasArgs.output = quasArgs.output.substr(0, quasArgs.output.length - quasArgs.outputExt.length);
		}
	} else {
		//Default the output filename to the signal
		quasArgs.output = `${quasArgs.domain}_${quasArgs.signal}_${quasArgs.oType}_${new Date().toLocaleDateString("en-US").replace(/\//g, '-')}_${quasArgs.targetEnvironments.join('-')}`;
	}

	return quasArgs;
}

const definitelyCallFunction = (cb, resolve = null) => {
	if (process.title == 'gulp' && !(gulp.hasTask('default'))) {
		gulp.task('default', () => {
			cb();
			if (resolve) { resolve() }
		});
	} else {
		cb();
		if (resolve) { resolve() }
	}
}

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
			}
			else {
				file.contents = result.css;
				// if (file.sourceMap) {
				// applySourceMap(file, result.map);
				// }
			}
			cb(err, file);
		});
	})
}

const spawnCommand = (args = [], command = `node`, synchronous = false) => {
	if (command == `node`) {
		args.unshift(`cli.js`);
	}
	log(`Running command ${command} ${args.join(' ')}`);
	const spawnOptions = { stdio: "inherit" };

	if (synchronous) {
		return spawn.spawnSync(command, args, spawnOptions);
	}

	spawn.spawn(command, args, spawnOptions)
		.on("error", (error) => { logError(error); })
		.on("data", (data) => { logData('DATA: ', data); })
		.on("close", (msg) => { logInfo(`command ended with message: ${msg}`); });
}

const getAvailableTaskNames = () => {
	return Array.prototype.map.call(_config.tasks, (task) => {
		return task.qType;
	});
}

const getTaskNames = (dir = null) => {
	if (!dir) {
		dir = path.resolve(_config.tasksFolder);
	}

	return getFilenamesInDirectory(dir, ['js'], true);
}

const logBuildQueued = (quasArgs) => {
	if (quasArgs.status != STATUS_QUEUED || !(fs.existsSync(`${quasArgs.jobsFolder}/${STATUS_QUEUED}/${quasArgs.qType}_${quasArgs.jobTimestamp}.json`))) {
		quasArgs = logArgsToFile(quasArgs, STATUS_QUEUED);
	} else {
		quasArgs.status = STATUS_QUEUED;
	}
	debug(`did queue build with args`, quasArgs);

	return quasArgs;
}

const getIconFilePath = (rootPath = process.cwd(), iconName = 'icon', iconExt = '.ico') => {
	if (fs.existsSync(`${rootPath}/${iconName}${iconExt}`)) {
		return `${rootPath}/${iconName}${iconExt}`;
	}

	const iconExtensionsInOrder = ['ico', 'icns', 'png', 'jpg'], nextIconExtension = iconExtensionsInOrder.indexOf(iconExt);
	if (nextIconExtension >= 0) {
		return getIconFilePath(rootPath, nextIconExtension);
	} else {
		return false;
	}
}

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

const getQuasarOutputPath = (quasArgs = {}) => {
	return `${quasArgs.outputFolder.replace(path.resolve(`${quasArgs.outputFolder}../`), '')}/${quasArgs.domain}/${quasArgs.signal}`;
}

const findOutputDirectory = (startPath, outputDirectory = 'jobs', maxLevels = 5) => {
	if (!fs.existsSync(startPath)) {
		return;
	}

	// If the startPath is the one we are looking for
	let stat = fs.lstatSync(startPath);
	if (stat.isDirectory() && startPath.split('/').pop() == outputDirectory) {
		return startPath;
	}

	// If the path we are looking for is a sybling of the startPath
	const files = fs.readdirSync(startPath);
	for (let i = 0; i < files.length; i++) {
		const pathname = path.join(startPath, files[i]);

		stat = fs.lstatSync(pathname);
		if (stat.isDirectory() && pathname.split('/').pop() == outputDirectory) {
			return pathname;
		}
	}

	if (maxLevels > 0) {
		return findOutputDirectory(path.resolve(startPath, '../'), outputDirectory, maxLevels - 1);
	} else {
		return;
	}
}

const fromDir = (startPath, filter, extension = '') => {
	let found = '';

	if (!extension.length) {
		extension = `.${filter.split('.').pop()}`;
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
		} else if (!filter.length && `.${filename.split('.').pop()}` == extension) {
			return filename;
		} else if (`${filename.split('/').pop()}` == `${filter}${extension}`) {
			return filename;
		};
	};

	return found;
}

const registerTask = (taskName, chain) => {
	gulp.task(taskName, chain);
	debug(`did register gulp task ${taskName}`);
}

const runTask = (task, registerTask = false, end) => {
	return new promise((resolve, reject) => {
		if (!end) {
			end = () => {
				logEnd(`quasar ${task} ended`);
				process.exit();
			}
		}
		if (registerTask) {
			loadTasks([task]);
		}
		if (gulp.hasTask(task)) {
			try {
				debug(`will run task [${task}]`);
				runSequence(task, end);
			} catch (e) {
				logError(e);
				return reject();
			}
			return resolve();
		} else {
			logError(`Cannot find gulp task ${task}`);

			return reject(task);
		}
	})
		.catch((e) => {
			logError(e);
		})
}

const quasarSelectPrompt = (quasArgs) => {
	return new promise((resolve, reject) => {
		let availableTasks = getAvailableTaskNames();

		return promptConsole([{
			type: 'list',
			name: 'task',
			message: `Select the type of quasar you want to launch`,
			choices: quasArgs.availableTasks || ["uhhh nevermind"]
		}], (res) => {
			if (res.task !== "uhhh nevermind") {
				return runTask(res.task);
			} else {
				logEnd("Allllllrrrriiiiiiiggggghhhhhttttttyyyyyy thhhheeennnnn");
			}
		});
	})
}

const loadTasks = (taskPaths = null, loadDefaults = true, clobber = true) => {
	if (clobber) {
		_config.tasks = [];
	}

	if (!taskPaths && loadDefaults) {
		taskPaths = getTaskNames();
		taskPaths.splice(taskPaths.indexOf('quasarWebform'), 1);
		logInfo(`Loading default quasars (${taskPaths})`);
	} else if (!taskPaths) {
		return null;
	}

	for (var task of [].concat(taskPaths)) {
		let resolvedFilePath = tryRequire.resolve(task), newTask = null;
		resolvedFilePath = resolvedFilePath ? `${resolvedFilePath}.js` : null;

		if (!resolvedFilePath) {
			resolvedFilePath = tryRequire.resolve(`${_config.tasksFolder}/${task}.js`);
		}

		if (resolvedFilePath) {
			newTask = require(resolvedFilePath);
			newTask.init(null, _config.applicationRoot, _config, true);
			_config.tasks.push(newTask);
		} else {
			logError(`could not load task at ${task} or ${resolvedFilePath}`);
		}
	}

	return Array.prototype.map.call(_config.tasks, (task) => {
		return task.qType;
	});
}

const promptUser = (quasArgs) => {
	debug(`will prompt the user from the console`, quasArgs.requiredArgs);

	return promptConsole(quasArgs.requiredArgs, (userResponse) => {
		if (userResponse.askOptionalQuestions) {
			return promptConsole(quasArgs.requiredArgs, (res) => { quasArgs.requiredArgsValidation(Object.assign(userResponse, res)) }, true);
		} else {
			return quasArgs.requiredArgsValidation(userResponse);
		}
	})
}

const promptConsole = (questions, getResults, showOptional = false, optionalOnly = null) => {
	let questionsToAsk = [], addQuestion = false;
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

// This one has to be typehinted as a function for the async method
const makePromptRequired = function (input) {
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

const getQuasarPromptQuestions = (quasArgs) => {
	return [{
		type: 'input',
		name: 'domain',
		message: 'Enter the name of the domain to be used in building assets:',
		required: true,
		validate: makePromptRequiredAndSanitary
	}, {
		type: 'input',
		name: 'signal',
		message: 'Enter the name of the signal to be used when compiling quasars:',
		required: true,
		validate: makePromptRequiredAndSanitary
	}, {
		type: 'confirm',
		name: 'askOptionalQuestions',
		message: 'Show additional settings?',
		default: false
	}];
}

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
		case 'list':
			// TODO: add fields, on the quasar side, for what type of field this should be
			if (prompt.name == 'source') {
				property.type = 'string';
			} else {
				property.type = 'string';
				property.enum = prompt.choices;
			}
			break;
		case 'confirm':
			property.type = "boolean";
			property.enum = [true, false]
			property.enumNames = ['yes', 'no']
			property.default = property.default ? 'yes' : 'no';
		default:
			break;
	}

	return property;
}

const convertPromptToJsonSchemaUIFormProperty = (prompt) => {
	let title = prompt.message || '',
		widget = prompt.type || 'input',
		help = prompt.help || '';
	classNames = '',
		options = {},
		ui = {};

	switch (widget) {
		case 'input':
			widget = 'text';
			break;

		case 'confirm':
			widget = 'radio';
			break;

		case 'list':
			if (prompt.name == 'source') {
				widget = 'file';
			} else {
				widget = 'radio';
			}
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

// This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter
// https://www.npmjs.com/package/inquirer#questions
const registerRequiredQuasArgs = (quasArgs, requiredArgs = null, nonRequiredArgs = {}, addDefaultRequiredArgs = true) => {
	quasArgs = Object.assign(quasArgs, nonRequiredArgs);

	if (!quasArgs.requiredArgs) {
		debug(`[will${addDefaultRequiredArgs ? '' : ' not'}] add default args to ${quasArgs.qType}`, addDefaultRequiredArgs);
		quasArgs.requiredArgs = addDefaultRequiredArgs ? getQuasarPromptQuestions(quasArgs) : quasArgs.requiredArgs;
		quasArgs.requiredArgs = quasArgs.requiredArgs.concat(requiredArgs);
	} else {
		// TODO: update two arrays of objects
	}

	quasArgs.requiredArgs.forEach((arg) => {
		quasArgs[arg.name] = quasArgs[arg.name] || arg.default || '';
	});

	// TODO: Reorder so the add optional question is at the end

	return quasArgs;
}

const hasQuasarInitialArgs = (quasArgs) => {
	return quasArgs.domain && quasArgs.signal;
}

const findTargetFile = (quasArgs) => {
	let targetFilePath = quasArgs.targetFilePath;

	if (!fs.existsSync(targetFilePath)) {
		const oldTargetFilePath = targetFilePath;
		targetFilePath = fromDir(`${quasArgs.templatesFolder}`, `${quasArgs.target}`);

		if (!targetFilePath) {
			const oldestTargetFilePath = targetFilePath;
			targetFilePath = fromDir(`${quasArgs.assetsFolder}`, '', `.html`);

			if (targetFilePath) {
				log(`did not find targetFile at ${oldTargetFilePath} or at ${oldestTargetFilePath} but did find a file at -> ${targetFilePath}`);
				targetFilePath = path.resolve(targetFilePath);
			} else {
				logError(`no targetFile exists at ${oldTargetFilePath} or ${oldestTargetFilePath} or ${targetFilePath}`);
			}
		} else {
			log(`did not find targetFile at ${oldTargetFilePath}, corrected path is: ${targetFilePath}`);
			targetFilePath = path.resolve(targetFilePath);
		}
	}

	return targetFilePath;
}

const moveTargetFilesToRootOfAssetsPath = (quasArgs) => {
	return new promise((resolve, reject) => {
		let targetFilePath = findTargetFile(quasArgs);

		if (!targetFilePath) {
			logInfo(`did not find a templated target file, using first available file that matches the target (${quasArgs.target}) in the assets path: ${quasArgs.assetsFolder}`);
			targetFilePath = fromDir(quasArgs.assetsFolder, quasArgs.target);
			log(`new targetFile: ${targetFilePath}`);
		}

		// Error
		if (!targetFilePath) {
			return resolve(quasArgs);
		}

		if (targetFilePath !== `${quasArgs.assetsFolder}/${quasArgs.target}`) {
			const baseDir = path.dirname(targetFilePath);
			// logInfo(`Moving files from deep folder structure (${baseDir}) to base assets path (${quasArgs.assetsFolder})`);
			return gulp.src(`${baseDir}/**`)
				.pipe(gulp.dest(quasArgs.assetsFolder))
				.on('error', (err) => {
					logError(err);
					return reject(quasArgs);
				})
				.on('end', () => {
					logSuccess(`files moved from deep folder structure (${baseDir}) to base assets path (${quasArgs.assetsFolder})`);
					quasArgs.targetFilePath = targetFilePath;
					let remove = baseDir.replace(quasArgs.assetsFolder, '').substr(1).split('/');
					remove = path.resolve(`${quasArgs.assetsFolder}/${remove[0]}`);
					del.sync(path.resolve(remove), { force: true });

					return resolve(quasArgs);
				});
		}

		return resolve(quasArgs);
	});
}

const copyFilesToOutputFolder = (quasArgs, fromDirectory, files, excludeFiles = []) => {
	return new promise((resolve, reject) => {
		const destinationPath = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`;
		logInfo(`copying files (${files.join()}) from ${fromDirectory}/ to ${destinationPath}`);

		files = files.map(file => `${fromDirectory}/${file}`);
		excludeFiles = excludeFiles.map(excludeFile => `!${fromDirectory}/${excludeFile}`);
		return gulp.src(excludeFiles.concat(files), { base: fromDirectory })
			.pipe(gulp.dest(destinationPath))
			.on('end', () => {
				return resolve(quasArgs);
			});
	});
}

const copyFilesFromTemplatesFolderToOutput = (quasArgs, files, excludeFiles = []) => {
	return copyFilesToOutputFolder(quasArgs, quasArgs.templatesFolder, files, excludeFiles);
}

const copyFilesFromAssetsFolderToOutput = (quasArgs, files, excludeFiles = null) => {
	if (!excludeFiles) {
		excludeFiles = [`${quasArgs.target}`, `${quasArgs.qType}.html`, `${quasArgs.qType}.css`, `${quasArgs.qType}.js`];
	}

	return copyFilesToOutputFolder(quasArgs, quasArgs.assetsFolder, files, excludeFiles);
}

const copyFilesFromSourcesFolderToOutput = (quasArgs, files = null, excludeFiles = []) => {
	return new promise((resolve, reject) => {
		if (!files && quasArgs.source && quasArgs.source.length) {
			if (quasArgs.sourceExt === '.zip') {
				log(`unpacking files from archive ${quasArgs.source}${quasArgs.sourceExt}`);
				return unpackFiles(quasArgs)
					.then(() => { return copyFilesFromAssetsFolderToOutput(quasArgs, ['**']) })
					.then(resolve);
			}
			files = [`${quasArgs.source}${quasArgs.sourceExt}`];
		} else {
			return resolve(quasArgs);
		}

		return copyFilesToOutputFolder(quasArgs, quasArgs.sourceFolder, files, excludeFiles)
			.then(resolve);
	});
}

const copyTemplateFilesToAssetsPath = (quasArgs) => {
	//return new promise((resolve, reject) => {
	let targetFilePath = fs.existsSync(quasArgs.targetFilePath) ? quasArgs.targetFilePath : findTargetFile(quasArgs);
	const cssAssetPath = path.resolve(`${quasArgs.templatesFolder}/${quasArgs.qType}.css`);
	const jsAssetPath = path.resolve(`${quasArgs.templatesFolder}/${quasArgs.qType}.js`);

	debug(`will copy template files to assetsFolder [${quasArgs.assetsFolder}]`, [targetFilePath, cssAssetPath, jsAssetPath]);
	mkdir(quasArgs.assetsFolder);
	if (fs.existsSync(targetFilePath)) {
		if (quasArgs.overwriteTargetFileFromTemplate && (targetFilePath === path.resolve(`${quasArgs.assetsFolder}/${quasArgs.qType}.html`))) {
			const templateTargetFilePath = path.resolve(`${quasArgs.templatesFolder}/${quasArgs.qType}.html`);
			if (fs.existsSync(templateTargetFilePath)) {
				log(`clobbering with template targetFile ${templateTargetFilePath}`);
				targetFilePath = templateTargetFilePath;
			}
		}

		const outfile1 = fs.readFileSync(targetFilePath, 'utf-8');
		let target = targetFilePath.split('/').pop();
		const outputTargetFilePath = `${quasArgs.assetsFolder}/${target}`;

		if (outfile1) {
			log(`copying target file from ${targetFilePath} to assets path: ${outputTargetFilePath}`);
			fs.writeFileSync(outputTargetFilePath, outfile1);
			quasArgs.targetFilePath = outputTargetFilePath;
			quasArgs.target = outputTargetFilePath.split('/').pop();
		} else {
			logError(`could not read targetFile for copying to assets path ${targetFilePath}`);
			quasArgs.targetFilePath = targetFilePath;
		}
	}
		if (fs.existsSync(cssAssetPath)) {

		const outfile2 = fs.readFileSync(cssAssetPath, 'utf-8');
		const outputCssAssetPath = `${quasArgs.assetsFolder}/${quasArgs.qType}.css`;

		if (!outfile2) {
			quasArgs.stylesPreAsset = cssAssetPath;
		}

		log(`copying css asset file to assets path: ${outputCssAssetPath}`);
		fs.writeFileSync(outputCssAssetPath, outfile2);
		quasArgs.stylesAsset = outputCssAssetPath;
	}
	if (fs.existsSync(jsAssetPath)) {
		const outfile3 = fs.readFileSync(jsAssetPath, 'utf-8');
		const outputJsAssetPath = `${quasArgs.assetsFolder}/${quasArgs.qType}.js`;

		if (!outfile3) {
			quasArgs.scriptsPostAsset = jsAssetPath;
		}

		log(`copying js asset file to assets path: ${outputJsAssetPath}`);
		fs.writeFileSync(outputJsAssetPath, outfile3);
		quasArgs.scriptsPostAsset = outputJsAssetPath;
	}
	return quasArgs;
	//	return resolve(quasArgs);
	//})
}

const cleanPaths = (paths, force = false) => {
	return del.sync(paths, { force: true });
}

const cleanOutputFolders = (quasArgs, allFolders = false) => {
	const outputFolders = allFolders ? path.resolve(`${quasArgs.outputFolder}/`, `../`) : quasArgs.outputFolder;
	debug(`will delete all files in the output path`, outputFolders);
	return cleanPaths(`${outputFolders}`, true);
}

const cleanDevFolders = (quasArgs) => {
	const devPaths = [`${quasArgs.applicationRoot}/app`, `${quasArgs.applicationRoot}/dist`];
	debug(`will delete all files in the application root paths`, devPaths);
	return cleanPaths(devPaths);
}

// Unpack input files
const unpackFiles = (quasArgs) => {
	return new promise((resolve, reject) => {
		if (!quasArgs.unpackFiles || !quasArgs.source || quasArgs.sourceExt != '.zip') {
			return resolve(quasArgs);
		}

		const destinationPath = path.resolve(`${quasArgs.assetsFolder}`);
		const destinationPathExists = fs.existsSync(destinationPath);
		if (!quasArgs.overwriteUnpackDestination && destinationPathExists) {
			logError(`files have already been unpacked, run again with option --overwriteUnpackDestination=true to overwite files.`);
			return resolve(quasArgs);
		} else {
			logInfo(`${destinationPathExists ? `overwriting files in assets folder ${destinationPath}` : `leaving files in unpack destination (${destinationPath}) unmodified`}`);

			if (destinationPathExists) {
				del.sync(destinationPath, { force: true });
			}
		}
		mkdir(destinationPath);

		const zipFilePath = path.resolve(`${quasArgs.sourceFolder}/${quasArgs.source}${quasArgs.sourceExt}`);
		if (!fs.existsSync(zipFilePath)) {
			logError(`source could not be found`, zipFilePath);
			return reject();
		}
		log(`unpacking source files from (${zipFilePath}) to the folder (${destinationPath}) before building output`);

		unzip(zipFilePath, { dir: destinationPath }, (err) => {
			// extraction is complete. make sure to handle the err
			if (err) {
				logError(err.Error || err, colors.red);
				return reject();
			}

			logSuccess(`files successfully unziped to ${destinationPath}`);
			return resolve(quasArgs);
		});
	});
}

const compileStylesToAssetsFolder = (quasArgs) => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.scss`)
		// Compile sass
		.pipe(sassify())
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.css`))
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { logError(err) })
		.on('end', () => { logInfo(`Styles compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.css`); })
}

const compileScriptsToAssetsFolder = (quasArgs) => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.jsx`)
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.js`, { newLine: `;\n` }))
		// Make it useful
		.pipe(babel({ presets: ['env', 'react'] }))
		// Make it compatible
		.pipe(browserify({
			ignoreMissing: true,
			noBuiltins: true,
			noCommondir: true
		}))
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { logError(err) })
		.on('end', () => { logInfo(`Scripts compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.js`); })
}

const compileTargetFileToAssetsFolder = (quasArgs) => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.mustache`)
		// Compile mustache file
		.pipe(flatmap((stream, file) => {
			const filename = `${file.path}.json`;
			if (fs.existsSync(filename)) {
				return stream.pipe(mustache(filename, {}, {}));
			} else {
				return stream.pipe(mustache());
			}
		}))
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.html`), { newLine: `\n<!-- Section -->\n` })
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { logError(err) })
		.on('end', () => { logInfo(`Documents compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.html`); })
}

const injectFilesIntoStream = (quasArgs, filePath, contents, injectionTarget, injectionTag, after = true) => {
	if (filePath) {
		let fileContents = fs.readFileSync(filePath);
		let injectionLocation = contents.search(injectionTarget);
		injectionLocation = injectionLocation != -1 && after ? injectionLocation + injectionTarget.length : injectionLocation;

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
		fileContents = fileContents.length ? `<${injectionTag}>\n${fileContents}\n</${injectionTag}>\n` : ``;

		if (injectionLocation == -1) {
			logInfo(`injection location not found: '${injectionTarget}', using default location of prepending to document`);
			return `${fileContents}\n<!-- End Of Automatic Css Injection -->\n${contents}`;
		} else if (fileContents) {
			return `${contents.substring(0, injectionLocation)}${fileContents}${contents.substring(injectionLocation)}`;
		}
	}

	return contents;
}

// Inject the code into the html file before applying template vars
const injectCode = (quasArgs) => {
	return new promise((resolve, reject) => {
		const urlToPrependCDNLink = quasArgs.target ? quasArgs.target.replace('.html', '') : quasArgs.targetFilePath.split('/').pop().replace('.html', '');
		const cdnTemplate = `<%= cdnUrlStart %><%= bucketPath %>/`;
		const preCss = fs.existsSync(quasArgs.stylesPreAsset) ? quasArgs.stylesPreAsset : null;
		const postCss = fs.existsSync(quasArgs.stylesPostAsset) ? quasArgs.stylesPostAsset : null;
		const preJs = fs.existsSync(quasArgs.scriptsPreAsset) ? quasArgs.scriptsPreAsset : null;
		const postJs = fs.existsSync(quasArgs.scriptsPostAsset) ? quasArgs.scriptsPostAsset : null;

		quasArgs = logBuildQueued(quasArgs);
		log('injecting code prior to applying template parameters');
		log(`getting assets from (${quasArgs.assetsFolder})`);
		log(`getting template file (${quasArgs.targetFilePath.replace(quasArgs.assetsFolder, '')}) and assets(css - pre:${preCss ? path.basename(preCss) : ``}, post: ${postCss ? path.basename(postCss) : ``}   js: pre:${preJs ? path.basename(preJs) : ``}, post: ${postJs ? path.basename(postJs) : ``})`);

		return gulp.src(quasArgs.targetFilePath, { base: quasArgs.applicationRoot })
			.pipe(inject.before(`${urlToPrependCDNLink}.`, cdnTemplate))
			.pipe(insert.transform((contents, file) => {
				if (quasArgs.minifyStyles && (preCss || postCss)) {
					contents = injectFilesIntoStream(quasArgs, preCss, contents, quasArgs.cssInjectLocations.length ? quasArgs.cssInjectLocations[0] : quasArgs.cssInjectLocations, 'style');
					contents = injectFilesIntoStream(quasArgs, postCss, contents, quasArgs.cssInjectLocations.length > 1 ? quasArgs.cssInjectLocations[1] : quasArgs.cssInjectLocations[0], 'style', false);
					debug(`styles did minify`);
				}

				return contents;
			}))
			.pipe(insert.transform((contents, file) => {
				if (quasArgs.minifyScripts && (preJs || postJs)) {
					contents = injectFilesIntoStream(quasArgs, preJs, contents, quasArgs.jsInjectLocations.length ? quasArgs.jsInjectLocations[0] : quasArgs.jsInjectLocations, 'script');
					contents = injectFilesIntoStream(quasArgs, postJs, contents, quasArgs.jsInjectLocations.length > 1 ? quasArgs.jsInjectLocations[1] : quasArgs.jsInjectLocations[0], 'script', false);
					debug(`scripts did minify`);
				}

				return contents;
			}))
			.pipe(inject.append(`\n<!-- Generated by quasar on: ${Date()} by: ${os.hostname} [ https://github.com/KenEucker/quasar ] -->`))
			.pipe(gulp.dest(quasArgs.applicationRoot))
			.on('error', (err) => {
				logError(err);
				logArgsToFile(quasArgs, null, true);
				return reject(err);
			})
			.on('end', (msg) => {
				logSuccess('injection pipeline ended successfully');
				return resolve(quasArgs);
			});
	})
}

// Upload resources to S3
const uploadFiles = (quasArgs, excludeFiles = []) => {
	return new promise((resolve, reject) => {
		if (!quasArgs.uploadToS3) {
			return resolve();
		}

		const configFilename = `${quasArgs.applicationRoot}/.config`;
		if (fs.existsSync(configFilename)) {
			const fromLocalDirectory = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}/`;
			const toS3BucketPath = `${quasArgs.bucket}/${quasArgs.bucketPath}`;
			logInfo(`Uploading files from ${fromLocalDirectory} to the path: ${toS3BucketPath}`);

			const configFile = fs.readFileSync(configFilename);
			const s3Config = JSON.parse(configFile);
			const s3 = gulpS3(s3Config);

			if (quasArgs.excludeOutputFileFromUpload) {
				excludeFiles.push(`${quasArgs.output}${quasArgs.outputExt}`);
			}
			excludeFiles = excludeFiles.map(excludeFile => `!${fromLocalDirectory}${excludeFile}`);
			return gulp.src(excludeFiles.concat(`${fromLocalDirectory}**`))
				.pipe(s3({
					Bucket: toS3BucketPath,
					ACL: 'public-read'
				}, {
						maxRetries: 5
					}))
				.on('end', () => { logSuccess(`Files successfully uploaded to S3 under the path: /${toS3BucketPath}`); return resolve(); });
		} else {
			logError(`Could not find AWS configuration, aborting upload.`);
			return resolve(quasArgs);
		}
	})
}

const outputToJsonFile = (quasArgs) => {
	return new promise((resolve, reject) => {
		quasArgs = logBuildQueued(quasArgs);
	})
}

const outputToTextFile = (quasArgs = {}) => {
	return new promise((resolve, reject) => {
		const versionPrefix = `_v`;
		const outputPath = getQuasarOutputPath(quasArgs);
		let outputFile = `${outputPath}/${quasArgs.outputVersion == 1 ? quasArgs.output : `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`}${quasArgs.outputExt}`;
		quasArgs = logBuildQueued(quasArgs);

		if (fs.existsSync(outputFile) && quasArgs.versionOutputFile) {
			while (fs.existsSync(outputFile)) {
				quasArgs.outputVersion += 1;
				outputFile = `${outputPath}/${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}${quasArgs.outputExt}`;
			}
			quasArgs.output = `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`;
			logInfo(`existing version detected, version number (${quasArgs.outputVersion}) appended to outputFile`);
		}

		return gulp.src(quasArgs.targetFilePath)
			.pipe(template(quasArgs))
			.pipe(rename({
				basename: quasArgs.output,
				extname: quasArgs.outputExt
			}))
			.pipe(gulp.dest(outputPath))
			.on('error', (err) => {
				logError(err);
				quasArgs.error = err;
				logArgsToFile(quasArgs, null, true);
				return reject();
			})
			.on('end', () => {
				logSuccess(`Output file saved as: ${outputFile}`);
				quasArgs.buildCompletedSuccessfully = true;
				logArgsToFile(quasArgs, STATUS_COMPLETED);

				if (quasArgs.useJobTimestampForBuild) {
					logInfo(`cleaning up after job: ${quasArgs.jobTimestamp}`);
					debug(`did clean up assets folder: ${quasArgs.assetsFolder}`);
					del.sync(quasArgs.assetsFolder, { force: true });
				}

				return resolve(quasArgs);
			});
	})
}

// Compile the quasar into the output folder
const outputToHtmlFile = (quasArgs) => {
	return new promise((resolve, reject) => {
		const versionPrefix = `_v`;
		const outputPath = getQuasarOutputPath(quasArgs);
		let outputFile = `${outputPath}/${quasArgs.outputVersion == 1 ? quasArgs.output : `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`}${quasArgs.outputExt}`;
		log(`Applying the following parameters to the template (${quasArgs.targetFilePath}) and building output`);
		quasArgs = logBuildQueued(quasArgs);

		if (fs.existsSync(outputFile) && quasArgs.versionOutputFile) {
			while (fs.existsSync(outputFile)) {
				quasArgs.outputVersion += 1;
				outputFile = `${outputPath}/${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}${quasArgs.outputExt}`;
			}
			quasArgs.output = `${quasArgs.output}${versionPrefix}${quasArgs.outputVersion}`;
			logInfo(`existing version detected, version number (${quasArgs.outputVersion}) appended to outputFile`);
		}

		return gulp.src(quasArgs.targetFilePath)
			.pipe(template(quasArgs))
			.pipe(rename({
				// dirname: outputPath,
				basename: quasArgs.output,
				extname: quasArgs.outputExt
			}))
			.pipe(insert.transform((contents, file) => {
				if (quasArgs.minifyHtml) {
					const minifiedHtml = htmlMin.minify(contents);

					if (minifiedHtml) {
						contents = minifiedHtml;
						debug(`did minify html`);
					} else {
						logError(`error minifying html: ${minifiedHtml}`);
					}
				}

				return contents;
			}))
			.pipe(gulp.dest(outputPath))
			.on('error', (err) => {
				logError(err);
				quasArgs.error = err;
				logArgsToFile(quasArgs, null, true);
				return reject();
			})
			.on('end', () => {
				if (quasArgs.cleanUpTargetFileTemplate && (quasArgs.targetFilePath.indexOf(`${quasArgs.output}${quasArgs.outputExt}`) == -1)) {
					logInfo(`Removing templated file ${quasArgs.targetFilePath}`);
					fs.unlinkSync(quasArgs.targetFilePath);
				}
				logSuccess(`Output file saved as: ${outputFile}`);
				quasArgs.buildCompletedSuccessfully = true;
				logArgsToFile(quasArgs, STATUS_COMPLETED);

				if (quasArgs.useJobTimestampForBuild) {
					logInfo(`cleaning up after job: ${quasArgs.jobTimestamp}`);
					debug(`did clean up assets folder: ${quasArgs.assetsFolder}`);
					del.sync(quasArgs.assetsFolder, { force: true });
				}

				return resolve(quasArgs);
			});
	})
}

const init = (appRoot = process.cwd(), outRoot = `${os.homedir()}/Documents/quasar/`) => {
	if (tryRequire.resolve(`${appRoot}/config.js`)) {
		_config = require(`${appRoot}/config.js`);
		_config.init(appRoot, outRoot);
	}
}
// throw 'required LIB';

// init();

module.exports = {
	cleanDevFolders,
	cleanOutputFolders,
	convertPromptToJsonSchemaFormProperty,
	convertPromptToJsonSchemaUIFormProperty,
	compileStylesToAssetsFolder,
	compileScriptsToAssetsFolder,
	compileTargetFileToAssetsFolder,
	copyFilesFromAssetsFolderToOutput,
	copyFilesFromSourcesFolderToOutput,
	copyFilesFromTemplatesFolderToOutput,
	copyFilesToOutputFolder,
	copyTemplateFilesToAssetsPath,
	definitelyCallFunction,
	findOutputDirectory,
	findTargetFile,
	fromDir,
	getActualArgObjects,
	getConfig,
	getQuasArgs,
	getFilenamesInDirectory,
	getTaskNames,
	getQuasarPromptQuestions,
	getQuasarOutputPath,
	hasQuasarInitialArgs,
	init,
	injectCode,
	loadTasks,
	logArgsToFile,
	logAsync,
	log,
	debug,
	logInfo,
	logError,
	logEnd,
	logSuccess,
	makePromptRequired,
	moveTargetFilesToRootOfAssetsPath,
	outputToHtmlFile,
	outputToTextFile,
	promptConsole,
	promptUser,
	quasarSelectPrompt,
	logBuildQueued,
	registerRequiredQuasArgs,
	registerTask,
	runLastSuccessfulBuild,
	runTask,
	setSourceAndOutputArgs,
	spawnCommand,
	unpackFiles,
	uploadFiles,
	// Externally controlled values
	logToFile,
	// CONSTANTS
	STATUS_CREATED,
	STATUS_QUEUED,
	STATUS_COMPLETED,
	STATUS_FAILED
}
