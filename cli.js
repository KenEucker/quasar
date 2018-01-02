const gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	promise = Promise, // require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	spawn = require('child_process'),
	jsonTransform = require('gulp-json-transform'),
	lib = require('./lib.js'),
	// packager = require('electron-packager'),
	mkdir = require('mkdirp-sync');

class CLI {
	constructor() {
		// throw 'constructing CLI';
		this.port = process.env.PORT || '3720';
		this._jobsFolder = lib.config.jobsFolder || `${process.cwd()}/jobs`;

		gulp.task(`watchJobs`, () => {
			const jobQueueFolder = `${this._jobsFolder}/queued`;
			
			lib.logSuccess(`watching folder ${jobQueueFolder} for new or changed files to build from`);
			return watch(`${jobQueueFolder}/*.json`, { ignoreInitial: true })
				.pipe(jsonTransform(this.transformToProcessArgs));
		});

		if ( yargs.argv.runStandalone || yargs.argv.runAsProcess || yargs.argv.packageApp) {
			// throw 'running CLI';
			return this.run();
		} else if (process.title == 'gulp') {
			// throw 'running CLI';
			return this.run({ runStandalone: true });
		}
		// throw 'constructed CLI';
	}

	get jobsFolder() {
		return this._jobsFolder;
	}

	get app() {
		return this._api.app || undefined;
	}

	transformToProcessArgs(data, file) {
		lib.log(`processing file (${file.path})`);

		// For the logs
		let args = [];
		Object.keys(data).forEach(key => {
			let val = data[key];
			args.push(`--${key}=${val}`);
		});
		let cliArgs = [
			`--qType=${data.qType}`,
			`--noPrompt=true`,
			`--runAsProcess=true`,
			`--argsFile=${file.path}`
		];

		let result = lib.spawnCommand(file.path, cliArgs);

		// Return the args as the log so that the command can be analyzed or rerun
		return `[${result}] --> node ${cliArgs.join(' ')}`;
	}

	spawnWebForm() {
		const webFormPath = path.resolve(`./public/quasar/Webform/app.js`);

		if(fs.existsSync(webFormPath)) {
			lib.logInfo(`loading the webform file ${webFormPath}`);

			this.webForm = require(webFormPath);
			this.webForm.init();
			// console.log('this should attach to the app', api.app);
			this.webForm.run(this._api.app, this._api.port);

			return true;
		}

		return false;
	}

	packageElectronApp() {
		packager({ executableName: 'quasar', platform: 'all' });
	}

	runAsProcess(args, resolve, reject) {
		if (args.runApi) {
			// console.log('this should creat the app');
			this._api.run(null, args.port);
		}
		
		if (args.watchJobs) {
			lib.runTask('watchJobs');
		}

		if (args.runWebForm) {
			// TODO: use more intelligent path
			if(!this.spawnWebForm(args.runApi)) {
				if(args.autoBuildWebForm) {
					lib.logInfo('automated quasar build of `quasarWebform`');
						lib.runTask('quasarWebform', () => {
								lib.logInfo('attempting another run of the quasarWebform');
								if(!this.spawnWebForm(args.runApi)) {
									lib.logError(`Can't do that!`);
								} else {
									resolve();
								}
						});

						return true;
				} else {
					lib.logError(`cannot run webform because ${path.resolve(`./public/quasar/Webform/app.js`)} has not been built yet, run again with option --autoBuildWebForm=true to auto build the webform.`);
					reject();
					return true;
				}
			} else {
				resolve();
				return true;
			}
		}

		return false;
	}

	run(args = {}) {
		return new promise((resolve, reject) => {
			let defaults = {
				appRoot: path.resolve(process.cwd()),
				port: this.port,
				runAsProcess: false,
				runStandalone: false,
				watchJobs: false,
				qType: false,
				runWebForm: false,
				autoBuildWebForm: false,
				runApi: false };
			args = Object.assign(defaults, yargs.argv, args);
			this.port = args.port;

			// console.log(`Application root folder: ${args.appRoot}`);
			this.init(args.appRoot);
			lib.init(args.appRoot);
			args.availableTasks = lib.loadTasks(args.loadTasks, args.loadDefaultTasks);

			lib.logInfo(`Running the qausar cli under the process: ${process.title}`);
			if(args.reRunLastSuccessfulBuild || args.reRun) {
				lib.logInfo(`Running the last recorded successful run from the logfile`);
				lib.runLastSuccessfulBuild();

				return resolve();
			} else if(args.runAsProcess) {
				lib.definitelyCallFunction(() => {
					if(this.runAsProcess(args, resolve, reject)) {
						return;
					}
				});
			}
			
			if (args.qType) {
				lib.logInfo('automated quasar build from quasArgs');
				return lib.definitelyCallFunction(() => {
					lib.runTask(args.qType);
					return resolve();
				});
			} else if (args.runStandalone) {
				return lib.definitelyCallFunction(() => {
					lib.quasarSelectPrompt(args);
					return resolve();
				});
			} else if (args.packageApp) {
				lib.logInfo('packaging into an application');
				return lib.definitelyCallFunction(() => {
					this.packageElectronApp();
					return resolve();
				});
			}
		});
	}

	init(dirname = process.cwd()) {
		this._api = require(`${dirname}/api`);
		this._app = this._api.app;
		this._jobsFolder = `${dirname}/jobs`;

		mkdir(this._jobsFolder);
		mkdir(`${this._jobsFolder}/started`);
		mkdir(`${this._jobsFolder}/queued`);
		mkdir(`${this._jobsFolder}/completed`);

		// throw 'CLI initialized';
	}
}

module.exports = new CLI();