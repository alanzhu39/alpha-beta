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

The `setup` script installs Python dependencies, builds the application, and sets up the `systemd` service for running the AlphaBeta application.
The `run` script activates the Python virtual environment and starts the standalone Node service.

```bash
# You may have to remove `package-lock.json` when installing dependencies on certain deployment platforms
# You may also need to run this with `sudo` to complete the systemd service setup
scripts/setup.sh

scripts/run.sh
```

### `systemd` service

We use `systemd` to start a service that keeps the AlphaBeta Node process running constantly in the background.
The service will restart on failures, and also is configured to run on startup
(via `multi-user.target` which specifies a step in the boot process that the service will start at).
To use the AlphaBeta `systemd` service:

Start:

```bash
# These commands should be run after running setup script
sudo systemctl daemon-reload
sudo systemctl enable alphabeta.service
sudo systemctl start alphabeta.service
```

Stop:

```bash
sudo systemctl stop alphabeta.service

# Disable starting the service on boot
sudo systemctl disable alphabeta.service
```

View logs:

```bash
sudo journalctl -u alphabeta.service
```
