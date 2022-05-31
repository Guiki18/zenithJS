const colors = require('colors/safe');

module.exports = {
	name: 'error',
	once: false,
	async execute(client, error) {
		try {
			/*
			if (error.code === 'ECONNREFUSED') {
				console.log(colors.brightRed(`[${client.user.tag}] ${error.message}`));
				return;
			}*/
			console.error(colors.brightRed(error));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};