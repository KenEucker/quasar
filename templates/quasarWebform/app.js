let express = require('express'),
    launcher = require('launch-browser'),
    yargs = require('yargs'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    favicon = require('serve-favicon'),
    mkdir = require('mkdirp-sync'),
    bodyParser = require('body-parser');

let PORT = process.env.PORT || '3720',
    app = null,
    // TODO: this needs to be templated and load from configuration!
    outputRoot = `${os.homedir()}/Documents/quasar/`,
    jobsFolder = path.resolve(`${outputRoot}/jobs/`),
    sourcesDirectory = path.resolve(`${outputRoot}/sources/`);

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

const loadingPage = (message = `Loading ...`) => {
    return `
        <html>
            <body>
                <h1>
                    ${message}
                </h1>

                <script>
                setInterval(function() {
                    var h1 = document.querySelector('h1');
                    if(h1) {
                        h1.innerHTML += '.';
                    }
                }, 300)
                setInterval(function() {
                    window.location.reload(true);
                }, 1200)
                </script>
            </body>
        </html>
    `;
}

const webForm = (app, port = null, start = false) => {

    mkdir(sourcesDirectory);
    PORT = port || PORT;

    app.use(favicon(path.join(__dirname, `/icon.ico`)));

    app.get('/job/:id', function (req, res) {
        const jobFile = `${req.params.id}.json`;
        const jobFilePath = `${jobsFolder}/completed/${jobFile}`;

        if (fs.existsSync(jobFilePath)) {
            const argsFile = fs.readFileSync(jobFilePath);
            const jobArgs = JSON.parse(argsFile);
            if (fs.existsSync(jobArgs.outputFilePath)) {
                res.sendFile(jobArgs.outputFilePath);
            } else {
                console.log(`outputFilePath not found: ${jobArgs.outputFilePath}`);
            }
        } else if (fs.existsSync(jobFilePath.replace('/completed', '/created'))) {
            console.log(`job created: ${jobFile}`);
            res.send(loadingPage("Job has been created but needs to be queued."));
        } else if (fs.existsSync(jobFilePath.replace('/completed', '/queued'))) {
            console.log(`job not yet queued: ${jobFile}`);
            res.send(loadingPage("Building ..."));
        } else {
            res.send("job does not exist");
        }
    });

    app.get('/', function (req, res) {
        const webFormPath = path.resolve(path.join(`${__dirname}/index.html`));
        if (fs.existsSync(webFormPath)) {
            res.sendFile(webFormPath);
        } else {
            console.log(`could not find quasar Webform, sending loading page`);
            res.send(loadingPage());
        }
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
            console.log('Browser closed with exit code:', code);
        });
    })
}

const run = (app = null, port = null, start = false, autoLaunchBrowser = yargs.argv.autoLaunchBrowser || false) => {
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
    run(null, yargs.argv.webFormPort, true, yargs.argv.autoLaunchBrowser);
}

const init = (outRoot = outputRoot) => {
    outputRoot = outRoot,
        jobsFolder = path.resolve(`${outputRoot}/jobs/`),
        sourcesDirectory = path.resolve(`${outputRoot}/sources/`);
}

module.exports = {
    PORT,
    init,
    run
}
