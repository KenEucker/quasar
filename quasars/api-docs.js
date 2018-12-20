const gulp = require('gulp'),
	path = require('path'),
	jsdoc = require('jsdoc-api'),
	fs = require('fs'),
	include = require('gulp-include-ext'),
	insert = require('gulp-insert'),
	// TODO: replace with require('quasar~task),
	QuasarTask = require(path.resolve(`${__dirname}/../src/task.js`)),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`));

const qType = path.basename(__filename).split('.')[0];
const oTypes = [qType];
const purpose = `
uses jsdoc to build documentation using the source files and outputting into a themed site.
`;

class ApiDocsQuasar extends QuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			oTypes,
			purpose,
			config,
			applicationRoot, {
				outputExt: '.html',
				debugAssetsFolder: true,
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return quasarSDK
			.unpackSourceFiles(this.quasArgs, 'src')
			.then(function () {
				const srcFolder = `${this.quasArgs.assetsFolder}/src`;

				// The source folder is in place
				if (!fs.existsSync(srcFolder)) {
					// move all source files into the src folder
					const sourcePath = fs.existsSync(path.resolve(this.quasArgs.source)) ? path.resolve(this.quasArgs.source) : this.quasArgs.assetsFolder;
					const files = [`${sourcePath}/*`];

					return new Promise(
						function (resolve) {
							quasarSDK.logInfo(`moving source files (${files.join(' ')}) from ${sourcePath}/ to ${srcFolder}`);
							return gulp.src(files, {
									base: sourcePath,
									allowEmpty: true,
								})
								.on('error', err => {
									quasarSDK.logError('copying source files error', err);
								})
								.pipe(gulp.dest(srcFolder))
								.on('end', resolve);
						});
				}
			}.bind(this))
			.then(function () {
				const srcFolder = `${this.quasArgs.assetsFolder}/src`;
				const destination = `${this.quasArgs.assetsFolder}`;
				const configure = this.quasArgs.configFile;
				const config = {
					files: `${srcFolder}/*`,
					configure,
					destination,
				};

				quasarSDK.logSuccess(`running jsdoc with configuration file ${configure}`, config);
				quasarSDK.debug(`will run jsdoc on source ${srcFolder} to the destination ${destination} using the config file`, config);
				return jsdoc.renderSync(config);
			}.bind(this))
			.then(function () {
				return quasarSDK.copyFilesFromTemplatesFolderToAssetsFolder(this.quasArgs, ['**']);
			}.bind(this))
			.then(function () {
				// Loop through all of the documentation html files to insert specific styles and scripts
			}.bind(this))
			.then(function () {
				// Loop through all of the documentation html files to insert additional styles and scripts
				const htmlFiles = `${this.quasArgs.assetsFolder}/**.html`;
				const htmlJsFiles = `${this.quasArgs.assetsFolder}/**.js.html`;
				const quasArgs = this.quasArgs;
				quasArgs.debris = ['styles/spacelab-bootstrap.min.css', 'styles/docs.css', 'scripts/docs.js'];
				quasArgs.cssInjectTargets = ['</head>'];
				quasArgs.jsInjectTargets = ['</body>'];

				return new Promise(
					function (resolve) {
						return gulp.src([htmlFiles, htmlJsFiles], {
								base: this.quasArgs.assetsFolder,
							})
							.pipe(insert.transform(
								function (contents) {
									return quasarSDK.injectDebrisFilesIntoStream(quasArgs, contents, false);
								}.bind(this)))
							.pipe(
								include({
									extensions: ['css', 'js'],
									hardFail: false,
									includePaths: [this.quasArgs.assetsFolder],
									separateInputs: true,
								})
							)
							.pipe(gulp.dest(this.quasArgs.assetsFolder))
							.on('end', resolve);
					}.bind(this));
			}.bind(this))
			.then(function () {
				return quasarSDK.copyFilesFromAssetsFolderToOutput(this.quasArgs, ['**'], ['src/**'])
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
				message: `Enter the input archive filename (default .zip)`,
				choices: ['none'].concat(
					quasarSDK.getAvailableSourceFilenames(this.quasArgs)
				)
			}];

			let optionalArgs = [{
					type: 'input',
					name: 'configFile',
					shortMessage: 'JSDoc Config File',
					message: 'Enter the path to the configFile to use when calling jsdoc',
					default: `${this.config.applicationRoot}/jsdoc.config.json`
				},
				{
					type: 'input',
					name: 'footerText',
					shortMessage: 'Footer Text',
					message: 'Enter the text for the footer of the documentation',
					default: `a Quick, Usable, And Simple; Application Runtime`
				},
				{
					type: 'input',
					name: 'apiName',
					shortMessage: 'API Name',
					message: 'Enter the name of the api documentation',
					default: `QUASAR`
				},
				{
					type: 'input',
					name: 'logoUrl',
					shortMessage: 'Logo Source Url',
					message: 'Enter the url for the logo to be used on the documentation pages',
					default: `https://cdn.dtcn.com/temp/quasar/icon.png`
				},
				{
					type: 'input',
					name: 'logoClickUrl',
					shortMessage: 'Logo Click Url',
					message: 'Enter the url to navigate to on logo click',
					default: `https://github.com/DigitalTrends/quasar`
				},
				{
					type: 'input',
					name: 'template',
					shortMessage: 'JSDoc Template',
					message: 'Enter the name of the jsdoc template to use',
					default: `node_modules/tui-jsdoc-template`
				},
				{
					type: 'input',
					name: 'package',
					shortMessage: 'Package File',
					message: 'Enter the path to the package.json file to use the version number for the docs.',
					default: `package.json`
				},
				{
					type: 'input',
					name: 'readme',
					shortMessage: 'Readme File',
					message: 'Enter the filepath to the readme file',
					default: `${this.config.applicationRoot}/README.md`
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
				optionalArgs,
			};
		}

		return super.getQuasarPrompts(separated);
	}

	validateRequiredArgs(args = {}) {
		return new Promise(
				function (resolve) {
					this.setSourceAndOutputPlusArgs(args);
					resolve(quasarSDK.copyTemplateFilesToAssetsPath(this.quasArgs));
				}.bind(this)
			)
			.then(
				function (args) {
					this.quasArgs = args;
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

module.exports = ApiDocsQuasar;
module.exports.qType = qType;
module.exports.oTypes = [];
module.exports.purpose = purpose;
