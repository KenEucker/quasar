const path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	HypeQuasar = require(path.resolve(`${__dirname}/hype.js`));

// console.log('required');
const qType = path.basename(__filename).split(".")[0];
const oTypes = [qType];
const purpose = `
builds out a single html page from a set of singular assets: css, html, js
with options to import files from an archived source
`;

class HypeShortcodeQuasar extends HypeQuasar {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			config,
			applicationRoot, {
				excludeOutputFileFromUpload: true,
				oTypes: [{
					name: "hype-shortcode",
					qType: qType
				}],
				...args,
			},
			registerBuildTasks,
			qType);
	}

	getQuasarPrompts(config = null, separated = true) {
		if (!this.quasArgs.requiredArgs.length) {
			const promptArgs = super.getQuasarPrompts(config, true);
			const requiredArgs = [];
			const excludeArgs = ['uploadOutputFileAsTxtFile', 'debris', 'destination', 'oType', 'clickTarget', 'target'];

			const optionalArgs = [{
				type: 'input',
				name: 'aspect',
				shortMessage: 'Aspect Ratio',
				message: `Enter aspect ratio as a float (default 1.778 which is 16:9)`,
				default: '1.778'
			}];

			promptArgs.requiredArgs.forEach(arg => {
				if (excludeArgs.indexOf(arg.name) === -1) {
					requiredArgs.push(arg);
				}
			});

			promptArgs.optionalArgs.forEach(arg => {
				if (excludeArgs.indexOf(arg.name) === -1) {
					optionalArgs.push(arg);
				}
			});

			if (!separated) {
				return requiredArgs.concat(optionalArgs);
			}
			return {
				requiredArgs: requiredArgs,
				optionalArgs: optionalArgs,
			};
		}

		return super.getQuasarPrompts(config, separated);
	}

	build() {
		return quasarSDK
			.unpackSourceFiles(this.quasArgs)
			.then(
				function () {
					return quasarSDK.moveTargetFilesToRootOfAssetsPath(this.quasArgs);
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
					quasarSDK.copyFilesFromAssetsFolderToOutput(this.quasArgs, ["**"]);
				}.bind(this)
			)
			.then(
				function () {
					return quasarSDK.uploadOutputFiles(this.quasArgs);
				}.bind(this)
			)
			.then(
				function () {
					var htmlFilename = this.quasArgs.targetFilePath.split("/").pop();
					this.quasArgs.url = `${this.quasArgs.cdnUrlStart}${
            this.quasArgs.bucketPath
          }/${htmlFilename}`;
					this.quasArgs.targetFilePath = `${
            this.quasArgs.templatesFolder
          }/${qType}.txt`;
					return quasarSDK.outputToTextFile(this.quasArgs);
				}.bind(this)
			);
	}
}

module.exports = HypeShortcodeQuasar;
module.exports.qType = qType;
module.exports.oTypes = oTypes;
module.exports.purpose = purpose;
