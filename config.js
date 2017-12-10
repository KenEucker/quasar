//config file for paths and such
const dirname = process.cwd();

const config = {
	dirname,
	node_modules:		`${dirname}/node_modules/`,
	outputFolder:		`${dirname}/public`,
	sourceFolder:		`${dirname}/sources`,
	assetsFolder:		`${dirname}/assets`,
	templatesFolder:	`${dirname}/templates`
};

module.exports = config;