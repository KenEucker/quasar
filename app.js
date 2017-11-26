let gulp = require('gulp'),
	requireDir = require('require-dir'),
	prompt = require('inquirer'),
	fs = require('fs'),
	path = require('path'),
	promise = require('bluebird'),
	yargs = require('yargs'),
	watch = require('gulp-watch'),
	spawn = require('child_process'),
	jsonTransform = require('gulp-json-transform'),
	del = require('del'),
	vinylPaths = require('vinyl-paths'),
	lib = require('./lib');

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

const areWeRunningGulped = (cb) => {
	if(process.title == 'gulp') {
		gulp.task('default', () => {
			cb();
		});
	} else {
		cb();
	}
}

const spawnChildTask = (args) => {
	const command = `node`;
	args.unshift('gulpfile.js');
	lib.log(`Running command ${command} ${args.join(' ')}`);
	spawn.spawn(command, args)
		.on("error", (error) => { console.log(`ERROR:`, error); })
		.on("data", (data) => { console.log("DATA: ", data); })
		.on("end", (msg) => { console.log("Ended: ", msg); });
};

const transformToProcessArgs = (data, file) => {
	lib.log(`processing file (${file.path})`);
	let args = [];
	data.noPrompt = true;
	Object.keys(data).forEach(key => {
		let val = data[key];
		args.push(`--${key}=${val}`);
	});

	spawnChildTask(args);

	return args;
};

gulp.task(`watchJobs`, () => {
	return watch('jobs/*.json', { ignoreInitial: true })
		.pipe(jsonTransform(transformToProcessArgs))
		.pipe(vinylPaths(del))
		.pipe(gulp.dest('jobs/archived'));
});

if(yargs.argv.watchJobs) {
	areWeRunningGulped(() => {
		lib.runTask('watchJobs');
	});
} else if(yargs.argv.qType) {
	console.log('!-- automated build --!')
	areWeRunningGulped(() => {
		lib.runTask(yargs.argv.qType);
	});
} else {
	areWeRunningGulped(() => {
		initialPrompt();
	});
}
