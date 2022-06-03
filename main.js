const moment = require('moment');
require('better-logging')(console, {
	format: ctx => `${ctx.time} ${ctx.date} ${ctx.type} \u276F\u276F\u276F ${ctx.msg}`,
	saveToFile: __dirname + '/logs/' + moment().format('YYYY') + '/' + moment().format('MM') + '/' + moment().format('DD') + '.log',
});

const { Client, Collection } = require('discord.js');
const colors = require('colors/safe');
const { readdirSync } = require('fs');
require('better-sqlite3')(__dirname + '/database/database.sqlite');

require('dotenv').config({});
const config = require('./config/config.json');

const client = new Client({
	disableEveryone: true,
	intents: [
		'GUILDS',
		'GUILD_MEMBERS',
		'GUILD_BANS',
		'GUILD_EMOJIS_AND_STICKERS',
		'GUILD_INTEGRATIONS',
		'GUILD_WEBHOOKS',
		'GUILD_INVITES',
		'GUILD_VOICE_STATES',
		'GUILD_PRESENCES',
		'GUILD_MESSAGES',
		'GUILD_MESSAGE_REACTIONS',
		'DIRECT_MESSAGES',
		'DIRECT_MESSAGE_REACTIONS',
		'GUILD_SCHEDULED_EVENTS',
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});
client.commands = new Collection();
client.cooldowns = new Collection();

try {
	const handlersPath = readdirSync(__dirname + '/handlers');
	handlersPath.forEach(async (handler) => {
		try {
			await require(`./handlers/${handler}`)(client);
		}
		catch (error) {
			console.log(colors.brightRed(`Error loading ${handler}\n` + error));
		}
	});

	client.login(process.env.TOKEN || config.discord.token);
	require('./web/keepAlive')(client);
}
catch (error) {
	console.error(colors.brightRed('Error on main.js file:\n' + error));
}