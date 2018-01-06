let express = require('express'),
    launcher = require('launch-browser'),
    yargs = require('yargs'),
    path = require('path'),
    fs = require('fs'),
    favicon = require('express-favicon'),
    mkdir = require('mkdirp-sync'),
    bodyParser = require('body-parser');

let PORT = process.env.PORT || '3720',
    app = null,
    sourcesDirectory = path.resolve(`${process.cwd()}/sources/`);

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

const findOutputDirectory = (startPath, outputDirectory = '', maxLevels = 5) => {
    if (!fs.existsSync(startPath)) {
        return;
    }

    // If the startPath is the one we are looking for
    let stat = fs.lstatSync(startPath);
    if (stat.isDirectory() && startPath.split('/').pop() == outputDirectory) {
        return startPath;
    }

    // If the path we are looking for is a sybling of the startPath
    const files = fs.readdirSync(startPath);
    for (let i = 0; i < files.length; i++) {
        const pathname = path.join(startPath, files[i]);

        stat = fs.lstatSync(pathname);
        if (stat.isDirectory() && pathname.split('/').pop() == outputDirectory) {
            return pathname;
        }
    }

    if (maxLevels > 0) {
        return findOutputDirectory(path.resolve(startPath, '../'), outputDirectory, maxLevels - 1);
    } else {
        return;
    }
}

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
    console.log(`${path.resolve(__dirname)}/icon.png`);
    app.use(favicon(`${findOutputDirectory(__dirname, '../')}/icon.png`));

    app.get('/job/:id', function (req, res) {
        const jobFile = `${req.params.id}.json`;
        const jobFilePath = `${findOutputDirectory(path.resolve(__dirname), `jobs`)}/completed/${jobFile}`;

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

const init = () => {
    sourcesDirectory = findOutputDirectory(path.resolve(__dirname), `sources`);
}

module.exports = {
    PORT,
    init,
    run
}
