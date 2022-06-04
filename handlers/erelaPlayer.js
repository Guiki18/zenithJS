/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
/* eslint-disable no-case-declarations */
const { Manager } = require('erela.js');
const config = require('../config/config.json');
const colors = require('colors/safe');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const Spotify = require('erela.js-spotify');

const db = require('better-sqlite3')('./database/database.sqlite');
db.prepare('CREATE TABLE IF NOT EXISTS musicPlayer (channelid TEXT, guildid TEXT, messageid TEXT)').run();


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
		.on('trackStart', async (player, track) => {
			const channel = client.channels.cache.get(player.textChannel);
			const durationTimeMs = track.duration;
			const durationTime = {
				hours: Math.floor(durationTimeMs / 3600000),
				minutes: Math.floor((durationTimeMs % 3600000) / 60000),
				seconds: Math.floor((durationTimeMs % 60000) / 1000),
			};


			const buttonsFirstLine = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('back')
						.setLabel('⏮️')
						.setStyle('PRIMARY'),
					new MessageButton()
						.setCustomId('pause')
						.setLabel('⏸️')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('resume')
						.setLabel('▶')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('repeat')
						.setLabel('🔁')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('next')
						.setLabel('⏭️')
						.setStyle('PRIMARY'),
				);

			const buttonsSecoundLine = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('mute')
						.setLabel('🔇')
						.setStyle('DANGER'),
					new MessageButton()
						.setCustomId('vdown')
						.setLabel('🔉')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('vup')
						.setLabel('🔊')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('queue')
						.setLabel('📜')
						.setStyle('SUCCESS'),
					new MessageButton()
						.setCustomId('stop')
						.setLabel('⏹️')
						.setStyle('DANGER'),
				);

			if (player.pause === true) {
				playerStatus = 'Paused';
			}
			else {
				playerStatus = 'Playing';
			}

			const trackStart = new MessageEmbed()
				.setColor('BLUE')
				.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
				.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
				.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
				.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
				.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
				.setThumbnail(track.thumbnail)
				.setTimestamp()
				.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
			const msgCollector = await channel.send({ embeds: [trackStart], components: [buttonsFirstLine, buttonsSecoundLine] });
			const msgId = msgCollector.id;

			const searchFromData = db.prepare('SELECT * FROM musicPlayer WHERE guildid = ?').get(player.guild);
			if (!searchFromData) {
				await db.prepare('INSERT INTO musicPlayer (channelid, guildid, messageid) VALUES (?, ?, ?)').run(player.textChannel, player.guild, msgId).toString();
			}
			await db.prepare('UPDATE musicPlayer SET messageid = ? WHERE guildid = ?').run(msgId.toString(), player.guild);

			const collector = msgCollector.createMessageComponentCollector({ componentType: 'BUTTON' });
			collector.on('collect', async (collected) => {
				switch (collected.customId) {
				case 'back':
					await player.seek(0);
					await collector.stop();
					await msgCollector.delete();
					break;
				case 'pause':
					await player.pause(true);
					const pauseUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [pauseUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'resume':
					await player.pause(false);
					const resumeUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [resumeUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'repeat':
					await player.setTrackRepeat(!player.trackRepeat);
					const repeatUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [repeatUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'next':
					await player.stop();
					await collector.stop();
					await msgCollector.delete();
					break;
				case 'mute':
					await player.setVolume(0);
					const muteUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [muteUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'vdown':
					await player.setVolume(player.volume - 5);
					const vDownUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [vDownUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'vup':
					await player.setVolume(player.volume + 5);
					const vUpUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [vUpUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'queue':
					const queue = player.queue;
					const embed = new MessageEmbed()
						.setTitle(`Queue (${queue.length} tracks`);

					const multiple = 10;
					const page = 1;

					const end = page * multiple;
					const start = end - multiple;

					const tracks = queue.slice(start, end);

					if (queue.current) embed.addField('Current', `[${queue.current.title}](${queue.current.uri})`);

					if (!tracks.length) embed.setDescription(`No tracks in ${page > 1 ? `page ${page}` : 'the queue'}.`);
					else embed.setDescription(tracks.map((trackQ, i) => `${start + (++i)} - [${trackQ.title}](${trackQ.uri})`).join('\n'));

					const maxPages = Math.ceil(queue.length / multiple);

					embed.setFooter({ text: `Page ${page > maxPages ? maxPages : page} of ${maxPages}` });

					await channel.send({ embeds: [embed] });
					const queueUpdatedEmbed = new MessageEmbed()
						.setColor('BLUE')
						.setAuthor({ name: `🎵 | Now Playing: ${track.title}`, iconURL: '', url: track.uri })
						.addField('**Author**', '```\n❯❯❯ ' + track.author + '\n```', true)
						.addField('Duration', `\`\`\`\n❯❯❯ ${durationTime.hours ? `${durationTime.hours}h ` : ''}${durationTime.minutes ? `${durationTime.minutes}m ` : ''}${durationTime.seconds}s\n\`\`\``, true)
						.addField('**Status**', '```\n❯❯❯ ' + playerStatus + '\n\`\`\`', false)
						.addField('**Volume**', '```\n❯❯❯ ' + player.volume + '%\n\`\`\`', true)
						.setThumbnail(track.thumbnail)
						.setTimestamp()
						.setFooter({ text: `Requested by: ${track.requester.tag}`, iconURL: track.requester.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					await collected.update({ embeds: [queueUpdatedEmbed], components: [buttonsFirstLine, buttonsSecoundLine] });
					break;
				case 'stop':
					await player.destroy();
					await collector.stop();
					await msgCollector.delete();
					break;
				}
				client.manager.on('trackEnd', async (playerT) => {
					const data = db.prepare('SELECT * FROM musicPlayer WHERE guildid = ?').get(playerT.guild);
					const messageToUpdate = client.channels.cache.get(data.messageid);
					if (!messageToUpdate) {return;}
					else {
						await collector.stop();
						await messageToUpdate.delete();
					}
				});
			});
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