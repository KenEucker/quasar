/**
 * @file quasargs.js
 * @author Ken Eucker <keneucker@gmail.com>
 */

/**
 * @classdesc The default quasArgs object used in quasar builds.
 * @export
 * @hideconstructor
 * @class QuasArgs
 * @example
	const quasArgs = new QuasArgs({
		qType,
		config,
		buildUser,
		jobTimestamp,
	});
 */
class QuasArgs {
	constructor(args) {
		/** 
		 * @summary the quasar type
		 * @description This is the main field of a quasar and is used in many places and used to infer build task and template files
		 * @type {string} */
		this.qType = args.qType;
		/** 
		 * @summary the namespace or global name of the quasar
		 * @description This field could be used to designate builds between different pages, or to represent different data types. In the end, it's up to the implementation as to how this is relevant.
		 * @example (the name of a company) 'Toyota'
		 * @type {string}
		 */
		this.domain = '';
		/** 
		 * @summary the id or build name of the quasar
		 * @description This field is more granular than the field before it, domain, and represents a more specific identifier for something lik a region or position in a document.
		 * @example (the name of a product) 'Tacoma'
		 * @type {string}
		 */
		this.signature = '';
		/** 
		 * @summary the name of the user who initiated the build
		 * @description This field defaults to the machine hostname
		 * @type {string} */
		this.buildUser = args.buildUser;
		/** 
		 * @summary the main file to target when building the quasar
		 * @description This field tells quasar to look when targeting a file for a build. If left blank, this will be inferred from the qType variable and fallback to any .html quasar can find between the templates folder and the assets folder.
		 * @type {string} */
		this.target = args.target;
		/** 
		 * @summary the status of the build of quasar
		 * @description This field changes as the quasar moves through each phase of the build
		 * @example [ 'created', 'queued', 'completed', 'failed' ]
		 * @default 'created'
		 * @type {string} */
		this.status = args.status || 'created';
		/** 
		 * @summary the timestamp of the build
		 * @description This field also serves as specific job identifier for the assets folder and can be used to version the output
		 * @default Date.now()
		 * @type {string} */
		this.jobTimestamp = args.jobTimestamp || Date.now();

		/** 
		 * @summary The absolute path to the output folder
		 * @description This path is where quasar outputs are saved once the build has finished.
		 * @example `/${publicFolder}/${domain}/${signature}`
		 * @type {string} */
		this.outputFolder = args.config.outputFolder;
		/** 
		 * @summary The absolute path to the sources folder
		 * @description This path is where sources are downloaded to and pulled from during build time.
		 * @type {string} */
		this.sourcesFolder = args.config.sourcesFolder;
		/** 
		 * @summary The absolute path to the jobs folder
		 * @description This path is where quasArgs are saved as the build moves through the each status of the build.
		 * @type {string} */
		this.jobsFolder = args.config.jobsFolder;
		/** 
		 * @summary The absolute path to the debris folder
		 * @description This path is where quasArgs are saved as the build moves through the each status of the build.
		 * @type {string} */
		this.debrisFolder = args.config.debrisFolder;
		/** 
		 * @summary The absolute path to the sources folder
		 * @description This path is where quasar gets the template files for the build. This field looks for a folder with the name of the qType.
		 * @default `${args.config.templatesFolder}/${this.qType}`
		 * @type {string} */
		this.templatesFolder = this.qType ? `${args.config.templatesFolder}/${this.qType}` : undefined;
		/** 
		 * @summary The absolute path to the assets folder
		 * @description This path is where quasar puts the template files for the build to stage for output. Files in this folder are modified ahead of build time and then data from both the quasArgs set by the user are piped into the template files.
		 * @default `${args.config.assetsFolder}/${this.qType}`
		 * @type {string} */
		this.assetsFolder = this.qType ? `${args.config.assetsFolder}/${this.qType}` : undefined;
		/** 
		 * @summary the full filename of the target
		 * @description This field is used at build time and cannot be set by the user.
		 * @default `${this.qType}.html`
		 * @type {string} */
		this.targetFilePath = null;
		/** 
		 * @summary the asbolute path to the jobfile which is saved into the jobs folder under the status
		 * @description This field is used at build time and cannot be set by the user.
		 * @default `${this.jobsFolder}/${this.status}/${this.qType}_${this.jobTimestamp}.json`
		 * @type {string} */
		this.argsFile = `${this.jobsFolder}/${this.status}/${this.qType}_${this.jobTimestamp}.json`;

		/** 
		 * @summary the acronyms of each environment where this quasar will live
		 * @description This field is used to designate a quasar's intended output to differentiate it between a build of the same type used between different use cases only by the environment it is in.
		 * @type {array} */
		this.targetEnvironments = args.targetEnvironments || [];
		/** 
		 * @summary the arguments that the quasar has been run with from the CLI
		 * @type {map} */
		this.cliArgs = args.cliArgs || {};
		/** 
		 * @summary the arguments that the quasar has been run with from the CLI with a jobFile
		 * @type {map} */
		this.fromFile = args.fromFile || {};
		/** 
		 * @summary the regex maps to required args for inferring sourceFile assets
		 * @type {map} */
		this.sourceFileRegexMaps = args.sourceFileRegexMaps || {};

		/** 
		 * @summary the list of debris to require with this quasar build.
		 * @description This field is a list of js or css files to inject into the output. The contents of the files are piped into script or style tags depending on the file type. Debris are piped into the file only once.
		 * @type {array} */
		this.debris = [];
		/** 
		 * @summary the args that the user can set from a UI.
		 * @description This field is used with the inquirerjs node package and follows the structure of 'questions'.
		 * @see https://github.com/SBoudrias/Inquirer.js/
		 * @example 
		 * 	const questions = [{
				type: 'input',
				name: 'domain',
				shortMessage: 'Domain',
				message: 'Enter the name of the domain to be used in building assets:',
				required: true,
			}];
		 * @type {array} */
		this.requiredArgs = [];

		/** 
		 * @summary the name of the folder to upload to when uploading files to Dropbox.
		 * @type {string} */
		this.dbFolder = '%DROPBOX%';
		/** 
		 * @summary the name of the bucket to upload to when uploading files to Amazon AWS S3.
		 * @type {string} */
		this.bucket = '%AWS%';
		/** 
		 * @summary the file to log outputs to
		 * @description If this field is populated then critical level logs will also be saved to the file specified
		 * @default '.log'
		 * @type {string} */
		this.logFile = '.log';
		/** 
		 * @summary the extension of the source file
		 * @description This field is appended to the source name when seeking to unpack or copy source files to the assets folder
		 * @default '.zip'
		 * @type {string} */
		this.sourceExt = '.zip';
		/** 
		 * @summary the extension of the outputFile
		 * @description This field is appended to the outputFile name when building the output.
		 * @default '.html'
		 * @type {string} */
		this.outputExt = '.html';
		/** 
		 * @summary the 
		 * @description This 
		 * @default 'https=//cdn.com/'
		 * @type {string} */
		this.cdnUrlStart = 'https=//cdn.com/';
		/** 
		 * @summary a list of the targets for pre and post injection of style tags
		 * @description These tags are used to search the outputFile and insert default css files found in the template
		 * @type {string[]} */
		this.cssInjectTargets = ['<head>', '</head>'];
		/** 
		 * @summary a list of the targets for pre and post injection of script tags
		 * @description These tags are used to search the outputFile and insert default js files found in the template
		 * @type {string[]} */
		this.jsInjectTargets = ['<body>', '</body>'];
		/** 
		 * @summary the version number to append to the end of a file
		 * @description This field is not used unless there is another file found with the same id, in which case `_${++outputVersion}` is appended to the outputFile name.
		 * @type {int} */
		this.outputVersion = 1;

		/** 
		 * @summary upload the outputFile to Dropbpx as a .txt file
		 * @description This will use the Dropbox credentials found in a .config file. 
		 * @default false
		 * @type {boolean} */
		this.uploadOutputFileAsTxtFile = false;
		/** 
		 * @summary upload files to S3 using the domain and signature fields into the destination set in the bucket field.
		 * @description This will use the Amazon AWS IAM credentials found in a .config file. 
		 * @default false
		 * @type {boolean} */
		this.uploadToS3 = false;
		/** 
		 * @summary this will flag whether or not to unpack (unzip) the source file
		 * @description This field is mostly used for testing purposes.
		 * @default true
		 * @type {boolean} */
		this.unpackSourceFiles = true;
		/** 
		 * @summary run minification on script files injected
		 * @description This field is used at build time to flag whether or not to run minification strategies on injected script files.
		 * @default false
		 * @type {boolean} */
		this.minifyScripts = false;
		/** 
		 * @summary run minification on style files injected
		 * @description This field is used at build time to flag whether or not to run minification strategies on injected style files.
		 * @default false
		 * @type {boolean} */
		this.minifyStyles = false;
		/** 
		 * @summary run minification on html output
		 * @description This field is used at build time to flag whether or not to run minification strategies on the outputFile.
		 * @default false
		 * @type {boolean} */
		this.minifyHtml = false;
		/** 
		 * @summary overwrite existing assets folder contents on unpack
		 * @description This field determines whether or not to preserve or destroy an existing outputFile when copying files to the assets folder during the unpacking of source files.
		 * @default false
		 * @type {boolean} */
		this.overwriteUnpackDestination = false;
		/** 
		 * @summary overwrite the targetFile using the template file
		 * @description This field determines whether or no to override an existing file at the targetFilePath with the file `${qType}.html` from the templates folder.
		 * @default true
		 * @type {boolean} */
		this.overwriteTargetFileFromTemplate = true;
		/** 
		 * @summary delete the targetFile
		 * @description This is a debug field which, if set, will have quasar delete the targetFile after it has been used in the build.
		 * @default false
		 * @type {boolean} */
		this.cleanUpTargetFileTemplate = false;
		/** 
		 * @summary append the jobTimestamp to the assetsFolder and asset files
		 * @description This field, if set, will append the jobTimestamp to assets to ensure uniqueness of the build.
		 * @default true
		 * @type {boolean} */
		this.useJobTimestampForBuild = true;
		/** 
		 * @summary denotes whether or not these quasArgs have been put through a build and have succeeded
		 * @description This field is used by the runtime and set upon successful build before outputting the args to file.
		 * @default false
		 * @type {boolean} */
		this.buildCompletedSuccessfully = false;
		/** 
		 * @summary exclude the outputFile from uploading to Amazon AWS S3
		 * @description This is mostly a debug field which allows quasar to not upload the outputFile.
		 * @default false
		 * @type {boolean} */
		this.excludeOutputFileFromUpload = false;
		/** 
		 * @summary wrap the outputFile in html tags
		 * @description This field denotes whether or not the output should be wrapped in html tags.
		 * @default true
		 * @type {boolean} */
		this.wrapInHtmlTags = true;
		/** 
		 * @summary append the version to the outputFile, if one already exists with that name
		 * @description This field tells quasar to append the version number to the outputFile if a file exists already with that name in the outputFolder.
		 * @default true
		 * @type {boolean} */
		this.versionOutputFile = true;
		/** 
		 * @summary debug flag for the files used as templates for the build
		 * @description This is a debug field that allows a dev to analyze what state the assets files were in before injection and build.
		 * @default false
		 * @type {boolean} */
		this.debugAssetsFolder = false;
	}
};

module.exports = QuasArgs;
