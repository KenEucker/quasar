const assert = require("assert")
const path = require('path')

const srcPath = path.resolve(`${__dirname}/../../src/`)
const Quasargs = require(`${srcPath}/quasargs.js`)
const QuasarConfig = require(`${srcPath}/config.js`)
let quasargs

describe("QuasArgs - build args", function () {

	describe("smoke test", function () {

		it("should require() without errors", function () {

			quasargs = new Quasargs({ qType: 'page', config: new QuasarConfig() })

			assert.equal(true, !!quasargs, 'No error was thrown, but the instance is null')

		})

	})

})
