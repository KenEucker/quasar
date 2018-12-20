const express = require('express'),
	path = require('path'),
	lib = require('./lib'),
	os = require('os'),
	bodyParser = require('body-parser'),
	jsonPromise = require('express-json-promise');

class Api {

	constructor() {
		this.port = process.env.port || '3720'
		this._app = null
		this.jobsDirectory = `${os.homedir()}/jobs/created`;
		this.sourcesDirectory = `${os.homedir()}/sources/`;
		this.availableTasks = lib.getTaskNames(path.resolve('./tasks/'));

		if (yargs.argv.runWebApiStandalone) {
			lib.debug(`will run the api standalone on port [${yargs.argv.apiPort}]`);
			this.run(null, yargs.argv.apiPort, true);
		}
	}

	get app() {
		return this._app;
	}

	autoReloadingPageWithMessage(message = `Loading ...`) {
		return `
			<html>
				<body>
					<h1>
						${message}
					</h1>

					<script>
					setInterval(function() {
						var h1 = document.querySelector('h1');
						if(h1) {
							h1.innerHTML += '.';
						}
					}, 300)
					setInterval(function() {
						window.location.reload(true);
					}, 1200)
					</script>
				</body>
			</html>
		`;
	}

	createJobFile(args, job, jobFile) {
		return new Promise((resolve, reject) => {
			const jobsDirectory = `${lib.getConfig().jobsFolder}/created`;
			const sourcesDirectory = lib.getConfig().sourceFolder;
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
			while (!(fs.existsSync(jobFile.replace(lib.STATUS_CREATED, lib.STATUS_QUEUED)))) {

			}
			return resolve({ status: lib.STATUS_CREATED, job, jobFile });
		});
	}

	sendJobFileCompleted(job, jobFile) {
		return new Promise((resolve, reject) => {
			while (!(fs.existsSync(jobFile.replace(lib.STATUS_QUEUED, lib.STATUS_COMPLETED)))) {

			}
			return resolve({ status: lib.STATUS_COMPLETED, job, jobFile });
		});
	}

	getJob(req, res) {
		const jobId = req.params.id;
		const jobStatus = this.getJobStatus(jobId);
		const jobFilePath = `${lib.getConfig().jobsFolder}/${jobStatus}/${jobId}.json`;

		switch (jobStatus) {
			default:
				res.send();
				break;

			case `created`:
			case `queued`:
				res.send(this.autoReloadingPageWithMessage(`Job has been ${jobStatus} ...`));
				break;

			case `completed`:
				const argsFile = fs.readFileSync(jobFilePath);
				const jobArgs = JSON.parse(argsFile);
				if (fs.existsSync(jobArgs.outputFilePath)) {
					res.sendFile(jobArgs.outputFilePath);
				} else {
					console.log(`outputFilePath not found: ${jobArgs.outputFilePath}`);
					res.send(jobArgs);
				}
				break;
		}
	}

	getJobStatus(jobId) {
		const jobFilePath = `${lib.getConfig().jobsFolder}/completed/${jobId}.json`;

		if (fs.existsSync(jobFilePath)) {
			return `completed`;
		} else if (fs.existsSync(jobFilePath.replace('/completed', '/created'))) {
			return `created`;
		} else if (fs.existsSync(jobFilePath.replace('/completed', '/queued'))) {
			return `queued`;
		}
		return null;
	}

	onTaskDataReceived(req, res) {
		const data = req.body;
		const job = `${data.qType}_${Date.now()}`;
		const jobsDirectory = `${lib.findOutputDirectory(path.resolve(__dirname))}/created`;
		const jobFile = `${jobsDirectory}/${job}.json`;

		lib.logInfo(`creating job (${job}) from build arguments received:`);
		return res.json(this.createJobFile(data, job, jobFile));
	}

	run(app = null, port = null, start = false) {
		const self = this;
		if (!app) {
			app = express();
			// lib.debug('will create the app in api.js');
			start = true;
		}
		this.port = port || this.port;
		this._app = app;

		mkdir(this.sourcesDirectory);
		mkdir(this.jobsDirectory);

		this._app.use(bodyParser.json({ limit: '50mb' }));
		this._app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
		this._app.use(jsonPromise());


		this._app.get('/job/:id',
			function (req, res) { self.getJob(req, res); });
		this._app.post('/',
			function (req, res) { self.onTaskDataReceived(req, res); });

		if (start) {
			this._app.listen(this.port);
			lib.debug('did start the app in api.js');
		}

		lib.logSuccess(`quasar api running on port:${this.port} at http://localhost:${this.port}`);
	}

}
module.exports = new Api();
