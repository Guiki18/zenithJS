const colors = require('colors/safe');

module.exports = {
	name: 'shardReconnecting',
	once: false,
	async execute(client, id) {
		try {
			console.info(colors.brightYellow(`Shard ${id} reconnecting.`));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};