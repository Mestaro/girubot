"use strict";
module.exports = class Discord {
	constructor(bot) {
		this.bot = bot;
	}

	run() {
		this.bot.log.info("Starting Discord module.");
	}
};
