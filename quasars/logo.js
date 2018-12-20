const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	DTQuasarTask = require(path.resolve(`${__dirname}/../src/dt-task.js`));

// console.log('required');

const qType = path.basename(__filename).split('.')[0];
const oTypes = [
	qType,
	'river-post-logo-placement',
	'single-post-logo-placement',
	'sponsored-page-logo-placement',
	'product-guide-logo-placement',
];
const purpose = `
			builds out a single html page from a set of singular assets: css, html, js 
			with options to import files from an archived source
		`;

class LogoQuasar extends DTQuasarTask {
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
					desktopLogo: 'desktop',
					mobileLogo: 'mobile',
				},
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return super
			.build()
			.then(function () {
				return quasarSDK.injectCode(this.quasArgs);
			}.bind(this))
			.then(function () {
				return quasarSDK.outputToHtmlFile(this.quasArgs);
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.uploadOutputFiles(this.quasArgs);
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
				message: `Select the source image for the ${qType}`,
				choices: ['none'].concat(
					quasarSDK.getAvailableSourceFilenames(this.quasArgs)
				)
			}];

			let optionalArgs = [{
					type: 'input',
					name: 'clickUrl',
					shortMessage: 'Click URL',
					message: `Enter the click URL`,
					default: '',
				},
				{
					type: 'input',
					name: 'targetSelector',
					shortMessage: 'Target Selector',
					message: `Enter selector for where to place the logo`,
					default: '',
				},
				{
					type: 'input',
					name: 'insertAfterTargetSelector',
					shortMessage: 'Insert After Target Selector',
					message: `Enter selector for the item to place the logo after`,
					default: '',
				},
				{
					type: 'input',
					name: 'imageClass',
					shortMessage: 'Image Class',
					message: `Enter the image class`,
					default: 'dt-sponsored-image',
				}, {
					type: 'input',
					name: 'impressionTracker',
					shortMessage: 'Impression Tracker',
					message: `Enter the impression tracker URL`,
					default: '!! PASTE IMPRESSION TRACKER URL HERE !!',
				},
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

	validateRequiredArgs(args = {}) {
		return super
			.validateRequiredArgs(args)
			.then(
				function () {
					this.quasArgs.country =
						this.quasArgs.country == 'All' ? '' : this.quasArgs.country;
					switch (this.quasArgs.oType) {
						case 'logo':
							this.quasArgs.targetSelector = this.quasArgs.targetSelector.length ?
								this.quasArgs.targetSelector :
								'div[class*="m-title-block"]';
							this.quasArgs.insertAfterTargetSelector = this.quasArgs
								.insertAfterTargetSelector.length ?
								this.quasArgs.insertAfterTargetSelector :
								'.title';
							break;

						case 'single-post-logo-placement':
							this.quasArgs.targetSelector = this.quasArgs.targetSelector.length ?
								this.quasArgs.targetSelector :
								'.m-stardust-title-block';
							this.quasArgs.insertAfterTargetSelector = this.quasArgs
								.insertAfterTargetSelector.length ?
								this.quasArgs.insertAfterTargetSelector :
								'.m-stardust-title-block--title';
							break;

						case 'product-guide-logo-placement':
							this.quasArgs.sourceFileRegexMaps = {
								desktopLogo: 'desktop',
								mobileLogo: 'mobile',
								navLogo: 'nav',
							};
							this.quasArgs.targetSelector = this.quasArgs.targetSelector.length ?
								this.quasArgs.targetSelector :
								'.m-pg-header-title';
							this.quasArgs.insertAfterTargetSelector = this.quasArgs
								.insertAfterTargetSelector.length ?
								this.quasArgs.insertAfterTargetSelector :
								'.m-pg-header-title .title';
							break;

						default:
						case 'sponsored-page-logo-placement':
							this.quasArgs.targetSelector = this.quasArgs.targetSelector.length ?
								this.quasArgs.targetSelector :
								'.m-branding';
							this.quasArgs.insertAfterTargetSelector = this.quasArgs
								.insertAfterTargetSelector.length ?
								this.quasArgs.insertAfterTargetSelector :
								'.m-branding--topic-title';
							break;
					}
				}.bind(this)
			)
			.catch(
				function (e) {
					quasarSDK.logCritical(`${this.qType} validation error:`, e);
					throw e;
				}.bind(this)
			);
	}
}

module.exports = LogoQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
