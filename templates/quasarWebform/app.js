let express = require('express'),
    app = express(),
    launcher = require( 'launch-browser' ),
    yargs = require('yargs'),
    path = require('path');

let PORT = '3720';

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

const webForm = (port = null) => {
    PORT = port || PORT;
    app.get('/', function(req, res){
        res.sendFile(path.join(`${__dirname}/index.html`));
      });
    app.use(express.static(__dirname, staticOptions));
    app.listen(PORT);
    console.log(`quasar webform running on port:${PORT} at http://localhost:${PORT}`);
}

const launchInBrowser = () => {
    launcher(`http://localhost:${PORT}`, { browser: ['chrome', 'firefox', 'safari'] }, (e, browser) => {
        if(e) return console.log(e);
        
        browser.on('stop', (code) => {
            console.log( 'Browser closed with exit code:', code );
        });
    })
}

const run = (port = null, autoLaunchBrowser = false) => {
    webForm(port);
    if(autoLaunchBrowser) {
        launchInBrowser();
    }
}

if(yargs.argv.runWebFormStandalone) {
    run(yargs.argv.webFormPort, yargs.argv.autoLaunchBrowser);
}

module.exports = {
    PORT,
    run
};