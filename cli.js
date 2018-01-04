const gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	promise = Promise, // require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	plumber = require('gulp-plumber'),
	spawn = require('child_process'),
	jsonTransform = require('gulp-json-transform'),
	lib = require('./lib.js'),
	// packager = require('electron-packager'),
	mkdir = require('mkdirp-sync');

class CLI {
	constructor() {
		// throw 'constructing CLI';
		this.port = process.env.PORT || '3720';
		this._jobsFolder = lib.getConfig().jobsFolder || `${process.cwd()}/jobs`;

		gulp.task('watchJobs', () => {
			return this.spawnWatchjobs(yargs.argv.retryJobs);
		});

		if (yargs.argv.runStandalone || yargs.argv.runAsProcess || yargs.argv.packageApp) {
			// throw 'running CLI';
			return this.run()
				.catch((err) => {
					lib.logError(err);
				});
		} else if (process.title == 'gulp') {
			// throw 'running CLI';
			return this.run({ runStandalone: true })
				.catch((err) => {
					lib.logError(err);
				});
		}
		// throw 'constructed CLI';
	}

	get jobsFolder() {
		return this._jobsFolder;
	}

	get app() {
		return this._api.app || undefined;
	}

	getJobError(jobFile) {
		if (!fs.existsSync(jobFile)) {
			return false;
		}
		
		const tempFile = fs.readFileSync(jobFile, "utf8");
		argsFile = JSON.parse(tempFile);

		return argsFile.error || true;
	}

	processArgsFile(argsFile, data) {
		if (!data && fs.existsSync(argsFile)) {
			const dataFile = fs.readFileSync(argsFile, "utf8");
			data = JSON.parse(dataFile);
		}
		lib.log(`processing argsFile (${argsFile})`);

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
			`--argsFile=${argsFile}`
		];

		lib.spawnCommand(cliArgs, 'node', true);

		return "";
	}

	spawnWatchjobs(retryJobs = true) {
		const jobQueueFolder = `${this._jobsFolder}/created`;
		const src = `${jobQueueFolder}/**/*`;
		lib.logSuccess(`watching folder ${jobQueueFolder} for new or changed files to build from`);
		return watch(src, { 
			ignoreInitial: true,
			verbose: true
		}, (file) => {
			return gulp.src(file.path)
				.pipe(jsonTransform((data, file) => {
				return this.processArgsFile(file.path, data);
			}))

			const fileNotQueuedError = this.getJobError(file.path);
			if (fileNotQueuedError) {
				lib.logError(`jobFile ${file.path} did not queue due to error:`, fileNotQueuedError);

				if (retryJobs) {
					lib.logInfo(`retrying jobFile ${file.path}`);
					this.processArgsFile(file.path);
				}
			}
		})
		.pipe(plumber())
	}


	spawnWebForm() {
		const webFormPath = path.resolve(`./public/quasar/Webform/app.js`);

		if (fs.existsSync(webFormPath)) {
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

	runProcess(args, resolve, reject) {
		if (args.qType) {
			lib.logInfo('automated quasar build from quasArgs');
			lib.definitelyCallFunction(() => {
				return lib.runTask(args.qType).then(resolve);
			});
		}

		if (args.runApi) {
			// console.log('this should creat the app');
			this._api.run(null, args.port);
		}

		if (args.watchJobs) {
			lib.runTask('watchJobs');
		}

		if (args.runWebForm) {
			// TODO: use more intelligent path
			if (!this.spawnWebForm(args.runApi)) {
				if (args.autoBuildWebForm) {
					lib.logInfo('automated quasar build of `quasarWebform`');
					lib.runTask('quasarWebform', () => {
						lib.logInfo('attempting another run of the quasarWebform');
						if (!this.spawnWebForm(args.runApi)) {
							lib.logError(`Can't do that!`);
							return reject();
						} else {
							return resolve();
						}
					});

					return true;
				} else {
					lib.logError(`cannot run webform because ${path.resolve(`./public/quasar/Webform/app.js`)} has not been built yet, run again with option --autoBuildWebForm=true to auto build the webform.`);
					return reject();
				}
			} else {
				return resolve();
			}
		}

		return resolve();
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
				runApi: false
			};
			args = Object.assign(defaults, yargs.argv, args);
			this.port = args.port;

			// console.log(`Application root folder: ${args.appRoot}`);
			this.init(args.appRoot);
			lib.init(args.appRoot);
			args.availableTasks = lib.loadTasks(args.loadTasks, args.loadDefaultTasks);

			lib.logInfo(`Running the qausar cli under the process: ${process.title}`);

			try {
				if (args.runLastSuccessfulBuild || args.reRun) {
					lib.logInfo(`Running the last recorded successful run from the logfile`);
					return lib.definitelyCallFunction(() => {
						return lib.runLastSuccessfulBuild().then(resolve);
					});
				} else if (args.runAsProcess) {
					return lib.definitelyCallFunction(() => {
						return this.runProcess(args, resolve, reject);
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
			} catch (e) {
				console.log(e);
				args.error = e;
				lib.logArgsToFile(args, null, true);
				return reject(e);
			}
		});
	}

	init(dirname = process.cwd()) {
		this._api = require(`${dirname}/api`);
		this._app = this._api.app;
		this._jobsFolder = `${dirname}/jobs`;

		mkdir(this._jobsFolder);
		mkdir(`${this._jobsFolder}/created`);
		mkdir(`${this._jobsFolder}/queued`);
		mkdir(`${this._jobsFolder}/completed`);

		// throw 'CLI initialized';
	}
}

module.exports = new CLI();