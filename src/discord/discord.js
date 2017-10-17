"use strict";
const discord = require("discord.js");

module.exports = class Discord {
	constructor(bot) {
		this.bot = bot;
		this.client = new discord.Client();

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	run() {
		this.bot.log.info("Starting Discord module.");

		this.client.on("ready", this.onReady.bind(this));
		this.client.on("error", this.onError.bind(this));
		this.client.on("message", this.onMessage.bind(this));
		this.client.on("disconnect", this.onDisconnect.bind(this));

		this.client.login(this.bot.config.secrets.discordToken);
	}

	onReady() {
		this.bot.log.success("Connected to Discord.");
	}

	onError(error) {
		this.bot.log.warn(`Discord error: ${error}`);
	}

	onMessage(message) {
		// Ignore messages from ourselves
		if (message.author.id === this.client.user.id)
			return;
	}

	onDisconnect(closeEvent) {
		if (closeEvent.code === 1000)
			this.bot.log.info("Disconnected from Discord.");
		else
			this.bot.log.warn("Disconnected from Discord.");
	}

	notifyStreamStart() {
		this.client.guilds.forEach((guild) => {
			const channel = guild.channels.find("name", "mordhau_room");
			if (channel)
				channel.send("Stream now online");
			else
				this.bot.log.warn("Cannot find Discord channel to broadcast to.");
		});
	}

	cleanup(exitCode, timeout, done) {
		this.client.removeAllListeners();

		this.client.destroy()
			.then(() => {
				this.bot.log.info("Disconnected from Discord.");
				done();
			})
			.catch(err => {
				this.bot.log.warn("Discord already disconnected.");
				done();
			});
	}
};
