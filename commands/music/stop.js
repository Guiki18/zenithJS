const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	name: 'stop',
	description: 'Stop the music player',
	cooldown: 2,
	args: false,
	usage: '',
	guildOnly: true,
	aliases: [''],

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
			const player = message.client.manager.get(message.guild.id);

			if (!player) {
				const noPlayer = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | There is no player for this guild')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [noPlayer] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}

			const { channel } = message.member.voice;

			if (!channel) {
				const noVcChannel = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | You are not in a voice channel')
					.setDescription('Please join a voice channel and try again.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [noVcChannel] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}
			if (channel.id !== player.voiceChannel) {
				const wrongChannel = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | You are not in the same voice channel')
					.setDescription('Please join the same voice channel (<#' + player.voiceChannel + '>) and try again.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [wrongChannel] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}
			player.destroy();
			return message.react('⏹');
		}
		catch (error) {
			console.log(colors.brightRed(error));
		}
	} };