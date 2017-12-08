let express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	path = require('path'),
	lib = require('./lib');

let PORT = process.env.PORT || '3720';
let availableTasks = lib.getTaskNames(path.resolve('./tasks/'));

const run = (port = null) => {
	PORT = port || PORT;

	// CORS
	// app.use(function(req, res, next) {
	// 	res.header("Access-Control-Allow-Origin", "*");
	// 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	// 	next();
	// });

	// app.get('/', function(req, res){
	// 	res.json({availableTasks});
	// });

	app.listen(PORT);
	lib.logSuccess(`quasar api running on port:${PORT} at http://localhost:${PORT}`);
}

module.exports = {
	app,
	PORT,
	run
};