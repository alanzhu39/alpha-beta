#!/usr/bin/env bash

# Activate python venv
python3 -m venv env
source env/bin/activate

# Install python dependencies
pip3 install -r requirements.txt

# Deactivate venv
deactivate

# Install node dependencies
npm ci

# Build svelte project
npm run build
