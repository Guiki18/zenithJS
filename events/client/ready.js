const colors = require('colors/safe');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		try {
			console.log(colors.brightGreen(`${client.user.tag} is online!`));
			client.user.setActivity('Under dev', { type: 'WATCHING' });
		}
		catch (error) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + error));
		}
	},
};