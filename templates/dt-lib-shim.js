const config = require(`${process.cwd()}/config.js`);
let lib = require(`${config.dirname}/lib.js`);

lib.getCampaignPromptQuestions = () => {
	return [{
		type: 'input',
		name: 'domain',
		message: 'Enter the name of the client to be used in building assets:\n',
		required: true,
		validate: lib.makePromptRequired
	},
	{
		type: 'input',
		name: 'signal',
		message: 'Enter the name of the campaign to be used when compiling quasars:\n',
		required: true,
		validate: lib.makePromptRequired
	}];
}

lib.hasCampaignAnswers = (args) => {
	return args.campaign && args.client;
}

lib.resolveQuasArgs = (args, _args = {}) => {
	args = Object.assign(args, _args);
	args.client = args.client || args.domain;
	args.campaign = args.campaign || args.signal;

	args.bucket = 'dtcn';
	args.cdnUrlStart = 'https://cdn.dtcn.com/';

	return args;
}

lib.injectAdCode = lib.injectCode;

// // One switch method to rule all lib actions
// const _king = (action, args) => {
// 	switch(action) {
// 		case "injectAdCode":
// 			action = "injectCode";
// 		case "shim":
// 		// All methods should follow through to the return of
// 		default:
// 		//theking
// 		return lib[action](args);
// 		break;
// 	}
// }
// // One array to find the contextual lib actions
// const methodAliases = [ "injectAdCode", "shim" ];
// // One map to bring the shimmed lib actions to the shim
// methodAliases.map(alias => { 
// 	if(alias == "shim") {
// 		lib[alias] = () => { 		var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
// 			console.log(`shim called directly with args:${args}`, arguments[0]); return; _king(arguments[0], Array.prototype.slice.shift(arguments)); };
// 	} else {
// 		lib[alias] = () => { var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
// 			 console.log(`${alias} called with args:${args}`); return; _king(alias, arguments); };
// 	}
// });

// And in the assignment bind them
module.exports = lib;