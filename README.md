# GiruBot (v2)

This repository contains the code for the Discord, Twitch chat and [website](http://vkclan.eu) portions of GiruBot.

The bot uses Node.js and MongoDB, so you'll need both of those to run the bot. You'll also need to fill out the correct details for the bot in the `secrets.js` file.

Note: in places, the source code may look unnaturally formatted. This is because I try to ensure that the code does not extend past 80 characters (when using 8-spaced tabs). I would encourage contributors to adhere to the same limit since this ensures that formatting is clear across all editors.

To run the bot (OSX, Unix only):

```bash
git clone https://github.com/64/girubot
cd girubot
npm install # You can safely ignore the warnings about missing packages
npm start
```
