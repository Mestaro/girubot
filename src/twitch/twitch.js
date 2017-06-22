"use strict";
const tmi = require("tmi.js");

module.exports = class Twitch {
	constructor(bot) {
		this.bot = bot;
	}

	run() {
		this.bot.log.info("Starting Twitch module.");
		const ircToken = this.bot.config.secrets.twitchTokenIRC;
		const clientId = this.bot.config.secrets.twitchClientID;

		// Options for tmi.js
		const options = {
			options: {
				// Identifies us to the twitch web API
				clientId,
			},
			connection: {
				// Auto-reconnect when disconnected
				reconnect: true
			},
			identity: {
				// Username and password from secrets.js
				username: "girugirubot",
				password: ircToken
			},
			channels: [ "#vkgiru" ]
		};

		if (this.bot.config.verbose) {
			// Enables verbose and coloured output from tmi.js
			options.logger = this.bot.log;
		}

		// Instantiate tmi.js client instance with given options
		this.client = new tmi.client(options);

		// Set event listeners
		// Full event list: https://docs.tmijs.org/v1.2.1/Events.html
		this.client.on("connected", this.onConnect.bind(this));
		this.client.on("disconnected", this.onDisconnected.bind(this));
		this.client.on("chat",
			(channel, from, message, self) => {
				if (!self) // Ignore messages sent by us
					this.onChat.call(this, from, message)
			}
		);

		// Actually initiate the connection
		this.client.connect();
	}

	cleanup() {
		// Disconnect when program exits
		this.client.disconnect();
	}

	// Called when the bot successfully connects to the chat
	onConnect(address, port) {
		this.bot.log.success(`Connected to Twitch IRC (${address}:${port})`);
	}

	// Called whenever a chat message is received from the IRC server
	onChat(from, message) {
		this.bot.log.info(`${from.username}: ${message}`);
	}

	// Called when the bot gets disconnected
	onDisconnected(reason) {
		this.bot.log.warn(`Disconnected from IRC: ${reason}`);
	}
};
