let express = require('express'),
    launcher = require( 'launch-browser' ),
    yargs = require('yargs'),
    path = require('path'),
    fs = require('fs'),
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

const findOutputDirectory = (startPath, outputDirectory = 'jobs', maxLevels = 5) => {
	if (!fs.existsSync(startPath)){
		return;
    }
    
    // If the startPath is the one we are looking for
    let stat = fs.lstatSync(startPath);
    console.log(`comparator:${startPath.split('/').pop()}`);
    if(stat.isDirectory() && startPath.split('/').pop() == outputDirectory) {
        return startPath;
    }

    // If the path we are looking for is a sybling of the startPath
    const files=fs.readdirSync(startPath);
	for (let i=0; i < files.length; i++) {
        const pathname = path.join( startPath, files[i]);

		stat = fs.lstatSync(pathname);
        if(stat.isDirectory() && pathname.split('/').pop() == outputDirectory) {
            return pathname;
        }
    }

    if(maxLevels > 0) {
        return findOutputDirectory(path.resolve(startPath, '../'), outputDirectory, maxLevels - 1);
    } else {
        return;
    }
}

const postedForm = (req, res) => {
    let data = req.body;
    const outputDirectory = findOutputDirectory(path.resolve(__dirname));
    fs.writeFileSync(`${outputDirectory}/${data.qType}_${Date.now()}.json`, JSON.stringify(data));
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