const { readdirSync } = require('fs');
const colors = require('colors/safe');

module.exports = async function(client) {
	try {
		const eventFolders = readdirSync(__dirname + '/../events');

		for (const folder of eventFolders) {
			const eventFiles = readdirSync(__dirname + '/../events' + '/' + folder).filter(file => file.endsWith('.js'));
			for (const file of eventFiles) {
				const event = require(__dirname + '/../events' + `/${folder}/${file}`);
				if (event.once) {
					client.once(event.name, (...args) => event.execute(client, ...args));
				}
				else {
					client.on(event.name, (...args) => event.execute(client, ...args));
				}
				console.debug(`Loaded event ${event.name} from ${folder}/${file}`);
			}
		}
	}
	catch (error) {
		console.error(colors.brightRed('Error loading some handler:\n' + error));
	}
};