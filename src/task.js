/**
 * @file task.js
 * @author Ken Eucker <keneucker@gmail.com>
 */

const admZip = require('adm-zip'),
	gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	os = require('os'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	QuasArgs = require(path.resolve(`${__dirname}/quasargs.js`)),
	yargs = require('yargs');

/**
 * @export
 * @class QuasarTask
 * @classdesc A task that can be run by the quasar runtime API.
 * @summary This class can be extended to create custom quasars as shown in the example.
 * @hideconstructor
 * @example
	class CustomQuasarTask extends QuasarTask {
	constructor(qType, oTypes, purpose, _config, applicationRoot) {
		super(qType, oTypes, purpose, _config, applicationRoot);
	}
	...
	getDefaultQuasarQuestions(quasArgs) {
		return [{
				type: 'input',
				name: 'customField',
				shortMessage: 'Custom Field',
				message: 'Enter the custom field string:',
				default: '',
			},
		];
	}
	...
	validateRequiredArgs(args = {}) {
		// do the default behavior, then...
		return super
			.validateRequiredArgs(args)
			.then(function () {
				// download source files
				return quasarSDK.downloadSourceFilesToSourcesFolder(this.quasArgs);
			}.bind(this))
			.then(function () {
				// do some other stuff
			}.bind(this))
			.catch(function (e) {
				// catch your errors
				quasarSDK.logCritical(`task validation error:`, e);
				throw e;
			}.bind(this));
	}
		...
}
 *
 */
class QuasarTask {
	constructor(qType, oTypes, purpose, _config, applicationRoot, additionalArgs = {}, registerBuildTasks = true) {
		this.setConfig(_config, applicationRoot);

		this.qType = qType;
		this.quasArgs = {};
		this.oTypes = [];
		this.purpose = purpose || `
			builds a quasar, a cosmic component of a galaxy that is your application
		`;

		if (Array.isArray(oTypes) && typeof oTypes[0] === 'object') {
			this.oTypes = oTypes;
		} else if (Array.isArray(oTypes)) {
			oTypes.map(function (oTypeName) {
				this.oTypes.push({
					name: oTypeName,
					qType: qType
				});
			}.bind(this));
		} else {
			this.oTypes = [{
				name: this.qType,
				qType: this.qType
			},];
		}

		this.setDefaultQuasArgs(qType, additionalArgs);

		const prompts = this.getQuasarPrompts(this.config);
		this.registerRequiredQuasArgs(prompts.requiredArgs, prompts.optionalArgs);

		if (registerBuildTasks) {
			this.registerTasks();
		}
	}

	/**
	 * @description Builds the quasar into a single outputFile.
	 * @returns {Promise} the build Promise chane
	 * @memberof QuasarTask
	 */
	build() {
		return quasarSDK.copyFilesFromSourcesFolderToOutput(this.quasArgs)
			.catch(this.error.bind(this));
	}

	/**
	 * @description deletes the assets folder and any other temporary build files
	 * @memberof QuasarTask
	 */
	cleanUp() {
		if (this.quasArgs.useJobTimestampForBuild && !this.quasArgs.debugAssetsFolder) {
			quasarSDK.logInfo(`cleaning up after job: ${this.quasArgs.jobTimestamp}`);
			quasarSDK.debug(`did clean up assets folder: ${this.quasArgs.assetsFolder}`);
			return quasarSDK.cleanAssetsFolder(this.quasArgs);
		}
	}

	/**
	 * @description logs an error with the task, this method is used for error handling of the quasar
	 * @memberof QuasarTask
	 */
	error(e) {
		quasarSDK.logError('quasar build error', e);

		return Promise.resolve();
	}

	/**
	 * @description returns a list of default prompts for a quasar.
	 * @returns {array} list of default prompts
	 * @memberof QuasarTask
	 */
	getDefaultQuasarQuestions() {
		return [{
			type: 'input',
			name: 'domain',
			shortMessage: 'Domain',
			message: 'Enter the name of the domain to be used in building assets:',
			required: true,
			/// TODO: WASH, VALIDATE, AND SANITIZE
			// Wash the value always before editing using the washRegex
			// if validateRegex is set then fail to allow value submission of field unless validation passes
			// if sanitizeRegex is set then sanitize the value on input
			// if both validateRegex and sanitizeRegex are set, validate the input first 
			// and then sanitize it ^ upon submission (buildtime)
			// This allows a question to be required, follow a minimal rule for the value, 
			// and finally ensure that the value is 
			washRegex: null, // regex to run against the value before editing
			validateRegex: null, // regex to validate the incoming value
			sanitizeRegex: null, // regex to run against the value after editing
			validate: quasarSDK.makePromptRequiredAndSanitary(),
		}, {
			type: 'input',
			name: 'signature',
			shortMessage: 'signature',
			message: 'Enter the name of the signature to be used when compiling quasars:',
			required: true,
			validate: quasarSDK.makePromptRequiredAndSanitary(),
		}, {
			type: 'confirm',
			name: 'askOptionalQuestions',
			shortMessage: 'Show additional settings?',
			message: 'Show additional settings?',
			required: false,
			default: false,
		}, {
			type: 'input',
			name: 'output',
			optional: true,
			required: false,
			shortMessage: 'Output Name',
			message: `Enter the output filename name (default extension .txt)`,
		}, {
			type: 'list',
			name: 'oType',
			shortMessage: 'Output Type',
			optional: true,
			required: false,
			choices: this.oTypes.map(oType => oType.name),
			default: this.oTypes[0].name,
			message: 'Select the name of the output type to be used:',
		}, {
			type: 'input',
			name: 'destination',
			shortMessage: 'Destination URL',
			optional: true,
			required: false,
			default: '',
			message: 'Enter the destination URL:',
		}, {
			type: 'checkbox',
			name: 'debris',
			shortMessage: 'Debris To Include',
			optional: true,
			required: false,
			choices: [].concat(quasarSDK.getAvailableDebrisFilenames(this.quasArgs)),
			default: this.quasArgs.debris,
			message: 'Select the debris to include when compiling quasars:',
		}];
	}

	/**
	 * @description retrieves the list of inquirer questions to ask the user 
	 * @see https://www.npmjs.com/package/inquirer#questions
	 * @returns {array} array of questions
	 * @memberof QuasarTask
	 */
	getQuasarPrompts(separated) {
		if (separated && this.quasArgs.requiredArgs.length) {
			const requiredArgs = [];
			const optionalArgs = [];
			this.quasArgs.requiredArgs.forEach(arg => {
				if (arg.require) {
					requiredArgs.push(arg);
				} else if (arg.optional) {
					optionalArgs.push(arg);
				}
			});

			return {
				requiredArgs,
				optionalArgs,
			};
		}

		return this.quasArgs.requiredArgs;
	}

	/**
	 * @description runs the post build process before cleanUp
	 * @memberof QuasarTask
	 */
	postBuild() {
		quasarSDK.debug('will postBuild');

		if (this.quasArgs.buildCompletedSuccessfully) {
			this.quasArgs = quasarSDK.logBuildCompleted(this.quasArgs);
			quasarSDK.logSuccess('build finished successfully');
		} else {
			this.quasArgs = quasarSDK.logBuildFailed(this.quasArgs);
			quasarSDK.logInfo('build finished unexpectedly');
		}

		return Promise.resolve();
	}

	/**
	 * @description prompts the user from the CLI to get the QuasArgs
	 * @returns {Promise} prompt Promise
	 * @memberof QuasarTask
	 */
	promptUser() {
		quasarSDK.debug(`will prompt the user from the console`, this.quasArgs.requiredArgs);

		quasarSDK.debug(JSON.stringify(this.quasArgs));

		return quasarSDK.promptConsole(this.quasArgs.requiredArgs, function (userResponse) {
			if (userResponse.askOptionalQuestions) {
				return quasarSDK.promptConsole(this.quasArgs.requiredArgs, function (res) {
					this.quasArgs = Object.assign(this.quasArgs, userResponse, res);
				}.bind(this), true);
			} else {
				this.quasArgs = Object.assign(this.quasArgs, userResponse);
			}
		}.bind(this));
	}

	/**
	 * @description adds required and optional defined arguments, and the defaults, within the quasArgs
	 * @summary This method expects that the second parameter `requiredArgs` is an array of objects with the same structure as inquirer's .prompt questions parameter
	 * @param {array} [requiredArgs=[]]
	 * @param {array} [optionalRequiredArgs=[]]
	 * @param {boolean} [clobber=true]
	 * @see https://www.npmjs.com/package/inquirer#questions
	 * @memberof QuasarTask
	 */
	registerRequiredQuasArgs(requiredArgs = [], optionalRequiredArgs = [], clobber = true) {
		if (clobber) {
			this.quasArgs.requiredArgs = [];
		}

		const setArgWithDefault = function (arg, quasArg, defaultRequired) {
			const argIsSet = (quasArg && quasArg.length) || (quasArg === false) || (quasArg === true);
			const defaultArg = argIsSet ? quasArg : arg.default;
			if (defaultRequired || arg.required != undefined) {
				arg.required = arg.required === false ? false : true;
			} else {
				arg.optional = true;
			}
			arg.default = defaultArg;

			return arg;
		};

		requiredArgs.forEach((arg) => {
			setArgWithDefault(arg, this.quasArgs[arg.name], true);
			this.quasArgs[arg.name] = arg.default;
			this.quasArgs.requiredArgs.push(arg);
		});

		optionalRequiredArgs.forEach((arg) => {
			setArgWithDefault(arg, this.quasArgs[arg.name]);
			this.quasArgs[arg.name] = arg.default;
			this.quasArgs.requiredArgs.push(arg);
		});

		// TODO: Reorder so the add optional question is at the end
	}

	/**
	 * @description register the build tasks for this quasar
	 * @memberof QuasarTask
	 */
	registerTasks() {
		quasarSDK.debug('will registerTasks', this.qType);

		gulp.task(`${this.qType}:build`, function () {
			try {
				if (!this.quasArgs.noPrompt) {
					return this.promptUser()
						.then(this.run.bind(this));
				} else {
					return this.run();
				}
			} catch (e) {
				console.log('task run error', e);
			}
		}.bind(this));
		gulp.task(this.qType, gulp.series(`${this.qType}:build`));
		quasarSDK.debug(`did register all tasks for quasar ${this.qType}`);
	}

	/**
	 * @description method for extended classes to do extra work for quasArgs after validation
	 * @param {QuasArgs} [args={}]
	 * @memberof QuasarTask
	 */
	resolveQuasArgs(args = {}) { }

	/**
	 * @description Runs the quasar through validation, build, then cleanup.
	 * @param {QuasArgs} [args={}]
	 * @returns {Promise}
	 * @memberof QuasarTask
	 */
	run(args = {}) {
		this.quasArgs = quasarSDK.logBuildQueued(this.quasArgs);

		return this.validateRequiredArgs(args)
			.then(this.build.bind(this))
			.then(this.postBuild.bind(this))
			.then(this.cleanUp.bind(this))
			.catch(this.error.bind(this));
	}

	/**
	 * @description sets the configuration values from the quasar runtime
	 * @param {QuasarConfig} _config
	 * @param {String} [applicationRoot=process.cwd()]
	 * @param {boolean} [force=false]
	 * @memberof QuasarTask
	 */
	setConfig(_config, applicationRoot, force = false) {
		applicationRoot = applicationRoot || (_config ? _config.applicationRoot : process.cwd());

		if (!this.config || (_config && force)) {
			if (_config && !force) {
				this.config = _config;
			} else {
				const QuasarConfig = require(`${applicationRoot}/src/config.js`);
				this.config = new QuasarConfig();
			}
		}
	}

	/**
	 * @description sets the default quasArgs including command line arguments in order of priority from: QuasArgs class, additionalArgs param, cliArgs, loaded from file
	 * @param {string} qType
	 * @param {object} [additionalArgs={}]
	 * @returns {QuasArgs}
	 * @memberof QuasarTask
	 */
	setDefaultQuasArgs(qType, additionalArgs = {}) {
		let fromFile = {},
			cliArgs = {},
			argsFile = yargs.argv.argsFile,
			argsFileExists = argsFile && fs.existsSync(argsFile),
			jobTimestamp = null,
			buildUser = os.hostname();

		// If the argsFile parameter is set and the file exists, load parameters from file
		if (argsFileExists) {
			const tempFile = fs.readFileSync(argsFile, 'utf8');
			fromFile = JSON.parse(tempFile);
			jobTimestamp = (argsFile.split('_').pop().split('.')[0]);
		}

		// HACK for falsey values in yargs and multi values
		Object.keys(yargs.argv).forEach((k) => {
			if (k) {
				const v = yargs.argv[k];
				let arg = Array.isArray(v) ? v[v.length - 1] : v;
				arg = arg == 'true' || arg == 'false' ? arg == 'true' : arg;
				if (arg != undefined || arg == null) {
					cliArgs[k] = arg;
				} else if (Array.isArray(v)) {
					arg = v[0];
					if (arg == undefined || arg == null) {
						return;
					}
					cliArgs[k] = arg;
				} else {
					return;
				}
			}
		});

		this.quasArgs = {
			// Defaults
			...new QuasArgs({
				qType,
				config: this.config,
				cliArgs,
				fromFile,
				buildUser,
				jobTimestamp,
				status: quasarSDK.STATUS_CREATED,
			}),
			...additionalArgs,
			// CLI args
			...cliArgs,
			// Loaded from file with arg --argsFile
			...fromFile
		};

		if (this.quasArgs.useJobTimestampForBuild) {
			this.quasArgs.assetsFolder = `${this.quasArgs.assetsFolder}_${this.quasArgs.jobTimestamp}`;
		}

		return this.quasArgs;
	}

	/**
	 * @description sets the default values of the source and output arguments from user input
	 * @param {QuasArgs} [args={}]
	 * @memberof QuasarTask
	 */
	setSourceAndOutputPlusArgs(args = {}) {
		quasarSDK.debug('will setSourceAndOutputPlusArgs', args);
		this.quasArgs = Object.assign(this.quasArgs, args);

		if (this.quasArgs.source == 'none') {
			this.quasArgs.source = null;
		} else if (this.quasArgs.source && this.quasArgs.source.length) {
			const split = this.quasArgs.source.split('.');

			if (split.length > 1) {
				this.quasArgs.sourceExt = `.${split.pop()}`;
				this.quasArgs.source = this.quasArgs.source.substr(0, this.quasArgs.source.length - this.quasArgs.sourceExt.length);
			}
		}

		if (this.quasArgs.output && this.quasArgs.output.length) {
			const split = this.quasArgs.output.split('.');

			if (split.length > 1) {
				this.quasArgs.outputExt = `.${split.pop()}`;
				this.quasArgs.output = this.quasArgs.output.substr(0, this.quasArgs.output.length - this.quasArgs.outputExt.length);
			}
		} else {
			//Default the output filename to the signature
			this.quasArgs.output = this.quasArgs.id || `${this.quasArgs.domain}_${this.quasArgs.signature}_${this.quasArgs.oType}_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}_${this.quasArgs.targetEnvironments.join('-')}`;
		}

		this.quasArgs.target = this.quasArgs.target || this.quasArgs.oType;

		if (Object.keys(this.quasArgs.sourceFileRegexMaps).length) {
			this.setSourceQuaArgsFromSourceFiles(
				this.quasArgs.sourceFileRegexMaps
			);
		}
	}

	/**
	 * @description unpacks source files and sets quasArg values using the regex map passed in
	 * @param {object} map
	 * @param {string} defaultKey
	 * @memberof QuasarTask
	 */
	setSourceQuaArgsFromSourceFiles(map, defaultKey) {
		quasarSDK.debug('will setSourceQuaArgsFromSourceFiles', map);

		if (this.quasArgs.sourceExt == '.zip') {
			const zipFileName = `${this.quasArgs.sourcesFolder}/${this.quasArgs.source}${this.quasArgs.sourceExt}`;
			if (fs.existsSync(zipFileName)) {
				const zip = new admZip(zipFileName);
				const zipEntries = zip.getEntries();

				Object.keys(map).forEach(function (key) {
					this.quasArgs[key] = this.quasArgs[key] || '';
					this.quasArgs[`${key}Src`] = this.quasArgs[`${key}Src`] || '';
				}.bind(this));

				zipEntries.forEach((zipEntry) => {
					if (zipEntry.name.substr(0, 2) !== '._') {
						Object.keys(map).forEach(function (key) {
							const regex = map[key];
							const regularExpression = new RegExp(`${regex}*`, 'i');
							if (regularExpression.test(zipEntry.name)) {
								this.quasArgs[key] = zipEntry.name;
								this.quasArgs[`${key}Src`] = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${zipEntry.name}`;
							}
						}.bind(this));
					}
				});
			}
		} else if (defaultKey) {
			this.quasArgs[defaultKey] = `${this.quasArgs.source}${this.quasArgs.sourceExt}`;
			this.quasArgs[`${defaultKey}Src`] = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${this.quasArgs.source}${this.quasArgs.sourceExt}`;
		} else {
			Object.keys(map).forEach(function (key) {
				if (!defaultKey) {
					this.quasArgs[key] = `${this.quasArgs.source}${this.quasArgs.sourceExt}`;
					this.quasArgs[`${key}Src`] = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${this.quasArgs.source}${this.quasArgs.sourceExt}`;
				} else if (defaultKey == key) {
					this.quasArgs[key] = `${this.quasArgs.source}${this.quasArgs.sourceExt}`;
					this.quasArgs[`${key}Src`] = `${this.quasArgs.cdnUrlStart}${this.quasArgs.bucketPath}/${this.quasArgs.source}${this.quasArgs.sourceExt}`;
				}
			}.bind(this));
		}
	}

	/**
	 * @description sets args from quasar form data and runs validation on the final fields
	 * @param {QuasArgs} [args={}]
	 * @returns {Promise} resolves to true if validation is successful
	 * @memberof QuasarTask
	 */
	validateRequiredArgs(args = {}) {
		quasarSDK.debug('will validateRequiredArgs', args);

		return new Promise(function (resolve) {
			// Merge options with passed in parameters
			this.setSourceAndOutputPlusArgs(args);

			resolve(true);
		}.bind(this));
	}
}

module.exports = QuasarTask;
