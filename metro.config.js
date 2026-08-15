const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Do NOT use watchman on this machine: macOS privacy permissions (TCC) block the
// watchman daemon from opening folders under ~/Desktop, which stalls Metro's file
// crawl for ~55 minutes and then fails ("Interrupted system call"). Metro's
// built-in FSEvents/Node watcher works fine for this project.
// (Alternative: grant watchman Full Disk Access in System Settings > Privacy.)
config.resolver.useWatchman = false;

module.exports = config;
