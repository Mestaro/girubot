"use strict";
module.exports = class Website {
	constructor(bot) {
		this.bot = bot;
	}

	run() {
		this.bot.log.info("Starting website module.");
	}

	cleanup() {
		
	}
};
