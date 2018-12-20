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
class SkinQuasar extends DTQuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				sourceExt: '.zip',
				debris: ['satellite.js'],
				sourceFileRegexMaps: {
					leftImage: 'left',
					rightImage: 'right',
				},
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return super
			.build()
			.then(
				function () {
					return quasarSDK.injectCode(this.quasArgs);
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
					return quasarSDK.outputToHtmlFile(this.quasArgs);
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
					return quasarSDK.uploadOutputFiles(this.quasArgs, ['*.txt']);
				}.bind(this)
			)
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
				message: `Select the source image for the skins ('left-' and 'right-')`,
				choices: ['none'].concat(
					quasarSDK.getAvailableSourceFilenames(this.quasArgs)
				)
			}];

			let optionalArgs = [{
					type: 'input',
					name: 'backgroundColor',
					shortMessage: 'Background Color',
					message: 'background color',
					default: 'transparent',
				},
				{
					type: 'input',
					name: 'clickUrl',
					shortMessage: 'Click URL',
					message: `Enter the click URL`,
					default: '!! PASTE CLICK URL HERE !!'
				},
				{
					type: 'input',
					name: 'impressionTracker',
					shortMessage: 'Impression Tracker',
					message: `Enter the impression tracker URL`,
					default: '!! PASTE IMPRESSION TRACKER URL HERE !!'
				},
				{
					type: 'confirm',
					name: 'preload',
					shortMessage: 'Preload Skins?',
					message: `Preload the skins?`,
					default: true
				}
			];
			requiredArgs = requiredArgs.concat(
				this.getDefaultQuasarQuestions(this.quasArgs)
			);

			if (!separated) {
				return requiredArgs.concat(optionalArgs);
			}
			return {
				requiredArgs,
				optionalArgs
			};
		}

		return super.getQuasarPrompts(separated);
	}
}

module.exports = SkinQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
