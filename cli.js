let gulp = require('gulp'),
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

let PORT = process.env.PORT || '3720';


const initialPrompt = () => {
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

const transformToProcessArgs = (data, file) => {
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

	let result = lib.spawnQuasarTask(file.path, cliArgs);

	// Return the args as the log so that the command can be analyzed or rerun
	return `[${result}] --> node ${cliArgs.join(' ')}`;
};

const spawnWebForm = (runningApi) => {
	const webFormPath = path.resolve(`./public/quasar/Webform/app.js`);

	if(fs.existsSync(webFormPath)) {
		lib.logInfo(`loading the webform file ${webFormPath}`);

		webForm = require(webFormPath);
		lib.definitelyCallFunction(() => {
			if(runningApi) {
				webForm.run(api.app, api.PORT);
			} else {
				webForm.run();
			}
		});

		return true;
	}

	return false;
}

gulp.task(`watchJobs`, () => {
	lib.logSuccess(`watching folder /jobs/ for new or changed files to build from`);
	mkdir(path.resolve(lib.config.dirname, 'jobs'));
	
	return watch('jobs/*.json', { ignoreInitial: true })
		.pipe(jsonTransform(transformToProcessArgs))
		//.pipe(vinylPaths(del))
		.pipe(rename({
			suffix: `_${Date.now()}`,
			extname: `.log`
		}))
		.pipe(gulp.dest('jobs/logs'));
});

const packageElectronApp = () => {
	packager({ executableName: 'quasar', platform: 'all' });
}

const run = (args = {}) => {
	return new promise((resolve, reject) => {

		let defaults = {
			port: PORT,
			runAsProcess: false,
			runStandalone: false,
			watchJobs: false,
			qType: false,
			runWebForm: false,
			autoBuildWebForm: false,
			runApi: false };
		args = Object.assign(defaults, yargs.argv, args);
		PORT = args.port;
		
		lib.logInfo(`Running the qausar cli under the process: ${process.title}`);
		if(args.runAsProcess) {
			if (args.runApi) {
				lib.definitelyCallFunction(() => {
					api.run(args.port);
				});
			}

			if (args.runWebForm) {
				// TODO: use more intelligent path
				if(!spawnWebForm(args.runApi)) { 
					if(args.autoBuildWebForm) {
						lib.logInfo('automated quasar build of `quasarWebform`');
						lib.definitelyCallFunction(() => {
							lib.runTask('quasarWebform', () => {
								lib.logInfo('attempting another run of the quasarWebform');
								if(!spawnWebForm(args.runApi)) {
									lib.logError(`Can't do that!`);
								}
							});
						});
					} else {
						lib.logError(`cannot run webform because ${path.resolve(`./public/quasar/Webform/app.js`)} has not been built yet, run again with option --autoBuildWebForm=true to auto build the webform.`);
						return reject();
					}
				}
			}

			if (args.watchJobs) {
				return lib.definitelyCallFunction(() => {
					lib.runTask('watchJobs');
					return resolve();
				});
			}
		}
		
		if (args.qType) {
			lib.logInfo('automated quasar build from quasArgs');
			return lib.definitelyCallFunction(() => {
				lib.runTask(args.qType);
				return resolve();
			});
		} else if (args.runStandalone) {
			return lib.definitelyCallFunction(() => {
				initialPrompt();
				return resolve();
			});
		} else if (args.packageApp) {
			lib.logInfo('packaging into an application');
			return lib.definitelyCallFunction(() => { 
				packageElectronApp(); 
				return resolve();
			});
		}

		return resolve();
	});
}

if ( yargs.argv.runStandalone || yargs.argv.runAsProcess || yargs.argv.packageApp) {
	run();
} else if (process.title == 'gulp') {
	run({ runStandalone: true });
}

module.exports = {
	app: api.app,
	PORT,
	run
};