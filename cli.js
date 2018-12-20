const gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	promise = Promise, // require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	plumber = require('gulp-plumber'),
	os = require('os'),
	jsonTransform = require('gulp-json-transform'),
	lib = require('./lib.js'),
	electronPackager = require("gulp-electron"),
	mkdir = require('mkdirp-sync');

class CLI {
	constructor() {
		const runOnStart = yargs.argv.runStandalone 
			|| yargs.argv.runAsProcess
			|| yargs.argv.packageApp
			|| yargs.argv.runElectronApp;

		// throw 'constructing CLI';
		if (runOnStart) {
			// throw 'running CLI';
			return this.run()
				.catch((err) => {
					console.log(err);
					lib.logError(err, err);
				});
		} else if (process.title == 'gulp') {
			// throw 'running CLI';
			return this.run({ runStandalone: true })
				.catch((err) => {
					console.log(err);
					lib.logError(err, err);
				});
		}
		// throw 'constructed CLI';
	}

	get jobsFolder() {
		return lib.getConfig().jobsFolder;
	}

	get applicationRoot() {
		return lib.getConfig().applicationRoot;
	}

	get outputRoot() {
		return lib.getConfig().outputRoot;
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
			`--argsFile=${argsFile}`,
			`--logSeverity=${yargs.argv.logSeverity}`
		];

		lib.spawnCommand(cliArgs, 'node', true);

		return "";
	}

	spawnWatchjobs(retryJobs = true) {
		const jobQueueFolder = `${this.jobsFolder}/created`;
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
		const webFormPath = `${this.applicationRoot}/app/quasar/Webform/app.js`;

		if (fs.existsSync(webFormPath)) {
			lib.logInfo(`loading the webform application ${webFormPath}`);

			this.webForm = require(webFormPath);
			this.webForm.init();
			// console.log('this should attach to the app', api.app);
			this.webForm.run(this._api.app, this._api.port);

			return true;
		}

		return false;
	}

	spawnElectronApp() {
		lib.spawnCommand(['.'], 'electron', true);
	}

	packageIntoElectronApp() {
		const packageJson = require(`${lib.getConfig().applicationRoot}/package.json`);
		packageJson.name = `quasarWebForm`;
		packageJson.main = `electron.js`;
		packageJson.productName = `quasar`;

		return gulp.src('')
			.pipe(electronPackager({ 
				src: lib.getConfig().applicationRoot,
				packageJson: packageJson,
				release: './dist',
				cache: './cache',
				version: packageJson.version,
				packaging: true,
				platforms: ['darwin-x64'],
				platformResources: {
					darwin: {
						CFBundleDisplayName: packageJson.name,
						CFBundleIdentifier: packageJson.name,
						CFBundleName: packageJson.name,
						CFBundleVersion: packageJson.version,
						icon: 'icon.icns'
					}
					// win: {
					// 	"version-string": packageJson.version,
					// 	"file-version": packageJson.version,
					// 	"product-version": packageJson.version,
					// 	"icon": 'icon.ico'
					// }
				}
			}))
			.pipe(gulp.dest(''));
	}

	runProcess(args, resolve, reject) {
		if (args.cleanAllOutputFolders) {
			lib.cleanOutputFolders(lib.getConfig(), true);
			lib.logSuccess(`Successfully cleaned output root path ${path.resolve(`${lib.getConfig().outputFolder}`, `../`)}`);
		}

		if (args.cleanOutputFolder) {
			lib.cleanOutputFolders(lib.getConfig());
			lib.logSuccess(`Successfully cleaned output folder path ${lib.getConfig().outputFolder}`);
		}

		if (args.cleanDevFolders) {
			lib.cleanDevFolders(lib.getConfig());
			lib.logSuccess(`Successfully cleaned the dev folder paths in the application root ${lib.getConfig().applicationRoot}`);
		}

		if(args.runElectronApp) {
			lib.logInfo('running the webApp in electron');
			lib.definitelyCallFunction(() => {
				this.spawnElectronApp();
			});
			return resolve();
		}

		if (args.qType) {
			lib.logInfo('automated quasar build from quasArgs');
			lib.definitelyCallFunction(() => {
				return lib.runTask(args.qType, true).then(resolve);
			});
		}

		if (args.runWebApi) {
			lib.debug(`will run webApi`);
			this._api.run(null, args.port);
		}

		if (args.watchJobs) {
			lib.runTask('watchJobs');
		}

		if (args.runWebForm) {
			// TODO: use more intelligent path
			if (!this.spawnWebForm(args.runWebApi)) {
				if (args.autoBuildWebForm) {
					lib.logInfo('automated quasar build of `quasarWebform`');
					lib.runTask('quasarWebform', () => {
						lib.logInfo('attempting another run of the quasarWebform');
						if (!this.spawnWebForm(args.runWebApi)) {
							lib.logError(`Can't do that!`);
							return reject();
						} else {
							return resolve();
						}
					});

					return true;
				} else {
					lib.logError(`cannot run webform because ${this.applicationRoot}/app/quasar/Webform/app.js has not been built yet, run again with option --autoBuildWebForm=true to auto build the webform.`);
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
				runWebApi: false
			};
			args = Object.assign(defaults, yargs.argv, args);
			this.port = args.port;

			this.init(args.appRoot);
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
						args.availableTasks = lib.loadTasks(args.loadTasks, args.loadDefaultTasks);
						lib.quasarSelectPrompt(args);
						return resolve();
					});
				} else if (args.packageApp) {
					lib.logInfo('packaging into an application');
					return lib.definitelyCallFunction(() => {
						this.packageIntoElectronApp();
						return resolve();
					});
				}
			} catch (e) {
				args.error = e;
				args.argsFile = args.argsFile || `${this.jobsFolder}/${lib.STATUS_FAILED}/${args.jobTimestamp || Date.now()}.json`;
				lib.logArgsToFile(args, null, true);
				lib.logError(e, e);
				return reject(e);
			}
		});
	}

	init(appRoot = process.cwd(), outRoot = `${os.homedir()}/Documents/quasar/`) {
		lib.init(appRoot, outRoot);

		lib.debug(`applicationRoot folder is correct`, appRoot);
		lib.debug(`outputRoot folder is correct`, outRoot);

		this._api = require(`${this.applicationRoot}/api.js`);
		this._app = this._api.app;
		this.port = process.env.PORT || '3720';

		lib.registerTask('watchJobs', () => {
			return this.spawnWatchjobs(yargs.argv.retryJobs);
		});

		mkdir(this.jobsFolder);
		mkdir(`${this.jobsFolder}/${lib.STATUS_CREATED}`);
		mkdir(`${this.jobsFolder}/${lib.STATUS_COMPLETED}`);
		mkdir(`${this.jobsFolder}/${lib.STATUS_QUEUED}`);
		mkdir(`${this.jobsFolder}/${lib.STATUS_FAILED}`);

		// throw 'CLI initialized';
	}
}

module.exports = new CLI();