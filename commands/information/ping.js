const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	name: 'ping',
	description: 'Ping!',
	cooldown: 5,
	args: false,
	usage: '',
	guildOnly: false,
	aliases: ['latency'],

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
			const msg = await message.channel.send('Pinging...');
			const pingEmbed = new MessageEmbed()
				.setColor('GREEN')
				.setTitle('🏓 | Pong!')
				.addField('Latency', `\`\`\`\n ❯❯❯ ${msg.createdTimestamp - message.createdTimestamp}ms\n\`\`\``)
				.addField('API Latency', `\`\`\`\n ❯❯❯ ${Math.round(client.ws.ping)}ms\n\`\`\``)
				.setThumbnail(client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
				.setTimestamp()
				.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			return msg.edit({ embeds: [pingEmbed] });
		}
		catch (error) {
			console.log(colors.brightRed(error));
		}
	},
};