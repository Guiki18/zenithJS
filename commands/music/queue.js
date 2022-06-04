const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	name: 'queue',
	description: 'View the current queue',
	cooldown: 2,
	args: false,
	usage: '',
	guildOnly: true,
	aliases: ['q'],

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

			const queue = player.queue;
			const embed = new MessageEmbed()
				.setTitle(`Queue for ${message.guild.name}`);

			const multiple = 10;
			const page = args.length && Number(args[0]) ? Number(args[0]) : 1;

			const end = page * multiple;
			const start = end - multiple;

			const tracks = queue.slice(start, end);

			if (queue.current) embed.addField('Current', `[${queue.current.title}](${queue.current.uri})`);

			if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : 'the queue'}.`);
			else embed.setDescription(tracks.map((track, i) => `${start + (++i)} - [${track.title}](${track.uri})`).join('\n'));

			const maxPages = Math.ceil(queue.length / multiple);

			embed.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

			return message.reply({ embeds: [embed] });

		}
		catch (error) {
			console.log(colors.brightRed(error));
		}
	} };