const assert = require("assert")
const path = require('path')
const os = require('os')

const srcPath = path.resolve(`${__dirname}/../../src/`)
const QuasarConfig = require(`${srcPath}/config.js`)
let quasarConfig

describe("QuasarConfig - environment variables", function () {
	describe("smoke test", function () {
		it("should require with no errors", function () {

			quasarConfig = new QuasarConfig()

			assert.equal(true, !!quasarConfig, 'No error was thrown, but the instance is null')

		})

		it("should contain the correct paths", function () {

			assert.equal(true,
				quasarConfig.applicationRoot == process.cwd() &&
				quasarConfig.moduleRoot == path.resolve(`${srcPath}/../`) &&
				quasarConfig.outputRoot == path.resolve(`${os.homedir()}/Documents/quasar`), 'incorrect default paths set')

		})

		it("should have all path variables set", function () {

			assert.equal(true,
				!!quasarConfig.applicationRoot &&
				!!quasarConfig.moduleRoot &&
				!!quasarConfig.outputRoot &&
				!!quasarConfig.templatesFolder &&
				!!quasarConfig.debrisFolder &&
				!!quasarConfig.snippetsFolder &&
				!!quasarConfig.node_modules &&
				!!quasarConfig.quasarsFolder &&
				!!quasarConfig.outputFolder &&
				!!quasarConfig.sourcesFolder &&
				!!quasarConfig.assetsFolder &&
				!!quasarConfig.jobsFolder, 'at least one path variable was not set correctly')

		})
	})
})
