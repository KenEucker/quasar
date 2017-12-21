const express = require('express'),
	path = require('path'),
	lib = require('./lib'),
	bodyParser = require('body-parser'),
	jsonPromise = require('express-json-promise');

class Api {

	constructor() {
		this.port = process.env.port || '3720'
		this.app = null
		this.jobsDirectory = path.resolve(`${process.cwd()}/jobs/queued`)
		this.sourcesDirectory = path.resolve(`${process.cwd()}/sources/`)
		this.availableTasks = lib.getTaskNames(path.resolve('./tasks/'));

		if (yargs.argv.runApiStandalone) {
			// console.log('running the api standalone');
			run(null, yargs.argv.apiPort, true);
		}
	}

	onTaskDataReceived(req, res) {
		let jsonp = new Promise((resolve, reject) => {
			let data = req.body;
			const jobsDirectory = `${lib.findOutputDirectory(path.resolve(__dirname))}/queued`;
			const sourcesDirectory = path.resolve(`${process.cwd()}/sources/`);
			const job = `${data.qType}_${Date.now()}`;
			const jobFile = `${jobsDirectory}/${job}.json`;

			if (data.source && data.source.length) {
				let removeUntil = data.source.indexOf(',');
				removeUntil = removeUntil > 0 ? removeUntil + 1 : removeUntil;

				const sourceExt = `.zip`;
				// TODO: WTF THIS HACK?!
				let name = data.source.substr(0, removeUntil - 1).split('name=').pop().split(';');
				name = name[0].replace('.zip', '');

				const base64 = data.source.substr(removeUntil);
				const sourceFile = `${sourcesDirectory}/${name}`;

				fs.writeFileSync(`${sourceFile}${sourceExt}`, base64, 'base64');
				data.source = name;
				data.sourceExt = sourceExt;
				// console.log(`storing args in ${jobsDirectory} for quasar loading and saving source to ${sourcesDirectory}/${sourceFile}${sourceExt}`);
			}
			fs.writeFileSync(jobFile, JSON.stringify(data));

			return resolve({ job, jobFile });
		});
		return res.json(jsonp);
	}

	run(app = null, port = null, start = false) {
		if (!app) {
			app = express();
			// console.log('creating the app in api.js');
			start = true;
		}
		this.port = port || this.port;
		this.app = app;

		mkdir(this.sourcesDirectory);
		mkdir(this.jobsDirectory);
		mkdir(this.jobsDirectory.replace('/queued', '/completed'));

		this.app.use(bodyParser.json({ limit: '50mb' }));
		this.app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

		this.app.use(jsonPromise());

		this.app.post('/', this.onTaskDataReceived);

		if (start) {
			this.app.listen(this.port);
			// console.log('starting the app in api.js');
		}

		lib.logSuccess(`quasar api running on port:${this.port} at http://localhost:${this.port}`);
	}

}
module.exports = new Api();