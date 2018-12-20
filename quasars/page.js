const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	QuasarTask = require(path.resolve(`${__dirname}/../src/task.js`));

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType];
const purpose = `
	builds out a single html page from a set of singular assets: css, html, js 
	with options to import files from an archived source
	`;

class PageQuasar extends QuasarTask {
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

	build() {
		return super
			.build()
			.then(
				function () {
					quasarSDK.logInfo('injecting assets!');
					return quasarSDK.injectCode(this.quasArgs);
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
					quasarSDK.logInfo('moving files!');
					return quasarSDK.copyFilesFromAssetsFolderToOutput(this.quasArgs, ['**']);
				}.bind(this)
			)
			.then(
				function () {
					quasarSDK.logInfo('output!');
					return quasarSDK.outputToHtmlFile(this.quasArgs);
				}.bind(this)
			);
	}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			this.setConfig(config);

			let requiredArgs = [{
				type: 'list',
				name: 'source',
				shortMessage: 'Source',
				widget: 'file',
				message: `Enter the source filename (default .zip)`,
				choices: ['none'].concat(quasarSDK.getAvailableSourceFilenames(this.quasArgs)),
			}];

			let optionalArgs = [{
				type: 'input',
				name: 'body',
				shortMessage: 'Body Text',
				message: 'Enter the body text',
				default: '',
			}];
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
}

module.exports = PageQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
