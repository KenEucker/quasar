const path = require('path'),
	QuasarSDK = require(path.resolve(`${__dirname}/src/quasar`));

module.exports = new QuasarSDK();
