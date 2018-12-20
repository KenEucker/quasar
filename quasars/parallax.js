const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	DTQuasarTask = require(path.resolve(`${__dirname}/../src/dt-task.js`));

// console.log('required');

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType];
const purpose = `
	builds out a single html page from a set of singular assets: css, html, js 
	with options to import files from an archived source
	`;
class Parallax extends DTQuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				sourceExt: '.jpg',
				debris: ['satellite.js'],
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return super.build()
			.then(function () {
				return quasarSDK.injectCode(this.quasArgs)
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.outputToHtmlFile(this.quasArgs);
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.uploadOutputFiles(this.quasArgs, ['*.txt']);
			}.bind(this))
			.catch(this.error.bind(this));
	}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			this.setConfig(config);

			let requiredArgs = [{
				type: 'list',
				name: 'source',
				shortMessage: 'Source',
				widget: 'file',
				message: `Select the source image for the movie poster`,
				choices: ['none'].concat(quasarSDK.getAvailableSourceFilenames(this.quasArgs)),
			}];

			let optionalArgs = [{
				type: 'input',
				name: 'imageName',
				shortMessage: 'Image Name',
				message: `enter the name of the source image (default extention .jpg)`,
			}, {
				type: 'input',
				name: 'clickUrl',
				shortMessage: 'Click URL',
				message: `Enter the click URL`,
				default: '!! PASTE CLICK URL HERE !!',
			}, {
				type: 'input',
				name: 'scrollTarget',
				shortMessage: 'Scroll target javascript',
				message: 'Enter the scroll target javascript:',
				default: `_win.document.querySelectorAll('.m-pg-slot')[5]`,
			}, {
				type: 'input',
				name: 'impressionTracker',
				shortMessage: 'Impression Tracker',
				message: `Enter the impression tracker URL`,
				default: '!! PASTE IMPRESSION TRACKER URL HERE !!',
			}];
			requiredArgs = requiredArgs.concat(this.getDefaultQuasarQuestions(this.quasArgs));

			if (!separated) {
				return requiredArgs.concat(optionalArgs);
			}
			return {
				requiredArgs,
				optionalArgs,
			};
		}

		return super.getQuasarPrompts(separated);
	}

	validateRequiredArgs(args = {}) {
		return super.validateRequiredArgs(args)
			.then(function () {
				if (!(this.quasArgs.imageName && this.quasArgs.imageName.length)) {
					this.quasArgs.imageName = `${this.quasArgs.source}${this.quasArgs.sourceExt}`;
				} else {
					const split1 = this.quasArgs.imageName.split('.');
					if (split1.length < 2) {
						this.quasArgs.imageName = `${this.quasArgs.imageName}${this.quasArgs.sourceExt}`;
					}
				}
				this.quasArgs.imageUrl = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${this.quasArgs.imageName}`;
			}.bind(this))
			.catch(function (e) {
				quasarSDK.logCritical(`${this.qType} validation error:`, e);
				throw e;
			}.bind(this));
	};
}

module.exports = Parallax;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
