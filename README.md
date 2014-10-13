# manylines

Explore networks and publish narratives.

## Installation

### 1) Node.js

manylines runs on Node.js. If you do not have it installed yet, refer to its [website](http://nodejs.org/).

### 2) Couchbase

If you do not have an instance of Couchbase running, you'll have to install one or decide to work on a Mock and skip this step. Note that in Mock mode, graphs will be deleted when the application stops.

*Example for Debian/Ubuntu*

```bash
# Downloading package
wget http://packages.couchbase.com/releases/2.2.0/couchbase-server-community_2.2.0_x86_64.deb

# Installing package
sudo dpkg -i couchbase-server-community_2.2.0_x86_64.deb

# Then go to localhost:8091 to setup
```

For other distributions, please refer to the couchbase [site](http://www.couchbase.com/).

**N.B.**: manylines currently uses a 2.x.x version of Couchbase.

### 3) Application

```bash
# Clone the app
git clone git@github.com:medialab/manylines.git

# Install its dependencies
npm install

# Copy the sample config and fill in the needed information
cp config.sample.json config.json
```

## Usage

### Starting the app

*For development*

```bash
npm start
```

*For production*

```bash
# Build assets
gulp

# Starting app
NODE_ENV='prod' npm start
```

The application will then be available through `server:8000/app`.
