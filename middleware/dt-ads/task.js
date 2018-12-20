/**
 * @file dt-task.js
 * @author Ken Eucker <keneucker@gmail.com>
 */

// TODO: this is needs to be less hardcoded
const QuasarSDK = require('@digitaltrends/quasar') || require(`${__dirname}/../../src/quasar.js`);

/**
 * @classdesc A quasar task with Digital Trends specific business logic
 * @export
 * @hideconstructor
 * @class DTQuasarTask
 * @example
	const newTask = new DTQuasarTask();
 * @extends {QuasarTask}
 */
class DTQuasarTask extends QuasarSDK.QuasarTask {
	constructor(
		qType,
		oTypes,
		purpose,
		_config,
		applicationRoot,
		additionalArgs = {},
		registerBuildTasks = true,
	) {
		super(
			qType,
			oTypes,
			purpose,
			_config,
			applicationRoot,
			additionalArgs,
			registerBuildTasks,
		);
	}

	/**
	 * @description returns a list of default prompts for a quasar.
	 * @returns {array} list of default prompts
	 * @memberof DTQuasarTask
	 */
	getDefaultQuasarQuestions(quasArgs) {
		return [{
			type: "input",
			name: "client",
			shortMessage: "Client",
			message: "Enter the name of the client to be used in building assets:",
			required: true,
			default: "",
			validate: quasarSDK.makePromptRequiredAndSanitary()
		}, {
			type: "input",
			name: "campaign",
			shortMessage: "Campaign",
			message: "Enter the name of the campaign to be used when compiling quasars:",
			required: true,
			default: "",
			validate: quasarSDK.makePromptRequiredAndSanitary()
		}, {
			type: "input",
			name: "id",
			optional: false,
			required: true,
			default: "",
			shortMessage: "Unique Identifier",
			message: `enter the id of the quasar which will be used across platforms`
		}, {
			type: "confirm",
			name: "askOptionalQuestions",
			shortMessage: "Advanced Settings?",
			message: "Show additional settings?",
			required: false,
			default: false
		}, {
			type: "list",
			name: "oType",
			shortMessage: "Output Type",
			optional: true,
			required: false,
			choices: this.oTypes.map(oType => oType.name),
			default: this.oTypes[0].name,
			message: "Enter the name of the signature to be used when compiling quasars:",
			validate: quasarSDK.makePromptRequiredAndSanitary()
		}, {
			type: "input",
			name: "destination",
			shortMessage: "Destination URL",
			optional: true,
			required: false,
			default: "",
			message: "Enter the destination URL:"
		}, {
			type: 'confirm',
			name: 'uploadToS3',
			shortMessage: 'Upload To S3?',
			message: `Upload assets to S3?`,
			optional: true,
			required: false,
			default: false,
		}, {
			type: 'confirm',
			name: 'uploadOutputFileAsTxtFile',
			shortMessage: 'Upload Output To Dropbox?',
			message: `Upload Output To Dropbox?`,
			optional: true,
			required: false,
			default: false,
		}, {
			type: "checkbox",
			name: "debris",
			shortMessage: "Debris To Include",
			optional: true,
			required: false,
			choices: [].concat(
				quasarSDK.getAvailableDebrisFilenames(this.quasArgs)
			),
			default: [],
			message: "Select the debris to include when compiling quasars:"
		}];
	}

	/**
	 * @description sets digital trends specific quasArgs data.
	 * @param {QuasArgs} [args={}]
	 * @memberof DTQuasarTask
	 */
	resolveQuasArgs(args = {}) {
		this.quasArgs = Object.assign(this.quasArgs, args);
		this.quasArgs.domain = this.quasArgs.client =
			this.quasArgs.client || this.quasArgs.domain;
		this.quasArgs.signature = this.quasArgs.campaign =
			this.quasArgs.campaign || this.quasArgs.signature;
		this.quasArgs.oType =
			this.quasArgs.adType || this.quasArgs.oType || this.quasArgs.qType;
		this.quasArgs.adType = this.quasArgs.oType;

		this.quasArgs.bucket = "dtcn";
		this.quasArgs.cdnUrlStart = "https://cdn.dtcn.com/";

		const datetime = new Date(Date.now());
		this.quasArgs.bucketPath = `ads/${
      this.quasArgs.client
    }/${datetime.getFullYear()}/${datetime.getMonth() + 1}/${
      this.quasArgs.campaign
    }`;
	}

	/**
	 * @description downloads source files, sets defaults from form args, and copies files to the assets folder
	 * @param {QuasArgs} [args={}]
	 * @returns {Promise} resolves to true if validation is successful
	 * @memberof DTQuasarTask
	 */
	validateRequiredArgs(args = {}) {
		return new Promise(
				function (resolve) {
					this.resolveQuasArgs(args);
					resolve(this.quasArgs);
				}.bind(this)
			)
			.then(
				function () {
					return quasarSDK.downloadSourceFilesToSourcesFolder(this.quasArgs);
				}.bind(this)
			)
			.then(
				function () {
					this.setSourceAndOutputPlusArgs(this.quasArgs);
					return quasarSDK.copyTemplateFilesToAssetsPath(this.quasArgs);
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
				}.bind(this)
			)
			.catch(
				function (e) {
					quasarSDK.logCritical(`DT task validation error:`, e);
					throw e;
				}.bind(this)
			);
	}
}

module.exports = DTQuasarTask;
