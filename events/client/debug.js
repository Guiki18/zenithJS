const colors = require('colors/safe');

module.exports = {
	name: 'debug',
	once: false,
	async execute(client, info) {
		try {
			console.debug(info);
		}
		catch (error) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + error));
		}
	},
};