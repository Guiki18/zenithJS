const colors = require('colors/safe');

module.exports = {
	name: 'shardReady',
	once: false,
	async execute(client, id) {
		try {
			console.info(colors.brightYellow(`Shard ${id} ready.`));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};