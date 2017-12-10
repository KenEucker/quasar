let express = require('express'),
    launcher = require( 'launch-browser' ),
    yargs = require('yargs'),
    path = require('path'),
    fs = require('fs'),
    multer  = require('multer'),
	mkdir = require('mkdirp-sync'),
    bodyParser = require('body-parser');

const findOutputDirectory = (startPath, outputDirectory = 'jobs', maxLevels = 5) => {
    if (!fs.existsSync(startPath)){
        return;
    }
    
    // If the startPath is the one we are looking for
    let stat = fs.lstatSync(startPath);
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

let PORT = process.env.PORT || '3720', app = null, sourcesDirectory = findOutputDirectory(path.resolve(__dirname), `sources`);;


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, sourcesDirectory)
//     },
//     filename: function (req, file, cb) {
//         const outputExt = `.zip`;
//         const outputFile = `${req.body ? req.body.qType : `unknown`}_${Date.now()}${outputExt}`;
//         console.log(`storing source at ${sourcesDirectory}/${sourceFile}${sourceExt}`);
//         cb(null, outputFile);
//     }
// });

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

const loadingPage = () => {
    return `
        <html>
            <body>
                <h1>
                    Loading ...
                </h1>

                <script>
                setInterval(function() {
                    window.reload();
                }, 1000)
                </script>
            </body>
        </html>
    `;
}

const postedForm = (req, res) => {
    let data = req.body;
    const outputDirectory = findOutputDirectory(path.resolve(__dirname));
    const outputFile = `${data.qType}_${Date.now()}`;

    if(data.source && data.source.length) {
        const sourceExt = `.zip`;
        const sourceFile = `${sourcesDirectory}/${outputFile}`;
        let removeUntil = data.source.indexOf(',');
        removeUntil = removeUntil > 0 ? removeUntil + 1 : removeUntil;
        const removed = data.source.substr(0, removeUntil);
        var base64 = data.source.substr(removeUntil);
        fs.writeFileSync(`${sourceFile}${sourceExt}`, base64, 'base64'); 
        data.source = outputFile;
        data.sourceExt = sourceExt;
        // console.log(`storing args in ${outputDirectory} for quasar loading and saving source to ${sourcesDirectory}/${sourceFile}${sourceExt}`);
    }
    fs.writeFileSync(`${outputDirectory}/${outputFile}.json`, JSON.stringify(data));

}

const webForm = (app, port = null, start = false) => {

    if(!sourcesDirectory) {
        sourcesDirectory = path.resolve(`${process.cwd()}/sources/`);
        mkdir(sourcesDirectory);
    }
      
    //let upload = multer({ storage: storage });
    PORT = port || PORT;

    app.use(bodyParser.json({limit:'50mb'}));
    app.use(bodyParser.urlencoded({ extended: true, limit:'50mb' }));

    app.post('/', postedForm);
    //app.post('/', upload.single('file'), postedForm);

    app.get('/', function(req, res){
        const webFormPath = path.resolve(path.join(`${__dirname}/index.html`));
        if(fs.existsSync(webFormPath)) {
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