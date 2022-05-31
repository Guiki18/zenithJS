const colors = require('colors/safe');

module.exports = {
	name: 'shardDisconnect',
	once: false,
	async execute(client, event, id) {
		try {
			console.info(colors.brightYellow(`Shard ${id} disconnected:\n` + event.reason));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};