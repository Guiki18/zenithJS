const colors = require('colors/safe');

module.exports = {
	name: 'warn',
	once: false,
	async execute(client, info) {
		try {
			console.warn(colors.brightYellow(info));
		}
		catch (error) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + error));
		}
	},
};