## SNX Perps Keeper on Sui

This is a keeper for the Synthetix perps protocol on Sui. It keeps watch over the protocol by executing orders and performing liquidations.

-   Make sure to copy `.env.sample` into your own `.env` and set the relevant environment variables
-   `npm install`
-   Run locally: `npm run dev`
-   Run in production: `npm run build`, `npm run start`

### Adding a new market

-   The definitions for the markets that the keeper watches are in `markets.ts`
-   To add a new market, create a new `Market` object in `markets.ts` and add it to the `SUPPORTED_MARKETS` array
-   After restarting the bot, the keeper will automatically start processing orders and liquidations in that market
