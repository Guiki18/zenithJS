const colors = require('colors/safe');
const db = require('better-sqlite3')(__dirname + '/../../database/database.sqlite');


module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		try {
			console.log(colors.brightGreen(`${client.user.tag} is online!`));
			client.user.setActivity('Under dev', { type: 'WATCHING' });
			db.prepare('CREATE TABLE IF NOT EXISTS prefixes (guild_id INT, prefix VARCHAR)').run();
		}
		catch (error) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + error));
		}
	},
};