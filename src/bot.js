"use strict";
const Twitch = require("./twitch/twitch");
const Discord = require("./discord/discord");
const Website = require("./website/website");
const Log = require("./log");

module.exports = class Bot {
	constructor(config) {
		// Initialise member variables here
		this.config = config;
		this.twitch = new Twitch(this);
		this.discord = new Discord(this);
		this.website = new Website(this);
		this.log = new Log(this);
	}

	run() {
		// Run bot from here
		this.twitch.run();
		this.discord.run();
		this.website.run();
	}
};
