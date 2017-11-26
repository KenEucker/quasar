//config file for paths and such
const dirname = process.cwd();

const config = {
	dirname,
	node_modules:		`${dirname}/node_modules/`,
	distFolder:		`${dirname}/dist`,
	sourceFolder:		`${dirname}/source`,
	assetsFolder:		`${dirname}/assets`,
	plugins: {
		barkeep:  `${dirname}/node_modules/@digitaltrends/barkeep/dist/barkeep.js`,
		prebid:   `${dirname}/node_modules/@digitaltrends/prebid/build/dist/prebid.js`,
		burnside: `${dirname}/node_modules/@digitaltrends/burnside/dist/burnside.js`,
	},
	dt: {
		base_path: `${dirname}/wp-content/themes/digitaltrends-2014/`,
		base_uri:  '/wp-content/themes/digitaltrends-2014/',
	},
	eslint: {
		config: '.eslintrc.js',
	},
	autoprefixer: {
		browsers: '> 10%',
	},
};

module.exports = config;