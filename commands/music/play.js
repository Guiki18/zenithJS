/* eslint-disable no-case-declarations */
const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

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
					.setFooter({ text: `Requested by: ${res.playlist.requester.tag}`, iconURL: res.playlist.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [playlistToQueue] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));

			case 'SEARCH_RESULT':
				const selectMenu = new MessageActionRow()
					.addComponents(
						new MessageSelectMenu()
							.setCustomId('selectmenu')
							.setPlaceholder('Please select a track to add to the queue')
							.addOptions([
								{
									label: `1 - ${res.tracks[0].title}`,
									description: `Author: ${res.tracks[0].author} | Duration: ${res.tracks[0].duration}`,
									value: '1',
								},
								{
									label: `2 - ${res.tracks[1].title}`,
									description: `Author: ${res.tracks[1].author} | Duration: ${res.tracks[1].duration}`,
									value: '2',
								},
								{
									label: `3 - ${res.tracks[2].title}`,
									description: `Author: ${res.tracks[2].author} | Duration: ${res.tracks[2].duration}`,
									value: '3',
								},
								{
									label: `4 - ${res.tracks[3].title}`,
									description: `Author: ${res.tracks[3].author} | Duration: ${res.tracks[3].duration}`,
									value: '4',
								},
								{
									label: `5 - ${res.tracks[4].title}`,
									description: `Author: ${res.tracks[4].author} | Duration: ${res.tracks[4].duration}`,
									value: '5',
								},
							]),
					);

				const selectMenuEmbed = new MessageEmbed()
					.setTitle('🔍 | Search Results')
					.setDescription('Select a track to add to the queue above on menu')
					.setColor('GREEN')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				const selectMsg = await message.channel.send({ embeds: [selectMenuEmbed], components: [selectMenu] });

				// make select menu collector
				const collector = selectMsg.createMessageComponentCollector({ max: 1, componentType: 'SELECT_MENU', time: 15000 });
				// eslint-disable-next-line no-undef
				collector.on('collect', m => {
					if (m.content === 'end') {
						collector.stop();
						selectMsg.delete();
						return message.react('👌🏻');
					}
					else {
						console.log(m.values);

						const index = Number(m.values) - 1;
						const track = res.tracks[index];
						player.queue.add(track);

						if (!player.playing && !player.paused && player.queue.totalSize === 1) player.play();

						const singleTrackToQueue = new MessageEmbed()
							.setColor('GREEN')
							.setTitle(`✅ | Adding \`${track.title}\` to queue`)
							.setThumbnail(track.thumbnail)
							.setTimestamp()
							.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
						return selectMsg.edit({ embeds: [singleTrackToQueue], components: [] }).then(msg => {
							setTimeout(() => msg.delete(), 20000);
						}).catch(err => console.error(colors.brightRed(err)));
					}
				});
			}
		}
		catch (error) {
			console.error(colors.brightRed(error));
		}
	},
};