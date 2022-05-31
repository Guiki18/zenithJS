const colors = require('colors/safe');
const { Collection, MessageEmbed } = require('discord.js');
const config = require('../../config/config.json');
const db = require('better-sqlite3')(__dirname + '/../../database/database.sqlite');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		try {
			let prefix;
			const dbPrefix = db.prepare('SELECT * FROM prefixes WHERE guild_id = ?').get(message.guild.id);
			if (!dbPrefix) {
				prefix = config.discord.prefix;
			}
			else {
				prefix = dbPrefix.prefix;
			}

			if (!message.content.startsWith(prefix) || message.author.bot) return;


			const args = message.content.slice(prefix.length).trim().split(/ +/);
			const commandName = args.shift().toLowerCase();

			const command = client.commands.get(commandName)
                || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) return;

			if (command.guildOnly && message.channel.type === 'DM') {
				const notDmCmd = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | This command is only available in a server.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.reply({ embeds: [notDmCmd] });
			}

			if (message.channel.type == 'DM') {
				console.log(colors.green('[DM] ') + colors.cyan(`[${message.author.tag + ' - ' + message.author.id}] `) + colors.white(`: ${command.name}`));
			}
			else {
				console.log(colors.green(`[${message.guild.name + ' - ' + message.guild.id}] `) + colors.yellow(`[${message.channel.name + ' - ' + message.channel.id}] `) + colors.cyan(`[${message.author.tag + ' - ' + message.author.id}] `) + colors.white(`: ${command.name}`));
			}

			if (command.permissions) {
				const authorPerms = message.channel.permissionsFor(message.author);
				if (!authorPerms || !authorPerms.has(command.permissions)) {
					const noPermsCmd = new MessageEmbed()
						.setColor('RED')
						.setTitle('❌ | You do not have the required permissions to use this command.')
						.setTimestamp()
						.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					return message.reply({ embeds: [noPermsCmd] });
				}
			}

			if (command.args && !args.length) {
				const noArgsCmd = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | This command requires arguments.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				if (command.usage) {
					noArgsCmd.setDescription(`The proper usage would be: \`${prefix}${command.name} ${command.usage}\``);
				}
				return message.reply({ embeds: [noArgsCmd] });
			}

			const { cooldowns } = client;

			if (!cooldowns.has(command.name)) {
				cooldowns.set(command.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.name);
			const cooldownAmount = (command.cooldown || 3) * 1000;

			if (timestamps.has(message.author.id)) {
				const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

				if (now < expirationTime) {
					const timeLeft = (expirationTime - now) / 1000;
					const cooldownCmd = new MessageEmbed()
						.setColor('RED')
						.setTitle('❌ | You must wait **' + timeLeft.toFixed(1) + '** seconds before using this command again.')
						.setTimestamp()
						.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
					return message.reply({ embeds: [cooldownCmd] });
				}
			}

			timestamps.set(message.author.id, now);
			setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

			try {
				command.execute(client, message, args);
			}
			catch (error) {
				console.error(colors.brightRed('Error executing command:\n' + error));
				const errorCmd = new MessageEmbed()
					.setColor('RED')
					.setTitle('❌ | There was an error trying to execute this command.')
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.reply({ embeds: [errorCmd] });
			}
		}
		catch (err) {
			console.error(colors.brightRed('Error on ' + this.name + ' event file:\n' + err.stack));
		}
	},
};