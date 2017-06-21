"use strict";
module.exports = class Twitch {
	constructor(bot) {
		this.bot = bot;
	}

	run() {
		this.bot.log.info("Starting Twitch module.");
	}
};
