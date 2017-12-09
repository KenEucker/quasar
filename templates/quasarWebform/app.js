let express = require('express'),
    launcher = require( 'launch-browser' ),
    yargs = require('yargs'),
    path = require('path'),
    bodyParser = require('body-parser');

let PORT = process.env.PORT || '3720', app = null;

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

const postedForm = (req, res) => {
    console.log(`Got a thing! -->`, req.body);
    res.send({message: "okay!"});
}

const webForm = (app, port = null, start = false) => {
    PORT = port || PORT;

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.post('/', postedForm);

    app.get('/', function(req, res){
        res.sendFile(path.join(`${__dirname}/index.html`));
      });

    app.use(express.static(__dirname, staticOptions));

    if (start) {
        app.listen(PORT);
    }
    console.log(`quasar webform running on port:${PORT} at http://localhost:${PORT}`);
}

const launchInBrowser = () => {
    launcher(`http://localhost:${PORT}`, { browser: ['chrome', 'firefox', 'safari'] }, (e, browser) => {
        if (e) return console.log(e);
        
        browser.on('stop', (code) => {
            console.log( 'Browser closed with exit code:', code );
        });
    })
}

const run = (app = null, port = null, autoLaunchBrowser = yargs.argv.autoLaunchBrowser || false, start = false) => {
    if (!app) {
        app = express();
        start = true;
    }

    webForm(app, port, start);

    if (autoLaunchBrowser) {
        launchInBrowser();
    }
}

if (yargs.argv.runWebFormStandalone) {
    run(null, yargs.argv.webFormPort, yargs.argv.autoLaunchBrowser, true);
}

module.exports = {
    PORT,
    run
};