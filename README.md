# AlphaBeta

Make your beta more alpha.

## Setup

Install dependencies.

```bash
npm install
```

## Developing

Start the development server.

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Create a production build. The app should be build using `@sveltejs/adapter-node`.

```bash
npm run build
```

## Deploying

Deploy to a Node server.

```bash
node build

# to include environment variable definitions
node -r dotenv/config build
# for Node v20.6+
node --env-file=.env build
```

Using deployment scripts.

```bash
# You may have to remove `package-lock.json` when installing dependencies on certain deployment platforms
scripts/setup.sh

scripts/run.sh
```
