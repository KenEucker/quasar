let gulp = require('gulp'),
	requireDir = require('require-dir'),
	fs = require('fs'),
	path = require('path'),
	promise = require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	spawn = require('child_process'),
	jsonTransform = require('gulp-json-transform'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	lib = require('./lib'),
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
	let args = [];
	data.noPrompt = true;
	Object.keys(data).forEach(key => {
		let val = data[key];
		args.push(`--${key}=${val}`);
	});

	lib.spawnQuasarTask(args);

	return args;
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

	return watch('jobs/*.json', { ignoreInitial: true })
		.pipe(jsonTransform(transformToProcessArgs))
		.pipe(vinylPaths(del))
		.pipe(gulp.dest('jobs/archived'));
});

const run = (args = {}) => {
	let _args = {
		port: PORT,
		runAsProcess: false,
		runStandalone: false,
		watchJobs: false,
		qType: false,
		runWebForm: false,
		autoBuildWebForm: false,
		runApi: false };
	args = Object.assign(_args, yargs.argv, args);
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
				}
			}
		}

		if (args.watchJobs) {
			lib.definitelyCallFunction(() => {
				lib.runTask('watchJobs');
			});
		}
	} else if (args.qType) {
		lib.logInfo('automated quasar build from quasArgs');
		lib.definitelyCallFunction(() => {
			lib.runTask(args.qType);
		});
	} else if(args.runStandalone){
		lib.definitelyCallFunction(() => {
			initialPrompt();
		});
	}
}

if( yargs.argv.runStandalone || yargs.argv.runAsProcess ) {
	run();
} else if (process.title == 'gulp') {
	run({ runStandalone: true });
}

module.exports = {
	app: api.app,
	PORT,
	run
};