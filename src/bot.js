"use strict";
const Db = require("./db/db");
const Twitch = require("./twitch/twitch");
const Discord = require("./discord/discord");
const Website = require("./website/website");
const Log = require("./log");

module.exports = class Bot {
	constructor(config) {
		// The 'config' object holds things like secret tokens, etc
		this.config = config;

		// Add listeners to asynchronous exit so we can clean up.
		// This needs to be done before we initialise all the other
		// modules so that the event handler gets called first.
		process.on("asyncExit", this.cleanup.bind(this));

		// Initialise all the other modules
		this.db = new Db(this);
		this.twitch = new Twitch(this);
		this.discord = new Discord(this);
		this.website = new Website(this);
		this.log = new Log(this);
	}

	run() {
		// Connect to database
		this.db.run(() => {
			// Now we're connected, initialise everything else
			this.twitch.run();  // Connects to Twitch IRC chat
			this.discord.run(); // Connects to Discord
			this.website.run(); // Starts the website HTTP server
		});
	}

	// Called when the process receives SIGINT
	cleanup(exitCode) {
		this.log.info(`Received exit code ${exitCode}, cleaning up.`);
	}
};
