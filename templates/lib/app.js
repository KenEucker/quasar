const express = require('express'),
	launcher = require('launch-browser');

let PORT = process.env.PORT || '3000',
	app = null;

const staticOptions = {
	dotfiles: 'ignore',
	etag: false,
	extensions: ['htm', 'html', 'jpg'],
	index: false,
	maxAge: '1d',
	redirect: false,
	setHeaders: function (res, path, stat) {
		res.set('x-timestamp', Date.now())
	}
};

const launchInBrowser = () => {
	launcher(`http://localhost:${PORT}`, {
		browser: ['chrome', 'firefox', 'safari']
	}, (e, browser) => {
		if (e) return console.log(e);

		browser.on('stop', (code) => {
			console.log('Browser closed with exit code:', code);
		});
	})
}

const run = (port = null, autoLaunchBrowser = yargs.argv.autoLaunchBrowser || false) => {
	app = express();

	app.use(express.static(__dirname, staticOptions));

	if (start) {
		app.listen(PORT);

		if (autoLaunchBrowser) {
			launchInBrowser();
		}
	}

	if (yargs.argv.runWebFormStandalone) {
		run(yargs.argv.webFormPort, yargs.argv.autoLaunchBrowser, true);
	}
}

const init = () => {}

module.exports = {
	PORT,
	init,
	run
}
