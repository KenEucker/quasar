let express = require('express'),
    app = express(),
    launcher = require( 'launch-browser' ),
    path = require('path');

let PORT = '3720';

var staticOptions = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
}

const run = (port = null) => {
    PORT = port || PORT;
    app.get('/', function(req, res){
        res.sendFile(path.join(__dirname + '/index.html'));
      });
    app.use(express.static('public', staticOptions));
    app.listen(PORT);
    console.log(`quasar webform running on port:${PORT} at http://localhost:${PORT}`);
};

const launchInBrowser = () => {
    launcher(`http://localhost:${PORT}`, { browser: ['chrome', 'firefox', 'safari'] }, (e, browser) => {
        if(e) return console.log(e);
        
        browser.on('stop', (code) => {
            console.log( 'Browser closed with exit code:', code );
        });
    })
}

run();
launchInBrowser();

module.exports = {
    PORT,
    run
};