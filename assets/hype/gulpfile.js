let gulp = require('gulp'),
	path = require('path'),
	qType = path.basename(__dirname),
	build = require(`../../tasks/${qType}`);

gulp.task('default', [qType]);

module.exports = {
qType,
task: qType
}