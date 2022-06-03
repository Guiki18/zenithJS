const { Manager } = require('erela.js');
const config = require('../config/config.json');
const colors = require('colors/safe');
const { MessageEmbed } = require('discord.js');
const Spotify = require('erela.js-spotify');

const clientID = config.lavalink.spotifyConfig.clientId;
const clientSecret = config.lavalink.spotifyConfig.clientSecret;

module.exports = async function(client) {
	client.manager = new Manager({
		nodes: config.lavalink.nodes,
		plugins: [
			new Spotify({
				clientID,
				clientSecret,
			}),
		],
		autoPlay: true,
		send: (id, payload) => {
			const guild = client.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	})
		.on('nodeConnect', node => console.info(colors.brightGreen(`Node "${node.options.identifier}" connected.`)))
		.on('nodeError', (node, error) => console.error(colors.brightRed(`Node "${node.options.identifier}" encountered an error: ${error.message}.`)))
		.on('trackStart', (player, track) => {
			const channel = client.channels.cache.get(player.textChannel);
			const durationTimeMs = track.duration;
			const durationTime = {
				hours: Math.floor(durationTimeMs / 3600000),
				minutes: Math.floor((durationTimeMs % 3600000) / 60000),
				seconds: Math.floor((durationTimeMs % 60000) / 1000),
			};

			const trackStart = new MessageEmbed()
				.setColor('BLUE')
				.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
				.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
				.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)

				.setThumbnail(track.thumbnail)
				.setTimestamp()
				.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			channel.send({ embeds: [trackStart] });
		})
		.on('queueEnd', player => {
			const channel = client.channels.cache.get(player.textChannel);
			const queueEnd = new MessageEmbed()
				.setColor('RED')
				.setTitle('⏹ | Queue Ended')
				.setTimestamp()
				.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			channel.send({ embeds: [queueEnd] });
			player.destroy();
		});
};