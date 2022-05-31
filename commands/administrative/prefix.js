const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');
const db = require('better-sqlite3')(__dirname + '/../../database/database.sqlite');

module.exports = {
	name: 'prefix',
	description: 'Change the prefix of the bot',
	cooldown: 3,
	args: true,
	usage: '<prefix>',
	guildOnly: true,
	aliases: [''],
	permissions: 'ADMINISTRATOR',

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
			const prefix = args[0];

			const guildPrefix = db.prepare('SELECT prefix FROM prefixes WHERE guild_id = ?').get(message.guild.id);
			if (!guildPrefix) {
				db.prepare('INSERT INTO prefixes (guild_id, prefix) VALUES (?, ?)').run(message.guild.id, prefix);
				const changedPrefixEmbed = new MessageEmbed()
					.setColor('GREEN')
					.setTitle(`✅ | The prefix has been changed to \`${prefix}\``)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [changedPrefixEmbed] });
			}
			else {
				db.prepare('UPDATE prefixes SET prefix = ? WHERE guild_id = ?').run(prefix, message.guild.id);
				const updatedPrefixEmbed = new MessageEmbed()
					.setColor('GREEN')
					.setTitle(`✅ | The prefix has been updated to \`${prefix}\``)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.channel.send({ embeds: [updatedPrefixEmbed] });
			}
		}
		catch (error) {
			console.log(colors.brightRed(error));
		}
	},
};