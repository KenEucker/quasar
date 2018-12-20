const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	DTQuasarTask = require(path.resolve(`${__dirname}/../src/dt-task.js`));

// console.log('required');

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType];
const purpose = `
	Builds a sponsored river post and inserts it onto the page in the river.
	`;
class RiverQuasar extends DTQuasarTask {
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
					logoImage: 'logo',
					thumbnailImage: 'thumb',
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
				function () {
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
				message: `select the source image for the thumbnail of the post`,
				choices: ['none'].concat(
					quasarSDK.getAvailableSourceFilenames(this.quasArgs)
				)
			}];

			let optionalArgs = [{
					type: 'list',
					name: 'country',
					shortMessage: 'Country',
					message: `Enter the country code to restrict to`,
					choices: ['All', 'US', 'CA'],
					default: 'All'
				},
				{
					type: 'input',
					name: 'permalink',
					shortMessage: 'Post Link',
					message: 'Enter the permalink of the post'
				},
				{
					type: 'input',
					name: 'title',
					shortMessage: 'Title',
					message: `Enter the post title`,
					default: ''
				},
				{
					type: 'input',
					name: 'content',
					shortMessage: 'Content',
					message: `Enter the content description for the post`,
					default: ''
				},
				{
					type: 'input',
					name: 'logoClickUrl',
					shortMessage: 'Logo Click URL',
					message: `Enter the logo click url`
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
					this.quasArgs.wrapInHtmlTags = false;
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

module.exports = RiverQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
