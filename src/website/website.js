"use strict";
module.exports = class Website {
	constructor(bot) {
		this.bot = bot;

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	run() {
		this.bot.log.info("Starting website module.");
	}

	cleanup() {

	}
};
