const colors = require('colors/safe');

module.exports = {
	name: 'rateLimit',
	once: false,
	async execute(client, rateLimitData) {
		try {
			console.warn(colors.brightRed(`Rate limit exceeded.\n${rateLimitData}`));
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err));
		}
	},
};