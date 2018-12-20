const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	QuasarTask = require(path.resolve(`${__dirname}/../src/task.js`));

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType, 'html-loader'];
const purpose = `
	builds out a single html page from a set of singular assets: css, html, js 
	with options to import files from an archived source
	`;

class QuasarLoaderQuasar extends QuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				outputExt: '.html',
				...args,
			},
			registerBuildTasks);
	}

	build() {}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			this.setConfig(config);

			let requiredArgs = [{
				type: 'list',
				name: 'source',
				shortMessage: 'Source',
				widget: 'file',
				message: `Enter the source URL to load`,
				choices: ['none'].concat(quasarSDK.getAvailableSourceFilenames(this.quasArgs)),
			}];

			let optionalArgs = [];
			requiredArgs = requiredArgs.concat(
				this.getDefaultQuasarQuestions(this.quasArgs)
			);

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
		return new Promise(
			function (resolve) {
				resolve();
			}.bind(this)
		).catch(
			function (e) {
				quasarSDK.logCritical(`${this.qType} validation error:`, e);
				throw e;
			}.bind(this)
		);
	}
}

module.exports = QuasarLoaderQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
