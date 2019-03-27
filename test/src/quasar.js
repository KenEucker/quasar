const assert = require("assert")
const path = require('path')
const fs = require('fs')
const os = require('os')
const yargs = require('yargs')

const basePath = path.resolve(`${__dirname}/../../`)
let quasarSDK

describe("Quasar - SDK", function () {

	describe("smoke test", function () {

		it("should require() without errors", function () {

			try {

				quasarSDK = require(basePath)

				assert.equal(true, !!quasarSDK, 'No error was thrown, but the instance is null')

			} catch (e) {

				assert.equal(true, !!quasarSDK, 'error requiring the sdk')

			}

		})

		it("should be able to print logo to console", function () {

			quasarSDK.logQuasarLogo('Quasar', require(`${basePath}/package.json`), 'green')

			assert.equal(true, true)

		})

		it("should be able to access configuration", function () {

			assert.equal(true, !!quasarSDK.config, 'Configuration is not set')

		})

	})

	// Using gulp
	// describe("gulp tests", function () {

	// 	it('should register default gulp task', function (done) {

	// 		done()

	// 	})

	// })

	// Making calls to the dropbox API
	describe("functional tests", function () {

		// it('should be able to clean output folders', function () {

		// 	quasarSDK.cleanOutputFolders(true)

		// })

		it('should create output folders', function () {

			quasarSDK.createOutputFolders()

		})

		it('should build quasar-webform quasar in application root', function () {

			return quasarSDK.runQuasar('quasar-webform', {
				noPrompt: true
			})
				.then(function () {
					assert.equal(true, fs.existsSync(`${basePath}/app/webform/index.html`), 'expected generated file does not exist')
				})
				.catch((e) => {
					assert.equal(true, false, e.message)
				})

		})

		it('should build "page" quasar', function () {

			const qType = 'page'
			const domain = signature = 'test-page'

			return quasarSDK.runQuasar(qType, {
				signature,
				domain,
				noPrompt: true
			})
				.then(function () {
					assert.equal(true, fs.existsSync(`${quasarSDK.config.publicFolder}/${domain}/${signature}`), 'expected generated file does not exist')
				})
				.catch((e) => {
					assert.equal(true, false, e.message)
				})

		})

		it('should clean up after itself', function () {

			quasarSDK.cleanDevFolders()

		})

	})
})
