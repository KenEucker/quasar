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
	unzip = require("extract-zip"),
	path = require('path'),
	colors = require('colors'),
	os = require('os'),
	promise = require('bluebird'),
	fs = require('fs'),
	yargs = require('yargs'),
	mkdir = require('mkdirp-sync');

// Exported values
let logToFile = false;

const config = require(`${process.cwd()}/config.js`);

const getDefaultQuasArgs = (qType = null) => { 
	return Object.assign({ 
			dirname: config.dirname,
			outputFolder: config.outputFolder,
			sourceFolder: config.sourceFolder,
			assetsFolder: qType ? `${config.assetsFolder}/${qType}` : undefined,
			templatesFolder: qType ? `${config.templatesFolder}/${qType}` : undefined,
			targetFilePath: qType ? `${config.templatesFolder}/${qType}/${qType}.html` : undefined,
			stylesAsset: qType ? `${config.assetsFolder}/${qType}/${qType}.css` : undefined,
			scriptsAsset: qType ? `${config.assetsFolder}/${qType}/${qType}.js` : undefined,
			target: qType ? `${qType}.html` : undefined,
			bucket: '%AWS%',
			outputExt: 'txt',
			cdnUrlStart: 'https://cdn.com/',
			clickUrl: '!! PASTE CLICK URL HERE !!',
			uploadToS3: false,
			unpackFiles: true,
			cssInjectLocation: '</head>',
			jsInjectLocation: '</body>',
			overwriteUnpackDestination: false,
			cleanUpTargetFileTemplate: false,
			buildCompletedSuccessfully: false,
			logToFile: '.log',
			qType},
		yargs.argv);
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
	});
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

const logAsync = (message, obj, status = '', color = colors.grey) => {
	return new promise((resolve, reject) => { log(message, obj, status, color); return resolve(); });
}

const log = (message, obj, status = '', color = colors.grey) => {
	let logger = console;

	switch(status) {
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

	if(obj) {
		logger(color(message), obj);
	} else {
		logger(color(message));
	}

	return;
}

const logData = (message, obj, color = colors.yellow) => {
	log(`<!-- data: ${message} -->`, obj, 'info', color);
}

const logInfo = (message, obj, color = colors.yellow) => {
	log(`<!-- info: ${message} -->`, obj, 'info', color);
}

const logError = (message, obj, color = colors.red) => {
	log(`<!-- error: ${message} -->`, obj, 'error', color);
}

const logSuccess = (message, obj, color = colors.green) => {
	log(`<!-- success: ${message} -->`, obj, 'error', color);
}

const logFin = (message = 'FiN!', obj, color = colors.green) => {
	log(`<!-- end: ${message} -->`, obj, 'fin', color);
}

const fromDir = (startPath, filter) => {
	let found = '';

	if (!fs.existsSync(startPath)){
		return;
	}

	var files=fs.readdirSync(startPath);
	for(var i=0;i<files.length;i++){
		var filename=path.join(startPath,files[i]);
		var stat = fs.lstatSync(filename);
		if (stat.isDirectory()){
			found = fromDir(filename,filter); //recurse
		}
		else if (filename.indexOf(filter)>=0) {
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
	});
}

const initialPrompt = (quasArgs) => {
	return promptConsole(quasArgs.requiredArgs, quasArgs.requiredArgsValidation);
}

const promptConsole = (questions, getResults) => {
	return prompt.prompt(questions).then(getResults);
}

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
		help
	};
}

