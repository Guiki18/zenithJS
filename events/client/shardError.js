const colors = require('colors/safe');

module.exports = {
	name: 'shardError',
	once: false,
	async execute(client, event, id) {
		try {
			console.error(colors.brightRed(`Shard ${id} error:\n` + event.error));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};