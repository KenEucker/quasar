const assert = require("assert")
const path = require('path')

const srcPath = path.resolve(`${__dirname}/../../src/`)
const QuasarTask = require(`${srcPath}/task.js`)
let quasarTask

describe("QuasarTask - quasar build tasks", function () {

	describe("smoke test", function () {

		it("should require() without errors", function () {

			quasarTask = new QuasarTask('page')

			assert.equal(true, !!quasarTask, 'No error was thrown, but the instance is null')

		})

	})

})
