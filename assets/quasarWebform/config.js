//config file for paths and such
let dirname = process.cwd();
// Hack so that we don't have to append ../../
let split = dirname.split('/');
split.pop();
split.pop();
dirname = split.join('/');

const config = {
	dirname:			`${dirname}`,
	outputFolder:		`${dirname}/public`,
	sourceFolder:		`${dirname}/source`,
	assetsFolder:		`${dirname}/assets`,
	node_modules:		`${dirname}/node_modules/`,
};

module.exports = config;