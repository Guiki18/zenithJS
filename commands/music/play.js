/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable no-case-declarations */
const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

const msToTime = function(duration) {
	  // const milliseconds = parseInt((duration % 1000) / 100);
	  const seconds = parseInt((duration / 1000) % 60);
	  const minutes = parseInt((duration / (1000 * 60)) % 60);
	  const hours = parseInt((duration / (1000 * 60 * 60)) % 24);

	  return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
};

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
					.setTimestamp();
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
					.setTimestamp();
				return message.channel.send({ embeds: [searchingError] }).then(msg => {
					setTimeout(() => msg.delete(), 20000);
				}).catch(err => console.error(colors.brightRed(err)));
			}

			try {
				switch (res.loadType) {
				case 'NO_MATCHES':
					if (!player.queue.current) player.destroy();
					const noMatches = new MessageEmbed()
						.setColor('RED')
						.setTitle('❌ | No matches found')
						.setDescription('Please try again with a different search term.')
						.setTimestamp();
					return message.channel.send({ embeds: [noMatches] }).then(msg => {
						setTimeout(() => msg.delete(), 20000);
					}).catch(err => console.error(colors.brightRed(err)));

				case 'TRACK_LOADED':
					player.queue.add(res.tracks[0]);

					if (!player.playing && !player.paused && !player.queue.size) player.play();

					const trackToQueue = new MessageEmbed()
						.setColor('GREEN')
						.setAuthor({ name: `🎵 | Adding: ${res.tracks[0].title} to queue`, iconURL: '', url: res.tracks[0].uri })
						.addField('Author', `\`\`\`\n❯❯❯ ${res.tracks[0].author}\n\`\`\``, true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${(await msToTime(res.tracks[0].duration)).toString()}\n\`\`\``, true)
						.setThumbnail(res.tracks[0].thumbnail)
						.setTimestamp();
					return message.channel.send({ embeds: [trackToQueue] }).then(msg => {
						setTimeout(() => msg.delete(), 20000);
					}).catch(err => console.error(colors.brightRed(err)));

				case 'PLAYLIST_LOADED':
					player.queue.add(res.tracks);

					if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();

					const playlistToQueue = new MessageEmbed()
						.setColor('GREEN')
						.setTitle(`✅ | Adding \`${res.playlist.name}\` playlist with \`${res.tracks.length}\` tracks to queue`)
						.addField('Duration', `\`\`\`\n❯❯❯ ${(await msToTime(res.playlist.duration)).toString()}\n\`\`\``)
						.setTimestamp();
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
									// TODO: Convert MS to HH:MM:SS of a track duration
									{
										emoji: '1️⃣',
										label: `${res.tracks[0].title.substring(0, 95)}`,
										description: `Author: ${res.tracks[0].author} | Duration: ${(await msToTime(res.tracks[0].duration)).toString()}`,
										value: '1',
									},
									{
										emoji: '2️⃣',
										label: `${res.tracks[1].title.substring(0, 95)}`,
										description: `Author: ${res.tracks[1].author} | Duration: ${(await msToTime(res.tracks[1].duration)).toString()}`,
										value: '2',
									},
									{
										emoji: '3️⃣',
										label: `${res.tracks[2].title.substring(0, 95)}`,
										description: `Author: ${res.tracks[2].author} | Duration: ${(await msToTime(res.tracks[2].duration)).toString()}`,
										value: '3',
									},
									{
										emoji: '4️⃣',
										label: `${res.tracks[3].title.substring(0, 95)}`,
										description: `Author: ${res.tracks[3].author} | Duration: ${(await msToTime(res.tracks[3].duration)).toString()}`,
										value: '4',
									},
									{
										emoji: '5️⃣',
										label: `${res.tracks[4].title.substring(0, 95)}`,
										description: `Author: ${res.tracks[4].author} | Duration: ${(await msToTime(res.tracks[4].duration)).toString()}`,
										value: '5',
									},
									{
										emoji: '❌',
										label: 'Cancel the Search',
										value: '6',
									},
								]),
						);

					const selectMenuEmbed = new MessageEmbed()
						.setTitle('🔍 | Search Results')
						.setDescription('Select a track to add to the queue above on menu')
						.setColor('GREEN')
						.setTimestamp();
					const selectMsg = await message.channel.send({ embeds: [selectMenuEmbed], components: [selectMenu] });

					const collector = selectMsg.createMessageComponentCollector({ max: 1, componentType: 'SELECT_MENU', time: 30000 });
					// eslint-disable-next-line no-undef
					collector.on('collect', m => {
						if (Number(m.values) === 6) {
							collector.stop();
							selectMsg.delete();
							return message.react('👌🏻');
						}
						else {
							const index = Number(m.values) - 1;
							const track = res.tracks[index];
							player.queue.add(track);

							if (!player.playing && !player.paused && player.queue.totalSize === 1) player.play();

							const singleTrackToQueue = new MessageEmbed()
								.setColor('GREEN')
								.setAuthor({ name: `🎵 | Adding: ${track.title} to queue`, iconURL: '', url: track.uri })
								.addField('Duration', `\`\`\`\n❯❯❯ ${(msToTime(track.duration)).toString()}\n\`\`\``)
								.setThumbnail(track.thumbnail)
								.setTimestamp();
							return selectMsg.edit({ embeds: [singleTrackToQueue], components: [] }).then(msg => {
								setTimeout(() => msg.delete(), 20000);
							}).catch(err => console.error(colors.brightRed(err)));
						}
					});
				}
			}
			catch (error) {
				console.error(colors.brightRed(error));
				return message.react('❌');
			}
		}
		catch (error) {
			console.error(colors.brightRed(error));
		}
	},
};