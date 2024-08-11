# AlphaBeta

Make your beta more alpha.

## Setup

Install dependencies. You should be using Node v20.14.0.

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
node --env-file=.env build
```
