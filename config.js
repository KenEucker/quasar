//config file for paths and such
const dirname = process.cwd();

const config = {
	dirname,
	node_modules:		`${dirname}/node_modules/`,
	outputFolder:		`${dirname}/public`,
	sourceFolder:		`${dirname}/source`,
	assetsFolder:		`${dirname}/assets`
};

module.exports = config;