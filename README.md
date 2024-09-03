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

# use the `host` flag to allow other devices on your local network to connect to the dev server
# useful for testing on mobile devices
npm run dev:host
```

## Building

Create a production build. The app should be build using `@sveltejs/adapter-node`.

```bash
npm run build
```

## Deployment

### Setup

The `setup` script installs Python and Node dependencies and generates a production build of the application.

```bash
scripts/setup.sh
```

### Running the app

#### Using the `systemd` service

We use `systemd` to start a service that keeps the AlphaBeta Node process running constantly in the background.
The service will restart on failures, and is also configured to run on system startup
(via `multi-user.target` which specifies a step in the boot process that the service will start at).
To use the AlphaBeta `systemd` service:

Setup:

```bash
# These commands should be run after running the `setup.sh` script
sudo cp scripts/alphabeta.service /etc/systemd/system/
```

Start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable alphabeta.service
sudo systemctl start alphabeta.service

# Restart
sudo systemctl restart alphabeta.service
```

Continuous deployment:

```bash
scripts/setup.sh

# Restart
sudo systemctl restart alphabeta.service
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

#### Run the Node server by itself

```bash
node build

# to include environment variable definitions
node -r dotenv/config build
# for Node v20.6+
node --env-file=.env build
```

Or, using a single script

```bash
scripts/run.sh
```
