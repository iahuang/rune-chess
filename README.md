# rune-chess

A Discord game based on Chess and Teamfight Tactics from League of Legends

This project's source code and assets are licensed under the MIT License. All other characters, art, and trademarks belong to Riot Games.

## Build from Source

```
npm install
tsc
npm start
```

### Troubleshooting

**`npm install` fails with an error about `node-gyp`**
- Run `rm -rf node_modules` to clean the current installation
- **Ubuntu/WSL:** `sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev`
- **Mac OS X:** `brew install pkg-config cairo pango libpng jpeg giflib librsvg`

*See the `node-canvas` [README](https://www.npmjs.com/package/canvas) for more information*
- Retry `npm install`

## Configuration

On first run of the application, a `bot_config.json` file will be created, in which you should put your [Discord API key](https://discord.com/developers/docs/intro). Graphics and rendering configuration can be found at `gfx_config.json`
