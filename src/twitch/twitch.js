"use strict";
const tmi = require("tmi.js");
const Bottleneck = require("bottleneck");

module.exports = class Twitch {
	constructor(bot) {
		this.bot = bot;

		// Initialise a new rate limiter so that we don't spam the IRC
		// with messages. Our rate limit depends on whether we're a
		// moderator in the channel or not. Currently, the limit for
		// moderators is 100 commands or messages per 30 seconds, but
		// for normal users this is 20 messages in the same time.
		// See https://help.twitch.tv/customer/portal/articles/1302780-twitch-irc
		// TODO: Check if we're actually a moderator and edit this limit
		this.limiter = new Bottleneck(1, 500);

		this.streamRunning = false;

		// Add close event listener
		process.on("asyncExit", this.cleanup.bind(this));
	}

	run() {
		this.bot.log.info("Starting Twitch module.");
		const ircToken = this.bot.config.secrets.twitchTokenIRC;
		const clientId = this.bot.config.secrets.twitchClientID;

		// Options for tmi.js
		const options = {
			options: {
				// Identifies us to the twitch web API
				clientId
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
					this.onChat.call(this, from, message);
			}
		);

		this.pollStreamData(true);
		setInterval(this.pollStreamData.bind(this, false), this.bot.config.streamPollInterval * 1000);

		// Actually initiate the connection
		this.client.connect();
	}

	// Checks to see if the stream is online or offline
	pollStreamData(noAction) {
		this.client.api({
			url: "https://api.twitch.tv/helix/streams?user_login=vkgiru",
			headers: { "Client-ID": this.bot.config.secrets.twitchClientID },
			method: "GET"
		}, (err, res, body) => {
			if (err) {
				this.bot.log.warn("Failed to get Twitch stream information.");
			} else {
				if ((body.data.length === 0 || body.data[0].type !== "live") && this.streamRunning) {
					this.streamRunning = false;
					if (!noAction)
						this.streamOffline();
				} else if ((body.data.length > 0 && body.data[0].type === "live") && !this.streamRunning) {
					this.streamRunning = true;
					if (!noAction)
						this.streamOnline();
				}
			}
		});
	}

	// Called when the stream goes offline
	// Note: also gets called when bot comes online for the first time.
	streamOffline() {
		this.bot.log.info("Stream now offline.");
	}

	// Called when the stream goes online
	streamOnline() {
		this.bot.log.info("Stream now online.");
		this.bot.discord.notifyStreamStart();
	}

	// Called when the program exits
	cleanup(exitCode, timeout, done) {
		// Remove the normal disconnected listener
		this.client.removeAllListeners("disconnected");

		// Disconnect from chat
		this.client.disconnect()
			.then(() => {
				this.bot.log.info("Disconnected from IRC.");
				done();
			})
			.catch(err => {
				this.bot.log.warn("IRC already disconnected.");
				done();
			});
	}

	// Sends a message to the IRC channel
	say(text) {
		// Make sure our messages are rate limited (see constructor)
		// TODO: Can we clean this up?
		var self = this;
		function sayWrapper(msg) {
			return self.client.say("vkgiru", msg)
				.catch(err => {
					self.bot.log.warn("Chat message failed to send.");
				});
		}
		this.limiter.schedule(sayWrapper, text);
	}

	// Called when the bot successfully connects to the chat
	onConnect(address, port) {
		this.bot.log.success(`Connected to IRC (${address}:${port})`);
	}

	// Called whenever a chat message is received from the IRC server
	onChat(from, message) {
		//this.say(`${from.username}: ${message}`);
	}

	// Called when the bot gets disconnected
	onDisconnected(reason) {
		this.bot.log.warn(`Disconnected from IRC: ${reason}`);
	}
};
