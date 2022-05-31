const { readdirSync } = require('fs');
const colors = require('colors/safe');

module.exports = async function(client) {
	try {
		const commandFolders = readdirSync(__dirname + '/../commands');

		for (const folder of commandFolders) {
			const commandFiles = readdirSync(__dirname + '/../commands' + '/' + folder).filter(file => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(__dirname + `/../commands/${folder}/${file}`);
				client.commands.set(command.name, command);
				console.debug(`Loaded command ${command.name} from ${folder}/${file}`);
			}
		}
	}
	catch (error) {
		console.error(colors.brightRed('Error loading some handler:\n' + error));
	}
};