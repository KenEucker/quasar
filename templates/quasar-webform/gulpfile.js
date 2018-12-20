let gulp = require('gulp'),
	path = require('path'),
	basePath = path.resolve('../../'),
	qType = path.basename(__dirname),
	build = require(`${basePath}/tasks/${qType}`);

build.init(null, basePath);

gulp.task('default', [qType]);

module.exports = {
	qType,
	task: qType
}
