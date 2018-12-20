const gulp = require('gulp'),
	fs = require('fs'),
	path = require('path'),
	quasarSDK = require(path.resolve(`${__dirname}/../index.js`)),
	// TODO: replace with require('quasar~task),
	QuasarTask = require(path.resolve(`${__dirname}/../src/task.js`));

const qType = path.basename(__filename).split('.')[0];
const purpose = `
builds a form using react and the json schema pulled directly from the available quasars
installed and allows you to run quasar build tasks with a web ui.
`;
class QuasarWebformQuasar extends QuasarTask {
	constructor(config, applicationRoot, args = {}, registerBuildTasks = true) {
		super(
			qType,
			[],
			purpose,
			config,
			applicationRoot, {
				outputExt: '.html',
				outputFolder: config.applicationRoot,
				...args,
			},
			registerBuildTasks);
	}

	build() {
		return quasarSDK.injectCode(this.quasArgs)
			.then(function (args) {
				this.quasArgs = args;
				return quasarSDK.copyFilesFromTemplatesFolderToOutput(this.quasArgs, ['app.js', 'package.json', 'img/**', 'fonts/**', 'icon.ico', 'icon.png']);
			}.bind(this))
			.then(function () {
				return quasarSDK.outputToHtmlFile(this.quasArgs)
			}.bind(this))
			.catch(this.error.bind(this));
	}

	validateRequiredArgs(args = {}) {
		return new Promise(function (resolve) {
				this.setSourceAndOutputPlusArgs(args);
				resolve(quasarSDK.copyTemplateFilesToAssetsPath(this.quasArgs));
			}.bind(this))
			.then(function (args) {
				this.quasArgs = args;
			}.bind(this))
			.catch(function (e) {
				quasarSDK.logCritical(`${this.qType} validation error:`, e);
				throw e;
			}.bind(this))
	}

	registerTasks() {
		gulp.task(`${this.qType}:compile:html`, function () {
			return quasarSDK.compileTargetFileToAssetsFolder(this.quasArgs);
		}.bind(this));

		gulp.task(`${this.qType}:compile:css`, function () {
			return quasarSDK.compileStylesToAssetsFolder(this.quasArgs);
		}.bind(this));

		gulp.task(`${this.qType}:compile:js`, function () {
			return quasarSDK.compileScriptsToAssetsFolder(this.quasArgs);
		}.bind(this));

		gulp.task(`${this.qType}:compile:sources`, gulp.parallel(`${this.qType}:compile:js`, `${this.qType}:compile:css`, `${this.qType}:compile:html`));

		gulp.task(`${this.qType}:precompile`, function (done) {
			let tasks = quasarSDK.getTaskNames(),
				formsData = [];

			// remove the quasars that build quasar
			if (tasks.indexOf('quasar-webform') !== -1) {
				tasks.splice(tasks.indexOf('quasar-webform'), 1);
			}

			// format questions for react-jsonshcema-form
			tasks.forEach((task) => {
				if (task == this.qType) {
					return;
				}
				const taskPath = `${quasarSDK.config.quasarsFolder}/${task}.js`;

				quasarSDK.debug('will require quasar task file', taskPath);
				const QuasarTask = require(taskPath);

				quasarSDK.debug(`will construct quasar ${task} with config`, quasarSDK.config);
				const newTask = new QuasarTask(quasarSDK.config, null, null, false);

				const taskPrompts = newTask.getQuasarPrompts(null, false);
				let required = [],
					properties = {},
					uiSchema = {},
					formData = {};

				taskPrompts.forEach((prompt) => {
					const name = prompt.name;
					if (prompt.required) {
						required.push(name);
					}
					properties[name] = quasarSDK.convertPromptToJsonSchemaFormProperty(prompt);
					uiSchema[name] = quasarSDK.convertPromptToJsonSchemaUIFormProperty(prompt);
					formData[name] = prompt.default;
				});

				const schema = {
					title: `quasar::${task} -- ${newTask.purpose}`,
					type: 'object',
					required: required,
					properties: properties,
				};
				formsData.push({
					name: task,
					schema: schema,
					uiSchema: uiSchema,
					formData: formData,
					oTypes: newTask.oTypes,
				});
			});

			const formDataJsonString = JSON.stringify(formsData);

			// Stringify the formData and then put it into a template object to be consumed by the template engine and placed on the page as a JSON object
			const templateData = {
				quasarForms: formDataJsonString
			}

			fs.writeFileSync(`${this.quasArgs.templatesFolder}/${this.qType}.mustache.json`, JSON.stringify(templateData));
			done();
		}.bind(this));
		gulp.task(`${this.qType}:compile`, gulp.series(`${this.qType}:precompile`, `${this.qType}:compile:sources`));
		gulp.task(`${this.qType}:build`, gulp.series(`${this.qType}:compile`, function () {
			return this.run({
				domain: 'app',
				signature: 'webform',
				output: 'index.html',
				overwriteDestinationPath: true,
			});
		}.bind(this)));
		gulp.task(this.qType, gulp.series(`${this.qType}:build`));

		quasarSDK.debug(`did register all tasks for quasar ${this.qType}`);
	}
}

module.exports = QuasarWebformQuasar;
module.exports.qType = qType;
module.exports.oTypes = [];
module.exports.purpose = purpose;
