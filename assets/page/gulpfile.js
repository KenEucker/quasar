let gulp = require('gulp'),
    path = require('path'),
    task = path.basename(__dirname),
    build = require(`../../tasks/${task}`);

gulp.task('default', [task]);

module.exports = {
    qType,
    task: qType
}