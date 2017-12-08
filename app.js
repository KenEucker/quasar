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

let webForm;

requireDir('./tasks/');


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

gulp.task(`watchJobs`, () => {
	lib.logSuccess(`watching folder /jobs/ for new or changed files to build from`);

	return watch('jobs/*.json', { ignoreInitial: true })
		.pipe(jsonTransform(transformToProcessArgs))
		.pipe(vinylPaths(del))
		.pipe(gulp.dest('jobs/archived'));
});

if(yargs.argv.runAsProcess) {
	if (yargs.argv.runApi) {
		lib.definitelyCallFunction(() => {
			api.run();
		});
	}

	if (yargs.argv.runWebForm) {
		// TODO: use more intelligent path
		const webFormPath = path.resolve(`./public/quasar/Webform/app.js`);
		if(fs.existsSync(webFormPath)) {
			webForm = require(webFormPath);
			lib.definitelyCallFunction(() => {
				webForm.run();
			});
		}
	}

	if (yargs.argv.watchJobs) {
		lib.definitelyCallFunction(() => {
			lib.runTask('watchJobs');
		});
	}
} else if (yargs.argv.qType) {
	lib.logInfo('automated quasar build from quasArgs')
	lib.definitelyCallFunction(() => {
		lib.runTask(yargs.argv.qType);
	});
} else {
	lib.definitelyCallFunction(() => {
		initialPrompt();
	});
}
