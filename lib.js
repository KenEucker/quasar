let gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	inject = require('gulp-inject-string'),
	insert = require('gulp-insert'),
	prompt = require('inquirer'),
	sass = require('dart-sass')
	concat = require('gulp-concat'),
	flatmap = require('gulp-flatmap'),
	babel = require('gulp-babel'),
	spawn = require("child_process"),
	gulpS3 = require('gulp-s3-upload'),
	runSequence = require('run-sequence'),
	aws = require('aws-sdk'),
	through = require('through2'),
	mustache = require('gulp-mustache'),
	browserify = require('gulp-browserify'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	unzip = require("extract-zip"),
	path = require('path'),
	mv = require('mv')
	colors = require('colors'),
	os = require('os'),
	promise = require('bluebird'),
	fs = require('fs'),
	yargs = require('yargs'),
	mkdir = require('mkdirp-sync');

// Exported values
const config = require(`${process.cwd()}/config.js`);

// Logger
let logToFile = yargs.argv.logToFile, logDate = yargs.argv.logDate, logSeverity = yargs.argv.logSeverity;
const logAsync = (message, obj, status = null, title = '', color = colors.grey) => { return new promise((resolve, reject) => { log(message, obj, status, color); return resolve(); }) }
const logData = (message, obj, color = colors.yellow) => { log(message, obj, 'info', 'data', color) }
const logInfo = (message, obj, color = colors.yellow) => { log(message, obj, 'info', 'info', color) }
const logError = (message, obj, color = colors.red) => { log(message, obj, 'error', 'error', color) }
const logSuccess = (message, obj, color = colors.green) => { log(message, obj, 'error', 'success', color) }
const logFin = (message = 'FiN!', obj, color = colors.green) => { log(message, obj, 'fin', 'end', color) }
const log = (message, obj, status = null, title = '', color = colors.grey) => {
	let logger = console;
	let logPrefix = `<~-`, logPostfix = `${logPrefix[1]}${logPrefix.replace('<','>')[0]}`;
	message = `${logDate ? `[${new Date(Date.now()).toLocaleString('en-US')}]` : ``}${title.length ? ` ${title}:` : ''} ${message}`;
	message = `${logPrefix}${message}${logPostfix}`;
	logSeverity = Array.isArray(logSeverity) ? logSeverity[logSeverity.length - 1] : logSeverity;

	switch(status) {
		case null:
			logger = logger.log;
		break;

		case 'error':
			if(logToFile) {
				
			} else {
				logger = logger.error;
			}
		break;
		
		case 'log':
			if(logToFile) {
				
			} else {
				logger = logger.log;
			}
		break;

		case '':
		case 'info':
		default:
			if(logToFile) {
				
			} else {
				logger = logger.info;
			}
		break;
	}

	switch(logSeverity) {
		case 'ALL':
		case 'DEBUG':
			if(obj) {
				logger(color(message), obj);
			} else {
				logger(color(message));
			}
		break;
		
		// Logging turned off
		case 'NONE':
		case '':
		break;

		default:
		case 'NODATA':
			logger(color(message));
		break;
	}

	return;
}

const getQuasArgs = (qType = null, requiredArgs = [], nonRequiredArgs = {}, addDefaultRequiredArgs = true) => {
	let fromFile = {};

	// If the argsFile parameter is set and the file exists, load parameters from file
	if(yargs.argv.argsFile && fs.existsSync(yargs.argv.argsFile)) {
		fromFile = JSON.parse(fs.readFileSync(yargs.argv.argsFile));
	}

	const quasArgs = Object.assign(
				// Defaults
				{ 
					dirname: config.dirname,
					outputFolder: config.outputFolder,
					sourceFolder: config.sourceFolder,
					assetsFolder: qType ? `${config.assetsFolder}/${qType}` : undefined,
					templatesFolder: qType ? `${config.templatesFolder}/${qType}` : undefined,
					targetFilePath: qType ? `${config.assetsFolder}/${qType}/${qType}.html` : undefined,
					stylesAsset: qType ? `${config.assetsFolder}/${qType}/${qType}.css` : undefined,
					scriptsAsset: qType ? `${config.assetsFolder}/${qType}/${qType}.js` : undefined,
					target: qType ? `${qType}.html` : undefined,
					bucket: '%AWS%',
					outputExt: '.txt',
					cdnUrlStart: 'https://cdn.com/',
					clickUrl: '!! PASTE CLICK URL HERE !!',
					uploadToS3: false,
					unpackFiles: true,
					cssInjectLocation: '</head>',
					jsInjectLocation: '</body>',
					overwriteUnpackDestination: true,
					cleanUpTargetFileTemplate: false,
					buildCompletedSuccessfully: false,
					logToFile: '.log',
					qType },
				// CLI args
				yargs.argv, 
				// Loaded from file with arg --argsFile
				fromFile);

		return registerRequiredQuasArgs(quasArgs, requiredArgs, nonRequiredArgs, addDefaultRequiredArgs);
}

const definitelyCallFunction = (cb) => {
	if(process.title == 'gulp') {
		gulp.task('default', () => {
			cb();
		});
	} else {
		cb();
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
			console.error("Sass Error: " + err.message);
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

const spawnQuasarTask = (argsFile, args = []) => {
	const command = `node`;
	args.unshift(`cli.js`);

	log(`Running command ${command} ${args.join(' ')}`);
	spawn.spawn(command, args)
		.on("error", (error) => { console.log(`ERROR:`, error); })
		.on("data", (data) => { console.log("DATA: ", data); })
		.on("end", (msg) => { console.log("Ended: ", msg); });
}

const getTaskNames = (dir) => {
	return getFilenamesInDirectory(dir, ['js'], true);
}

const getFilenamesInDirectory = (directory, extensions = [], removeExtension = false) => {
	let filenames = [];

	if(fs.existsSync(directory))
	{
		filenames = fs.readdirSync(directory)
			.filter((file) => {
				const notADirectory = !fs.statSync(path.join(directory, file)).isDirectory();
				if(notADirectory && extensions.length) {
					let ext = path.extname(file);
					ext = ext ? ext.split('.').pop() : ext;

					if(extensions.includes(ext)) {
						return true;
					} else {
						return false;
					}
				}

				return notADirectory;
		});

		if (removeExtension) {
			return filenames.map( filename => filename.replace(path.extname(filename), '') );
		}
	}

	return filenames;
}

const fromDir = (startPath, filter, extension = '') => {
	let found = '';

	if(!extension.length) {
		extension = `.${filter.split('.').pop()}`;
		filter = filter.replace(extension, '');
	}

	if (!fs.existsSync(startPath)){
		return;
	}

	var files=fs.readdirSync(startPath);
	for(var i=0;i<files.length;i++){
		var filename=path.join(startPath,files[i]);
		var stat = fs.lstatSync(filename);
		if (stat.isDirectory()){
			found = fromDir(filename,filter,extension); //recurse
		} else if (!filter.length && `.${filename.split('.').pop()}` == extension) {
			return filename;
		} else if (filename.indexOf(filter)>=0) {
			return filename;
		};
	};

	return found;
}

const runTask = (task, end = () => {}) => {
	if(gulp.hasTask(task)) {
		runSequence(task, end);
	} else {
		logError(`Cannot find gulp task ${task}`);
	}
}

const quasarSelectPrompt = (quasArgs) => {
	return new promise((resolve, reject) => {
		const tasksPath = path.resolve('./tasks/');
		let availableTasks = getTaskNames(tasksPath);

		return prompt.prompt([{
			type: 'list',
			name: 'task',
			message: `Select the type of quasar you want to launch:\n`,
			choices: availableTasks
		}]).then(res => {
			if(gulp.hasTask(res.task)) {
				gulp.start(res.task);
				return resolve();
			}
		});
	})
}

const initialPrompt = (quasArgs) => { return promptConsole(quasArgs.requiredArgs, quasArgs.requiredArgsValidation) }
const promptConsole = (questions, getResults) => { return prompt.prompt(questions).then(getResults) }

// This one has to be typehinted as a function for the async method
const makePromptRequired = function(input) {
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

	const getQuasarPromptQuestions = (quasArgs) => {
	return [{
		type: 'input',
		name: 'domain',
		message: 'Enter the name of the domain to be used in building assets:\n',
		required: true,
		validate: makePromptRequired
	},{
		type: 'input',
		name: 'signal',
		message: 'Enter the name of the signal to be used when compiling quasars:\n',
		required: true,
		validate: makePromptRequired
	}];
}

const convertPromptToJsonSchemaFormProperty = (prompt) => {
	let title = prompt.message,
		type = prompt.type;

	switch(type) {
		case 'input':
			type = 'string';
		break;
		case 'list':
			if(prompt.name == 'source') {
				type = 'string'
				_default = prompt.choices
			}
		break;
		default:
		break;
	}

	return {
		type,
		title
	};
}

const convertPromptToJsonSchemaUIFormProperty = (prompt) => {
	let title = prompt.message || '',
		widget = prompt.type || 'input',
		help = prompt.help || '';
		options = {},
		ui = {};

	switch(widget) {
		case 'input':
			widget = 'text';
		break;

		case 'list':
			if(prompt.name == 'source') {
				widget = 'file';
			} else {
				widget = 'checkboxes';
			}
		break;
	}

	return {
		'ui:widget': widget,
		'ui:options': options,
		help
	};
}

// This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter
// https://www.npmjs.com/package/inquirer#questions
const registerRequiredQuasArgs = (quasArgs, requiredArgs = [], nonRequiredArgs = {}, addDefaultRequiredArgs = true) => {
	quasArgs = Object.assign(quasArgs, nonRequiredArgs);

	if(!quasArgs.requiredArgs) {
		quasArgs.requiredArgs = addDefaultRequiredArgs ? getQuasarPromptQuestions(quasArgs).concat(requiredArgs) : requiredArgs;
	} else {
		// TODO: update two arrays of objects
	}
	quasArgs.requiredArgs.forEach((arg) => {
		quasArgs[arg.name] = quasArgs[arg.name] || quasArgs.default || '';
	});

	return quasArgs;
}

const hasQuasarInitialArgs = (quasArgs) => {
	return quasArgs.domain && quasArgs.signal;
}

const findTargetFile = (quasArgs) => {
	let targetFilePath = quasArgs.targetFilePath;

	if (!fs.existsSync(targetFilePath)) {
		const oldTargetFilePath = targetFilePath;
		targetFilePath = fromDir(`${quasArgs.templatesFolder}`, `${quasArgs.target}`, `.html`);
		
		if(!targetFilePath) {
			const oldestTargetFilePath = targetFilePath;
			targetFilePath = fromDir(`${quasArgs.assetsFolder}`, `${quasArgs.target}`, `.html`);

			if(targetFilePath) {
				log(`did not find targetFile at ${oldTargetFilePath} or at ${oldestTargetFilePath} but found one at -> ${targetFilePath}`);
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
		
		if(!targetFilePath) {
			logInfo(`did not find a templated target file, using first available file that matches the target (${quasArgs.target}) in the assets path: ${quasArgs.assetsFolder}`);
			targetFilePath = fromDir(quasArgs.assetsFolder, quasArgs.target);
			log(`new targetFile: ${targetFilePath}`);
		}

		// Error
		if(!targetFilePath) {
			return resolve(quasArgs);
		}

		if(targetFilePath !== `${quasArgs.assetsFolder}/${quasArgs.target}`) {
			const baseDir = path.dirname(targetFilePath);
			// logInfo(`Moving files from deep folder structure (${baseDir}) to base assets path (${quasArgs.assetsFolder})`);
			gulp.src(`${baseDir}/**`)
				.pipe(gulp.dest(quasArgs.assetsFolder))
				.on('error', (err) => { 
					logError(`error copying files: ${err}`);
					return reject(quasArgs); })
				.on('end', () => { 
					logInfo(`files moved from deep folder structure (${baseDir}) to base assets path (${quasArgs.assetsFolder})`);
					quasArgs.targetFilePath = targetFilePath;
					let remove = baseDir.replace(quasArgs.assetsFolder, '').substr(1).split('/');
					remove = path.resolve(`${quasArgs.assetsFolder}/${remove[0]}`);
					del(path.resolve(remove));

					return resolve(quasArgs);
			});
		}

		return resolve(quasArgs);
	});
}

const copyFilesFromTemplatesFolderToOutput = (quasArgs, files) => {
	return new promise((resolve, reject) => {
		const destinationPath = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`;
		logInfo(`copying files (${files.join()}) from ${quasArgs.templatesFolder}/ to ${destinationPath}`);

		files = files.map(file => `${quasArgs.templatesFolder}/${file}`);
		gulp.src(files, { base: quasArgs.templatesFolder })
			.pipe(gulp.dest(destinationPath))
			.on('end', () => { 
				return resolve(quasArgs);
			});
	});
}

const copyFilesFromAssetsFolderToOutput = (quasArgs, files, excludeFiles = null) => {
	return new promise((resolve, reject) => {
		const destinationPath = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`;
		if(!excludeFiles) {
			excludeFiles = [ `${quasArgs.qType}.html`, `${quasArgs.qType}.css`, `${quasArgs.qType}.js` ];
		}
		logInfo(`copying files (${files.join()}) from ${quasArgs.assetsFolder}/ to ${destinationPath}`);

		files = files.map(file => `${quasArgs.assetsFolder}/${file}`);
		excludeFiles = excludeFiles.map(excludeFile => `!${quasArgs.assetsFolder}/${excludeFile}`);
		return gulp.src(excludeFiles.concat(files), { base: quasArgs.assetsFolder })
			.pipe(gulp.dest(destinationPath))
			.on('end', () => { 
				return resolve(quasArgs);
			});
	});
}

const copyTemplateFilesToAssetsPath = (quasArgs) => {
	//return new promise((resolve, reject) => {
		const targetFilePath = fs.existsSync(quasArgs.targetFilePath) ? quasArgs.targetFilePath : findTargetFile(quasArgs);
		const cssAssetPath = path.resolve(`${quasArgs.templatesFolder}/${quasArgs.qType}.css`);
		const jsAssetPath = path.resolve(`${quasArgs.templatesFolder}/${quasArgs.qType}.js`);

		mkdir(quasArgs.assetsFolder);
		if(fs.existsSync(targetFilePath)) {
			const outfile1 = fs.readFileSync(targetFilePath, 'utf-8');
			const outputTargetFilePath = `${quasArgs.assetsFolder}/${quasArgs.target}`;

			if(!outfile1) {
				quasArgs.targetFilePath = targetFilePath;
			}

			log(`copying target file to assets path: ${outputTargetFilePath}`);
			fs.writeFileSync(outputTargetFilePath, outfile1);
			quasArgs.targetFilePath = outputTargetFilePath;
		}
		if(fs.existsSync(cssAssetPath)) {
			const outfile2 = fs.readFileSync(cssAssetPath, 'utf-8');
			const outputCssAssetPath = `${quasArgs.assetsFolder}/${quasArgs.qType}.css`;

			if(!outfile2) {
				quasArgs.stylesAsset = cssAssetPath;
			}

			log(`copying css asset file to assets path: ${outputCssAssetPath}`);
			fs.writeFileSync(outputCssAssetPath, outfile2);
			quasArgs.stylesAsset = outputCssAssetPath;
		}
		if(fs.existsSync(jsAssetPath)) {
			const outfile3 = fs.readFileSync(jsAssetPath, 'utf-8');
			const outputJsAssetPath = `${quasArgs.assetsFolder}/${quasArgs.qType}.js`;

			if(!outfile3) {
				quasArgs.scriptsAsset = jsAssetPath;
			}

			log(`copying js asset file to assets path: ${outputJsAssetPath}`);
			fs.writeFileSync(outputJsAssetPath, outfile3);
			quasArgs.scriptsAsset = outputJsAssetPath;
		}
		return quasArgs;
	//	return resolve(quasArgs);
	//})
}

	// Unpack input files
const unpackFiles = (quasArgs) => {
	return new promise((resolve, reject) => {
		if(!quasArgs.unpackFiles || !quasArgs.source) {
			return resolve(quasArgs);
		}

		const zipFilePath = path.resolve(`${quasArgs.sourceFolder}/${quasArgs.source}${quasArgs.sourceExt}`);
		const destinationPath = path.resolve(`${quasArgs.assetsFolder}`);
		log(`unpacking source files from (${zipFilePath}) to the public folder (${destinationPath})`);

		if (!fs.existsSync(zipFilePath)) {
			logError(`source could not be found`, zipFilePath);
			return reject();
		}

		const destinationPathExists = fs.existsSync(path.resolve(`${destinationPath}/${quasArgs.target}`));
		if(!quasArgs.overwriteUnpackDestination && destinationPathExists) {
			logError(`files have already been unpacked, run again with option --overwriteUnpackDestination=true to overwite files.`);
			return resolve(quasArgs);
		} else {
			logInfo(`${destinationPathExists ? `overwriting files in assets folder ${destinationPath}`: `leaving files in unpack destination (${destinationPath}) unmodified`}`);

			if(destinationPathExists) {
				del(destinationPath);
				mkdir(destinationPath);
			}
		}

		unzip(zipFilePath, {dir: destinationPath}, (err) => {
			// extraction is complete. make sure to handle the err
			if(err) {
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

const compileScriptsToAssetsFolder= (quasArgs) => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.jsx`)
		// Bundle source files
		.pipe(concat(`${quasArgs.qType}.js`, { newLine: `;\n` }))
		// Make it useful
		.pipe(babel({ presets: ['env', 'react'] }))
		// Make it compatible
		.pipe(browserify())
		// Ouput single file in asset folder for use with build task
		.pipe(gulp.dest(`${quasArgs.assetsFolder}`))
		.on('error', (err) => { logError(err) })
		.on('end', () => { logInfo(`Scripts compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.js`); })
}

const compileTargetFileToAssetsFolder = (quasArgs) => {
	return gulp.src(`${quasArgs.templatesFolder}/**/*.mustache`)
		// Compile mustache file
		.pipe(flatmap( (stream, file) => {
			const filename = `${file.path}.json`;
			if(fs.existsSync(filename)) {
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

// Inject the code into the html file before applying template vars
const injectCode = (quasArgs) => {
	return new promise((resolve, reject) => {
		const urlToPrependCDNLink = quasArgs.target ? quasArgs.target.replace('.html','') : quasArgs.targetFilePath.split('/').pop().replace('.html','');
		const cdnTemplate = `<%= cdnUrlStart %><%= bucketPath %>/`;
		const css = fs.existsSync(quasArgs.stylesAsset) ? quasArgs.stylesAsset : false;
		const js = fs.existsSync(quasArgs.scriptsAsset) ? quasArgs.scriptsAsset : false;

		log('injecting public code prior to applying template parameters');
		log(`getting assets from (${quasArgs.assetsFolder})`);
		log(`getting template file (${quasArgs.targetFilePath.replace(quasArgs.assetsFolder, '')}) and assets(css:${css ? quasArgs.stylesAsset.replace(quasArgs.assetsFolder, '') : 'none'}   js: ${js ? quasArgs.scriptsAsset.replace(quasArgs.assetsFolder, '')  : 'none'})`);

		return gulp.src(quasArgs.targetFilePath, { base: quasArgs.dirname })
			.pipe(inject.before(`${urlToPrependCDNLink}.`, cdnTemplate))
			// Add the default css injectionLocationString to the beginning of the document if the injectionLocationString was not found
			.pipe(insert.transform((contents, file) => {
				if (css) {
					let cssContents = fs.readFileSync(css, 'utf8');
					const injectionLocation = contents.search(quasArgs.cssInjectLocation);
					cssContents = cssContents.length ? `<style>\n${cssContents}\n</style>\n` : ``;

					if (injectionLocation == -1) {
						logInfo(`css injection location not found: '${quasArgs.cssInjectLocation}', using default location of prepending to document`);
						return `${cssContents}\n<!-- End Of Automatic Css Injection -->\n${contents}`;
					} else if (cssContents) {
						return `${contents.substring(0, injectionLocation)}${cssContents}${contents.substring(injectionLocation)}`;
					}
				}

				return contents;
			}))
			// Add the default js injectionLocationString to the beginning of the document if the injectionLocationString was not found
			.pipe(insert.transform((contents, file) => {
				if (js) {
					let jsContents = fs.readFileSync(js, 'utf8');
					jsContents = jsContents.length ? `<script>\n${jsContents}\n</script>\n` : ``;
					const injectionLocation = contents.search(quasArgs.jsInjectLocation);

					if (injectionLocation == -1) {
						logInfo(`js injection location not found: '${quasArgs.jsInjectLocation}', using default location of prepending to document`);
						return `${contents}\n${jsContents}\n<!-- End Of Automatic Js Injection -->\n`;
					} else if (jsContents) {
						return `${contents.substring(0, injectionLocation)}${jsContents}${contents.substring(injectionLocation)}`;
					}
				}

				return contents;
			}))
			//.pipe(inject.before(quasArgs.jsInjectLocation, js))
			.pipe(inject.append(`\n<!-- Generated by quasar on: ${Date()} by: ${os.hostname} [ https://github.com/KenEucker/quasar ] -->`))
			.pipe(gulp.dest(quasArgs.dirname))
			.on('error', (err) => { 
				logError('error on injection pipeline ', err); 
				return reject(err);
			})
			.on('end', (msg) => { 
				logSuccess('injection pipeline ended successfully');
				return resolve(quasArgs); 
			});
	})
}

const uploadFileToS3 = (Bucket, Key, Body, callback, ACL = 'public-read') => {
	aws.config.loadFromPath('./.config');
	let s3 = new aws.S3();
	logInfo('Uploading files to S3');

	const params = {
		Key: `${Key}`,
		Bucket,
		ACL,
		Body
	};
	s3.putObject(params, (err, data) => {
		if (err) {
			logError("Error uploading image: ", err);
		} else {
			logInfo("Successfully uploaded image on S3", data);
			if(callback) { callback(data); }
		}
	});
}

// Upload resources to S3
const uploadFiles = (quasArgs) => {
	return new promise((resolve, reject) => {
		if(!quasArgs.uploadToS3) {
			return resolve();
		}

		const configFilename = `${quasArgs.dirname}/.config`;
		if(fs.existsSync(configFilename)) {
			logInfo(`Uploading files form ${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}/ to the path: %AWS%/${quasArgs.bucketPath}`);

			var config = JSON.parse(fs.readFileSync(configFilename));
			let s3 = gulpS3(config);

			gulp.src(`${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}/**`)
				.pipe(s3({
					Bucket: `${quasArgs.bucketPath}`,
					ACL: 'public-read'
				}, {
					maxRetries: 5
				}))
				.on('end', () => { logSuccess(`Files successfully uploaded to S3 under the path: /${quasArgs.bucketPath}`); return resolve(); });
		} else {
			logError(`Could not find AWS configuration, aborting upload.`);
			return resolve(quasArgs);
		}
	})
}

// Compile the quasar into the output folder
const outputToHtmlFile = (quasArgs) => {
	return new promise((resolve, reject) => {
		const outputPath = `${quasArgs.outputFolder.replace(quasArgs.dirname, '')}/${quasArgs.domain}/${quasArgs.signal}`;
		log(`Applying the following parameters to the template (${quasArgs.targetFilePath}) and building output`);
		log(`data:`, quasArgs);

		return gulp.src(quasArgs.targetFilePath) 
		.pipe(template(quasArgs))
		.pipe(rename({
			dirname: outputPath,
			basename: quasArgs.output,
			extname: `${quasArgs.outputExt}`
		}))
		.pipe(gulp.dest(quasArgs.dirname))
		.on('error', (err) => { logError(`Error outputing file (${quasArgs.targetFilePath})`, err); })
		.on('end', () => { 
			if(quasArgs.cleanUpTargetFileTemplate && (quasArgs.targetFilePath.indexOf(`${quasArgs.output}${quasArgs.outputExt}`) == -1)) {
				logInfo(`Removing templated file ${quasArgs.targetFilePath}`);
				fs.unlink(quasArgs.targetFilePath);
			}
			logSuccess(`Output file saved as: ${quasArgs.dirname}${outputPath}/${quasArgs.output}${quasArgs.outputExt}`);
			quasArgs.buildCompletedSuccessfully = true;
			return resolve(quasArgs);
		});
	})
}

module.exports = {
	convertPromptToJsonSchemaFormProperty,
	convertPromptToJsonSchemaUIFormProperty,
	compileStylesToAssetsFolder,
	compileScriptsToAssetsFolder,
	compileTargetFileToAssetsFolder,
	copyFilesFromAssetsFolderToOutput,
	copyFilesFromTemplatesFolderToOutput,
	copyTemplateFilesToAssetsPath,
	definitelyCallFunction,
	findTargetFile,
	fromDir,
	getQuasArgs,
	getFilenamesInDirectory,
	getTaskNames,
	getQuasarPromptQuestions,
	hasQuasarInitialArgs,
	initialPrompt,
	injectCode,
	logAsync,
	log,
	logInfo,
	logError,
	logFin,
	logSuccess,
	makePromptRequired,
	moveTargetFilesToRootOfAssetsPath,
	outputToHtmlFile,
	promptConsole,
	quasarSelectPrompt,
	registerRequiredQuasArgs,
	runTask,
	spawnQuasarTask,
	unpackFiles,
	uploadFiles,
	// Externally controlled values
	logToFile,
	config }