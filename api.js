const express = require('express'),
	path = require('path'),
	lib = require('./lib'),
	bodyParser = require('body-parser'),
	jsonPromise = require('express-json-promise');

class Api {

	constructor() {
		this.port = process.env.port || '3720'
		this._app = null
		this.jobsDirectory = path.resolve(`${process.cwd()}/jobs/created`)
		this.sourcesDirectory = path.resolve(`${process.cwd()}/sources/`)
		this.availableTasks = lib.getTaskNames(path.resolve('./tasks/'));

		if (yargs.argv.runApiStandalone) {
			// console.log('running the api standalone');
			this.run(null, yargs.argv.apiPort, true);
		}
		// throw 'constructed API';
	}

	get app() {
		return this._app;
	}

	createJobFile(args, job, jobFile) {
		return new Promise((resolve, reject) => {
			const jobsDirectory = `${lib.findOutputDirectory(path.resolve(__dirname))}/created`;
			const sourcesDirectory = path.resolve(`${process.cwd()}/sources/`);
			const job = `${args.qType}_${Date.now()}`;
			const jobFile = `${jobsDirectory}/${job}.json`;

			if (args.source && args.source.length) {
				let removeUntil = args.source.indexOf(',');
				removeUntil = removeUntil > 0 ? removeUntil + 1 : removeUntil;

				let sourceExt = `.zip`;
				// TODO: WTF THIS HACK?!
				let name = args.source.substr(0, removeUntil - 1).split('name=').pop().split(';');
				let split = name[0].split('.');
				sourceExt = split.length > 1 ? `.${split.pop()}` : sourceExt;
				name = split.join('.');

				const base64 = args.source.substr(removeUntil);
				const sourceFile = `${sourcesDirectory}/${name}`;

				fs.writeFileSync(`${sourceFile}${sourceExt}`, base64, 'base64');
				args.source = name;
				args.sourceExt = sourceExt;
			}
			fs.writeFileSync(jobFile, JSON.stringify(args));

			return resolve({ status: lib.STATUS_CREATED, job, jobFile });
		});
	}

	sendJobFileQueued(job, jobFile) {
		return new Promise((resolve, reject) => {
			// while ( !(fs.existsSync(jobFile.replace(lib.STATUS_CREATED, lib.STATUS_QUEUED)))) {

			// }
			return resolve({ status: lib.STATUS_CREATED, job, jobFile });
		});
	}

	sendJobFileCompleted(job, jobFile) {
		return new Promise((resolve, reject) => {
			// while ( !(fs.existsSync(jobFile.replace(lib.STATUS_QUEUED, lib.STATUS_COMPLETED)))) {

			// }
			return resolve({ status: lib.STATUS_COMPLETED, job, jobFile });
		});
	}

	onCheckJobFile() {

	}

	onTaskDataReceived(req, res) {
		const data = req.body;
		const job = `${data.qType}_${Date.now()}`;
		const jobsDirectory = `${lib.findOutputDirectory(path.resolve(__dirname))}/created`;
		const jobFile = `${jobsDirectory}/${job}.json`;

		lib.logInfo(`creating job (${job}) from build arguments received:`);
		return res.json(this.createJobFile(data, job, jobFile));
		res.json(this.sendJobFileQueued(job, jobFile));
		res.json(this.sendJobFileCompleted(job, jobFile));

		return;
	}

	run(app = null, port = null, start = false) {
		const self = this;
		// throw 'API run';
		if (!app) {
			app = express();
			// console.log('creating the app in api.js');
			start = true;
		}
		this.port = port || this.port;
		this._app = app;

		mkdir(this.sourcesDirectory);
		mkdir(this.jobsDirectory);

		this._app.use(bodyParser.json({ limit: '50mb' }));
		this._app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

		this._app.use(jsonPromise());

		this._app.post('/', function (req, res) { self.onTaskDataReceived(req, res); });

		if (start) {
			this._app.listen(this.port);
			// console.log('starting the app in api.js');
		}

		lib.logSuccess(`quasar api running on port:${this.port} at http://localhost:${this.port}`);
	}

}
module.exports = new Api();