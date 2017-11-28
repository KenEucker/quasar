let gulp = require('gulp'),
	template = require('gulp-template'),
	rename = require('gulp-rename'),
	inject = require('gulp-inject-string'),
	prompt = require('inquirer'),
	aws = require('aws-sdk'),
	unzip = require("extract-zip"),
	path = require('path'),
	colors = require('colors'),
	promise = require('bluebird'),
	fs = require('fs'),
	yargs = require('yargs'),
	mkdir = require('mkdirp-sync');

const config = require(`${process.cwd()}/config.js`);

const getDefaultQuasArgs = (qType = null) => { 
	return Object.assign({ 
			dirname: config.dirname,
			outputFolder: config.outputFolder,
			sourceFolder: config.sourceFolder,
			assetsFolder: qType ? `${config.assetsFolder}/${qType}` : undefined,
			stylesAsset: qType ? `${qType}.css` : undefined,
			scriptsAsset: qType ? `${qType}.js` : undefined,
			target: qType ? `${qType}.html` : undefined,
			targetFilePath: qType ? `${config.assetsFolder}/${qType}/${qType}.html` : undefined,
			bucket: 'ads',
			outputExt: 'txt',
			cdnUrlStart: 'https://cdn.dtcn.com/',
			clickUrl: '!! PASTE CLICK URL HERE !!',
			uploadToS3: false,
			unpackFiles: true,
			overwriteUnpackDestination: false,
			buildCompletedSuccessfully: false,
			qType,
			registerRequiredQuasArgs: (args) => { return registerRequiredQuasArgs(this, args) } },
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

const spawnQuasarTask = (args) => {
	const command = `node`;
	args.unshift('gulpfile.js');
	lib.log(`Running command ${command} ${args.join(' ')}`);
	spawn.spawn(command, args)
		.on("error", (error) => { console.log(`ERROR:`, error); })
		.on("data", (data) => { console.log("DATA: ", data); })
		.on("end", (msg) => { console.log("Ended: ", msg); });
};

const getTaskNames = (dir) => {
	return getFilenamesInDirectory(dir, ['js'], true);

	// TODO: add the extension parameter
	const filenames = fs.readdirSync(dir)
		.filter(function(file){
			return !fs.statSync(path.join(dir, file)).isDirectory();
		});

	return filenames.map( filename => filename.replace(path.extname(filename), '') );
}

const getFilenamesInDirectory = (directory, extensions = [], removeExtension = false) => {
	let filenames = [];

	if(fs.existsSync(directory))
	{
		filenames = fs.readdirSync(directory)
			.filter(function(file) {
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
	let logger = console.log;

	switch(status) {
		case 'error':
			logger = console.error;
		break;
		
		case 'log':
			logger = console.log;
		break;

		case '':
		case 'info':
		default:
			logger = console.info;
		break;
	}


	if(obj) {
		logger(color(message), obj);
	} else {
		logger(color(message));
	}
	return;
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
};

// This one has to be typehinted as a function for the async method
const makePromptRequired = function (input) {
	// Declare function as asynchronous, and save the done callback
	var done = this.async();

	// Do async stuff
	setTimeout(function() {
		if (!input.length) {
			// Pass the return value in the done callback
			done('This value is required');
			return;
		}
		// Pass the return value in the done callback
		done(null, true);
	}, 100);
}

const runTask = (task) => {
	if(gulp.hasTask(task)) {
		gulp.start(task);
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

const promptConsole = (questions, getResults) => {
	return prompt.prompt(questions).then(getResults);
}

const getQuasarPromptQuestions = () => {
	return [{
		type: 'input',
		name: 'domain',
		message: 'Enter the name of the domain to be used in building assets:\n',
		validate: makePromptRequired
	},
	{
		type: 'input',
		name: 'signal',
		message: 'Enter the name of the signal to be used when compiling quasars:\n',
		validate: makePromptRequired
	}];
}

const registerRequiredQuasArgs = (args, registerArgs) => {
	let quasArgs = Object.assign(args, registerArgs);

	// TODO: more sophisticated registering

	return quasArgs;
};

const hasQuasarAnswers = (quasArgs) => {
	return quasArgs.domain && quasArgs.signal;
};

const findTargetFile = (quasArgs) => {
	const signalPath = path.resolve(`${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`);
	let targetFilePath = quasArgs.targetFilePath || path.resolve(`${signalPath}/${quasArgs.target}`);
	
	if (!fs.existsSync(targetFilePath)) {
		const oldTargetFilePath = targetFilePath;
		targetFilePath = fromDir(`${signalPath}`, `${quasArgs.target}`);
		
		if(targetFilePath) {
			log(`couldnt find file at ${oldTargetFilePath}, corrected path is: ${targetFilePath}`, colors.yellow);
			targetFilePath = path.resolve(targetFilePath);
		}
	}

	return targetFilePath;
}

const copyTargetFileToOutputPath = (quasArgs) => {
	const signalPath = path.resolve(`${quasArgs.outputFolder}/${quasArgs.domain}/${quasArgs.signal}`);
	const targetFilePath = findTargetFile(quasArgs);
	const outputFilePath = fromDir(signalPath, quasArgs.target) || path.resolve(`${signalPath}/${quasArgs.target}`);

	if(fs.existsSync(targetFilePath)) {
		log(`copying target file to output path: ${outputFilePath}`);
		const outfile = fs.readFileSync(targetFilePath, 'utf-8');
		
		mkdir(signalPath);
		if(!outfile) {
			return targetFilePath;
		}

		fs.writeFileSync(outputFilePath, outfile);
		return outputFilePath;
	}

	return outputFilePath;
};

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
				logError(`files have already been unpacked, run again with option --overwriteUnpackDestination=true .`);
				return resolve();
			} else {
				logInfo(`overwriting files in ouput folder ${destinationPath}`);
			}
		}
		unzip(zipFilePath, {dir: destinationPath}, function (err) {
			// extraction is complete. make sure to handle the err
			if(err) {
				logError(err.Error || err, colors.red);
				return reject();
			}

			logSuccess(`files successfully unziped to ${destinationPath}`);
			resolve();
		});
	});
}

// Inject the code into the html file before applying template vars
const injectCode = (quasArgs) => {
	return new promise((resolve, reject) => {
		const urlToPrependCDNLink = quasArgs.target ? quasArgs.target.replace('.html','') : quasArgs.targetFilePath.split('/').pop().replace('.html','');
		const cdnTemplate = `<%= cdnUrlStart %><%= bucketPath %>/`;
		let css = (quasArgs.stylesAsset && quasArgs.stylesAsset.length) ? `${quasArgs.assetsFolder}/${quasArgs.stylesAsset}` : null;
		let js = (quasArgs.scriptsAsset && quasArgs.scriptsAsset.length) ? `${quasArgs.assetsFolder}/${quasArgs.scriptsAsset}` : null;

		// TODO: check if injection locations exist or not
		if(css) {
			let css_contents = fs.existsSync(css) ? fs.readFileSync(css, 'utf8') : '';
			css = css_contents.length ? `<style>\n${css_contents}\n</style>\n` : ``;
		}
		if(js) {
			let js_contents = fs.existsSync(js) ? fs.readFileSync(js, 'utf8') : '';
			js = js_contents.length ? `<script>\n${js_contents}\n</script>\n` : ``;
		}
		
		log('injecting public code prior to applying template parameters');
		log(`getting assets from (${quasArgs.assetsFolder})`);
		log(`getting template file (${quasArgs.targetFilePath}) and assets(css:${css ? quasArgs.stylesAsset : 'none'}   js: ${js ? quasArgs.scriptsAsset  : 'none'})`);

		return gulp.src(quasArgs.targetFilePath, { base: quasArgs.dirname })
			.pipe(inject.before(`${urlToPrependCDNLink}.`, cdnTemplate))
			.pipe(inject.before('</head>', css))
			.pipe(inject.before('</body>', js))
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

// Upload resources to S3
const uploadFiles = (quasArgs) => {
	return new promise((resolve, reject) => {
		if(!quasArgs.uploadToS3) {
			return resolve();
		}

		let s3 = new aws.S3();
		const s3Key = 'autotest';
		logInfo('Uploading files to S3');

		s3.createBucket({Bucket: quasArgs.bucketPath}, function(err, data) {
			if (err) {
				logError(err);
			} else {
				params = {Bucket: bucketPath, Key: s3Key, Body: 'Hello!'};
				s3.putObject(params, function(err, data) {
					if (err) {
						logError(err);
						reject();
					} else {
						logSuccess(`Successfully uploaded data to ${bucketPath}/${s3Key}`);
					}

					resolve(quasArgs);
				});
			}
		});
	});
}

// Compile the quasar into the output folder
const outputToHtmlFile = (quasArgs) => {
	return new promise((resolve, reject) => {
		const outputPath = `${quasArgs.outputFolder.replace(quasArgs.dirname, '')}/${quasArgs.domain}/${quasArgs.signal}`;
		log('Applying the following parameters to the template and building output', quasArgs);

		return gulp.src(quasArgs.targetFilePath) 
		.pipe(template(quasArgs))
		.pipe(rename({
			dirname: outputPath,
			basename: quasArgs.output,
			extname: `.${quasArgs.outputExt}`
		}))
		.pipe(gulp.dest(quasArgs.dirname))
		.on('end', () => { 
			logSuccess(`Output file saved as: ${outputPath}/${quasArgs.output}.${quasArgs.outputExt}`);
			quasArgs.buildCompletedSuccessfully = true;
			resolve(quasArgs);
		});
	});
}

module.exports = {
	copyTargetFileToOutputPath,
	definitelyCallFunction,
	findTargetFile,
	fromDir,
	getDefaultQuasArgs,
	getFilenamesInDirectory,
	getTaskNames,
	getQuasarPromptQuestions,
	hasQuasarAnswers,
	injectCode,
	logAsync,
	log,
	logInfo,
	logError,
	logFin,
	makePromptRequired,
	outputToHtmlFile,
	promptConsole,
	quasarSelectPrompt,
	registerRequiredQuasArgs,
	runTask,
	spawnQuasarTask,
	unpackFiles,
	uploadFiles
}