"use strict";
const mongoose = require("mongoose");

module.exports = class Db {
	constructor(bot) {
		this.bot = bot;
		this.connection = mongoose.createConnection();

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	// Initiate the connection, running the callback when done
	run(callback) {
		const url = this.bot.config.dbUrl;
		this.bot.log.info(`Connecting to database: ${url}`);

		// Add event listeners
		this.connection.on("error", this.onError.bind(this));
		this.connection.on("close", this.onClose.bind(this));
		this.connection.on("open",
			() => this.onOpen.call(this, callback)
		);

		// Open the database connection, passing in our credentials
		this.connection.open(url, {
			user: this.bot.config.secrets.dbUsername,
			pass: this.bot.config.secrets.dbPassword
		});
	}

	// Called when the program exits
	cleanup(exitCode, timeout, done) {
		// Remove normal event listener
		this.connection.removeAllListeners("close");

		// Close the database connection
		this.connection.close(() => {
			this.bot.log.info("Disconnected from DB.");
			done();
		});
	}

	// Perform initialisation, then invoke the user callback
	onOpen(callback) {
		this.bot.log.success("Successfully opened database connection");
		callback();
	}

	//
	onError(err) {
		this.bot.log.error(`Database connection error: ${err}`);
		this.bot.log.debug("Ensure all the DB details are correct.");
	}

	// Called when the connection unexpectedly closes
	onClose() {
		this.bot.log.warn("Disconnected from DB: connection closed.");
	}

}
