# Telegram bot & crawler for nuaccident.com website

Each hour the bot will crawl specified website's xml's. User willbe able to get a list of those links and decide which one to save.

# Installation and local launch

1. Clone this repo: `git clone https://github.com/Moldoteck/nuaccident-crawler`
2. Launch the [mongo database](https://www.mongodb.com/) locally
3. Create `.env` with the environment variables listed below
4. Run `yarn` in the root folder
5. Run `yarn develop`

And you should be good to go! Feel free to fork and submit pull requests. Thanks!

# Environment variables

- `TOKEN` — Telegram bot token
- `ADMIN_ID` — Telegram user id of the bot admin
- `TOKEN` — Telegram bot token
- `GHTOKEN` — Github token for the bot to be able to push to the repo

Also, please, consider looking at `.env.sample`.

# License

MIT — use for any purpose. Would be great if you could leave a note about the original developers. Thanks!

Inspired from here: https://github.com/Borodutch/telegram-bot-starter
