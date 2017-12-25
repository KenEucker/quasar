const gulp = require('gulp'),
	requireDir = require('require-dir'),
	fs = require('fs'),
	rename = require('gulp-rename'),
	path = require('path'),
	promise = require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	spawn = require('child_process'),
	jsonTransform = require('gulp-json-transform'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	lib = require('./lib'),
	mkdir = require('mkdirp-sync'),
	// packager = require('electron-packager'),
	api = require('./api');
requireDir('./tasks/');

class CLI {
	constructor() {
		this._app = api.app;
		this.port = process.env.PORT || '3720';
		
		gulp.task(`watchJobs`, () => {
			mkdir(path.resolve(lib.config.dirname, 'jobs'));
			
			lib.logSuccess(`watching folder /jobs/ for new or changed files to build from`);
			return watch('jobs/queued/*.json', { ignoreInitial: true })
				.pipe(jsonTransform(this.transformToProcessArgs));
		});
		
		if ( yargs.argv.runStandalone || yargs.argv.runAsProcess || yargs.argv.packageApp) {
			return this.run();
		} else if (process.title == 'gulp') {
			return this.run({ runStandalone: true });
		}
	}

	get app() {
		return this._app;
	}

	initialPrompt() {
		const tasksPath = path.resolve('./tasks/');
		let availableTasks = lib.getTaskNames(tasksPath);

		return lib.promptConsole([{
			type: 'list',
			name: 'task',
			message: `Select the type of quasar you want to launch:\n`,
			choices: availableTasks
		}], res => {
			lib.runTask(res.task);
		});
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
			this.webForm.run(api.app, api.port);

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
			api.run(null, args.port);
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
			// lib.init(args.appRoot);
			
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
					this.initialPrompt();
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
}

module.exports = new CLI();