// This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter
// https://www.npmjs.com/package/inquirer#questions
const registerRequiredQuasArgs = (quasArgs, requiredArgs = [], nonRequiredArgs = {}, addDefaults = true) => {
	quasArgs = Object.assign(quasArgs, nonRequiredArgs);

	if(!quasArgs.requiredArgs) {
		quasArgs.requiredArgs = addDefaults? getQuasarPromptQuestions(quasArgs).concat(requiredArgs) : requiredArgs;
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
	const signalPath = path.resolve(`${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`);
	let targetFilePath = quasArgs.targetFilePath || path.resolve(`${signalPath}/${quasArgs.target}`);

	if (!fs.existsSync(targetFilePath)) {
		const oldTargetFilePath = targetFilePath;
		targetFilePath = fromDir(`${quasArgs.assetsFolder}`, `${quasArgs.target}`);
		
		if(targetFilePath) {
			log(`couldnt find file at ${oldTargetFilePath}, corrected path is: ${targetFilePath}`, colors.yellow);
			targetFilePath = path.resolve(targetFilePath);
		}
	}

	return targetFilePath;
}

const moveTargetFilesToRootOfAssetsPath = (quasArgs) => {
	const targetFilePath = findTargetFile(quasArgs);

	if(targetFilePath !== `${quasArgs.assetsFolder}/${target}`) {
		logInfo(`Moving files from deep folder structure to base assets path (${signalPath})`);
		const baseDir = path.basename(targetFilePath);
		mv(`${baseDir}`, `${quasArgs.assetsFolder}`, {mkdirp: true}, (err) => {
			logError(`Error moving files from ${baseDir} to ${quasArgs.assetsFolder}`);
		});
	}
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

const copyFilesFromAssetsFolderToOutput = (quasArgs, files) => {
	return new promise((resolve, reject) => {
		const destinationPath = `${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`;
		logInfo(`copying files (${files.join()}) from ${quasArgs.assetsFolder}/ to ${destinationPath}`);

		files = files.map(file => `${quasArgs.assetsFolder}/${file}`);
		return gulp.src(files, { base: quasArgs.assetsFolder })
			.pipe(gulp.dest(destinationPath))
			.on('end', () => { 
				return resolve(quasArgs);
			});
	});
}

const copyTemplateFilesToAssetsPath = (quasArgs) => {
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
}

// Unpack input files
const unpackFiles = (quasArgs) => {
	return new promise((resolve, reject) => {
		if(!quasArgs.unpackFiles) {
			resolve();
		}

		const zipFilePath = path.resolve(`${quasArgs.sourceFolder}/${quasArgs.source}.${quasArgs.sourceExt}`);
		const destinationPath = path.resolve(`${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`);
		log(`unpacking source files from (${zipFilePath}) to the public folder (${destinationPath})`);

		if (!fs.existsSync(zipFilePath)) {
			logError(`source could not be found`, zipFilePath);
			return reject();
		}

		if (fs.existsSync(findTargetFile(quasArgs))) {
			if(!quasArgs.overwriteUnpackDestination) {
				logError(`files have already been unpacked, run again with option --overwriteUnpackDestination=true to overwite files.`);
				return resolve();
			} else {
				logInfo(`overwriting files in ouput folder ${destinationPath}`);
			}
		}
		unzip(zipFilePath, {dir: destinationPath}, (err) => {
			// extraction is complete. make sure to handle the err
			if(err) {
				logError(err.Error || err, colors.red);
				return reject();
			}

			logSuccess(`files successfully unziped to ${destinationPath}`);
			// moveTargetFilesToRootOfAssetsPath(quasArgs);

			resolve(quasArgs);
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
		.on('end', () => { logInfo(`Style files compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.css`); });
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
		.on('end', () => { logInfo(`Script files compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.js`); });
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
		.on('end', () => { logInfo(`Document files compiled into ${quasArgs.assetsFolder}/${quasArgs.qType}.html`); });
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
		log(`getting template file (${quasArgs.targetFilePath}) and assets(css:${css ? quasArgs.stylesAsset.replace(quasArgs.assetsFolder, '') : 'none'}   js: ${js ? quasArgs.scriptsAsset.replace(quasArgs.assetsFolder, '')  : 'none'})`);

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
				reject(err);
			})
			.on('end', (msg) => { 
				logSuccess('injection pipeline ended successfully');
				resolve(quasArgs); 
			});
	});
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
				.on('end', () => { logSuccess(`Files successfully uploaded to S3 under the path: /${quasArgs.bucketPath}`); resolve(); });
		} else {
			logError(`Could not find AWS configuration, aborting upload.`);
			return resolve(quasArgs);
		}
	});
}

// Compile the quasar into the output folder
const outputToHtmlFile = (quasArgs) => {
	return new promise((resolve, reject) => {
		const outputPath = `${quasArgs.outputFolder.replace(quasArgs.dirname, '')}/${quasArgs.domain}/${quasArgs.signal}`;
		log(`Applying the following parameters to the template (${quasArgs.targetFilePath}) and building output`);
		// logData(quasArgs);

		return gulp.src(quasArgs.targetFilePath) 
		.pipe(template(quasArgs))
		.pipe(rename({
			dirname: outputPath,
			basename: quasArgs.output,
			extname: `.${quasArgs.outputExt}`
		}))
		.pipe(gulp.dest(quasArgs.dirname))
		.on('error', (err) => { logError(`Error outputing file (${quasArgs.targetFilePath})`, err); })
		.on('end', () => { 
			if(quasArgs.cleanUpTargetFileTemplate && (quasArgs.targetFilePath.indexOf(`${quasArgs.output}.${quasArgs.outputExt}`) == -1)) {
				logInfo(`Removing templated file ${quasArgs.targetFilePath}`);
				fs.unlink(quasArgs.targetFilePath);
			}
			logSuccess(`Output file saved as: ${quasArgs.dirname}${outputPath}/${quasArgs.output}.${quasArgs.outputExt}`);
			quasArgs.buildCompletedSuccessfully = true;
			return resolve(quasArgs);
		});
	});
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
	getDefaultQuasArgs,
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
	outputToHtmlFile,
	promptConsole,
	quasarSelectPrompt,
	registerRequiredQuasArgs,
	runTask,
	spawnQuasarTask,
	unpackFiles,
	uploadFiles,
	// Externally controlled values
	logToFile
}