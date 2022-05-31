const { MessageEmbed } = require('discord.js');
const colors = require('colors/safe');
const config = require('../../config/config.json');
const { readdirSync } = require('fs');
module.exports = {
	name: 'load_cmd',
	description: 'Load a command.',
	cooldown: 0,
	args: true,
	usage: '<command>',
	guildOnly: false,
	aliases: ['load_command'],

	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
		try {
			const ownerUsers = config.discord.ownerid;
			if (!ownerUsers.includes(message.author.id)) {
				return console.warn(colors.red(`[${message.author.tag}] tried to use the load command.`));
			}

			const command = args[0].toLowerCase();

			const commandFolders = readdirSync(__dirname + '/../../commands/');
			const folderName = commandFolders.find(folder => readdirSync(`./commands/${folder}`).includes(`${command}.js`));

			try {
				delete require.cache[require.resolve(`../${folderName}/${command}.js`)];
				const newCommand = require(`../${folderName}/${command}.js`);
				message.client.commands.set(newCommand.name, newCommand);
				message.react('✅');
				console.log(colors.green(`[${message.author.tag}] loaded the command \`${command.name}\`.`));
			}
			catch (error) {
				message.react('❌');
				console.error(colors.brightRed(error));
				const reloadError = new MessageEmbed()
					.setColor('RED')
					.setTitle(`❌ | There was an error while loading the command \`${command.name}\` !`)
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