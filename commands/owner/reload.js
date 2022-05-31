const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');
const config = require('../../config/config.json');
const { readdirSync } = require('fs');
module.exports = {
	name: 'reload',
	description: 'Reloads a command.',
	cooldown: 0,
	args: true,
	usage: '<command>',
	guildOnly: false,
	aliases: ['rel'],

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
			const ownerUsers = config.discord.ownerid;
			if (!ownerUsers.includes(message.author.id)) {
				return console.warn(colors.red(`[${message.author.tag}] tried to use the reload command.`));
			}

			const commandName = args[0].toLowerCase();
			const command = message.client.commands.get(commandName)
                    || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) {
				const undefinedCmd = new MessageEmbed()
					.setColor('RED')
					.setTitle(`❌ | There is no command with name or alias \`${commandName}\` !`)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.reply({ embeds: [undefinedCmd] });
			}

			const commandFolders = readdirSync(__dirname + '/../../commands/');
			const folderName = commandFolders.find(folder => readdirSync(`./commands/${folder}`).includes(`${command.name}.js`));

			delete require.cache[require.resolve(`../${folderName}/${command.name}.js`)];

			try {
				const newCommand = require(`../${folderName}/${command.name}.js`);
				message.client.commands.set(newCommand.name, newCommand);
				message.react('✅');
				console.log(colors.green(`[${message.author.tag}] reloaded the command \`${command.name}\`.`));
			}
			catch (error) {
				message.react('❌');
				console.error(colors.brightRed(error));
				const reloadError = new MessageEmbed()
					.setColor('RED')
					.setTitle(`❌ | There was an error while reloading the command \`${command.name}\` !`)
					.setDescription(`\`\`\`\n${error}\`\`\``)
					.setTimestamp()
					.setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) });
				return message.reply({ embeds: [reloadError] });
			}
		}
		catch (error) {
			console.log(colors.brightRed(error));
		}
	},
};