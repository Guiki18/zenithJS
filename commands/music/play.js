/* eslint-disable no-case-declarations */
const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');

module.exports = {
	name: 'play',
	description: 'Play a song from YouTube or Spotify',
	cooldown: 1,
	args: true,
	usage: '<music name / music link / playlist link >',
	guildOnly: true,
	aliases: ['p'],

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
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
			const player = message.client.manager.create({
				guild: message.guild.id,
				voiceChannel: channel.id,
				textChannel: message.channel.id,
			});

			if (player.state !== 'CONNECTED') player.connect();

			const search = args.join(' ');
			let res;

			try {
				res = await player.search(search, message.author);
				if (res.loadType === 'LOAD_FAILED') {
					if (!player.queue.current) player.destroy();
					throw res.exception;
				}
			}
			catch (err) {
				const searchingError = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | There was an error while searching')
					.setDescription('```\n' + err.message + '\n```')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [searchingError] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}

			switch (res.loadType) {
			case 'NO_MATCHES':
				if (!player.queue.current) player.destroy();
				const noMatches = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | No matches found')
					.setDescription('Please try again with a different search term.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [noMatches] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));

			case 'TRACK_LOADED':
				player.queue.add(res.tracks[0]);

				if (!player.playing && !player.paused && !player.queue.size) player.play();
				const singleTrackDurationTimeMs = res.tracks[0].duration;
				const singleTrackDurationTime = {
					hours: Math.floor(singleTrackDurationTimeMs / 3600000),
					minutes: Math.floor((singleTrackDurationTimeMs % 3600000) / 60000),
					seconds: Math.floor((singleTrackDurationTimeMs % 60000) / 1000),
				};

				const trackToQueue = new MessageEmbed()
					.setColor('GREEN')
					.setAuthor({ name: `🎵 | Adding: ${res.tracks[0].title} to queue`, iconURL: '', url: res.tracks[0].uri })
					.addField('Author', `\`\`\`\n❯❯❯ ${res.tracks[0].author}\n\`\`\``, true)
					.addField('Duration', `\`\`\`\n❯❯❯ ${singleTrackDurationTime.hours ? `${singleTrackDurationTime.hours}h ` : ''}${singleTrackDurationTime.minutes ? `${singleTrackDurationTime.minutes}m ` : ''}${singleTrackDurationTime.seconds}s\n\`\`\``, true)
					.setThumbnail(res.tracks[0].thumbnail)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [trackToQueue] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));

			case 'PLAYLIST_LOADED':
				player.queue.add(res.tracks);

				if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

				const playlistDurationTimeMs = res.playlist.duration;
				const playlistDurationTime = {
					hours: Math.floor(playlistDurationTimeMs / 3600000),
					minutes: Math.floor((playlistDurationTimeMs % 3600000) / 60000),
					seconds: Math.floor((playlistDurationTimeMs % 60000) / 1000),
				};

				const playlistToQueue = new MessageEmbed()
					.setColor('GREEN')
					.setTitle(`✅ | Adding \`${res.playlist.name}\` playlist with \`${res.tracks.length}\` tracks to queue`)
					.addField('Duration', `\`\`\`\n❯❯❯ ${playlistDurationTime.hours ? `${playlistDurationTime.hours}h ` : ''}${playlistDurationTime.minutes ? `${playlistDurationTime.minutes}m ` : ''}${playlistDurationTime.seconds}s\n\`\`\``)
					.setTimestamp()
					.setFooter({ text: `Requested by: ${res.track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [playlistToQueue] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));

			case 'SEARCH_RESULT':
				let max = 5, collected;
				const filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);

				if (res.tracks.length < max) max = res.tracks.length;

				const results = res.tracks
					.slice(0, max)
					.map((track, index) => `${++index} - \`${track.title}\``)
					.join('\n');

				message.channel.send(results);

				try {
					collected = await message.channel.awaitMessages({ filter, max: 1, time: 30e3, errors: ['time'] });
				}
				catch (e) {
					if (!player.queue.current) player.destroy();
					const noSelection = new MessageEmbed()
						.setColor('RED')
						.setTitle('❌ | No selection made')
						.setDescription('Please try again.')
						.setTimestamp()
						.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					return message.channel.send({ embeds: [noSelection] }).then(msg => {
						setTimeout(() => msg.delete(), 20000);
					}).catch(err => console.error(colors.brightRed(err)));
				}
				const first = collected.first().content;

				if (first.toLowerCase() === 'end') {
					if (!player.queue.current) player.destroy();
					const cancelledSelection = new MessageEmbed()
						.setColor('GREEN')
						.setTitle('✅ | Selection cancelled')
						.setTimestamp()
						.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					return message.channel.send({ embeds: [cancelledSelection] }).then(msg => {
						setTimeout(() => msg.delete(), 20000);
					}).catch(err => console.error(colors.brightRed(err)));
				}

				const index = Number(first) - 1;
				if (index < 0 || index > max - 1) {
					const invalidSelection = new MessageEmbed()
						.setColor('RED')
						.setTitle('❌ | Invalid selection')
						.setDescription(`The number you provided too small or too big (1-${max}).`)
						.setTimestamp()
						.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					return message.channel.send({ embeds: [invalidSelection] }).then(msg => {
						setTimeout(() => msg.delete(), 20000);
					}).catch(err => console.error(colors.brightRed(err)));
				}

				const track = res.tracks[index];
				player.queue.add(track);

				if (!player.playing && !player.paused && !player.queue.size) player.play();
				const trackDurationTimeMs = track.duration;
				const trackDurationTime = {
					hours: Math.floor(trackDurationTimeMs / 3600000),
					minutes: Math.floor((trackDurationTimeMs % 3600000) / 60000),
					seconds: Math.floor((trackDurationTimeMs % 60000) / 1000),
				};

				const addingToQueue = new MessageEmbed()
					.setColor('GREEN')
					.setAuthor({ name: `🎵 | Adding: ${track.title} to queue`, iconURL: '', url: track.uri })
					.addField('Author', `\`\`\`\n❯❯❯ ${track.author}\n\`\`\``, true)
					.addField('Duration', `\`\`\`\n❯❯❯ ${trackDurationTime.hours ? `${trackDurationTime.hours}h ` : ''}${trackDurationTime.minutes ? `${trackDurationTime.minutes}m ` : ''}${trackDurationTime.seconds}s\n\`\`\``)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [addingToQueue] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}
		}
		catch (error) {
			console.error(colors.brightRed(error));
		}
	},
};