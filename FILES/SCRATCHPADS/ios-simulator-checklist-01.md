# iOS Simulator checklist for loki-app

Because AGENTS.md commits this project to Expo Go only, there is no ios/ folder and no native build step ever runs on your machine. That removes most of the heavy tooling a normal React Native project needs, things like CocoaPods, a full native Xcode build, or a paid Apple developer profile. What running the app in the iOS Simulator actually requires is narrower than that: the Simulator application itself, at least one iOS runtime image for it to boot, and your project's own Metro dev server that Expo Go talks to over the network. Xcode is the single piece that supplies both the Simulator app and the runtime images, so it cannot be skipped, but nothing beyond Xcode plus the Node tooling you already have is needed.

---

## Core requirements

- **Xcode.app itself** (the full app, not just the standalone Command Line Tools package), since it is what installs Simulator.app and the iOS runtime images. Check: `xcodebuild -version`
- **xcode-select pointing at Xcode** rather than at a bare Command Line Tools install, because `xcrun simctl` and other simulator commands fail otherwise. Check: `xcode-select -p`
- **The Xcode first-launch license and extra components accepted.** Check: `sudo xcodebuild -checkFirstLaunchStatus`
- **At least one iOS Simulator runtime downloaded**, since modern Xcode ships without one and you add it from Xcode > Settings > Platforms. Check: `xcrun simctl list runtimes`
- **At least one simulator device configured** against that runtime. Check: `xcrun simctl list devices available`

---

## Things you do not need for this project

- **CocoaPods.** There is no ios/ folder and no prebuild step, so `pod install` never runs. Check anyway if curious: `pod --version`
- **Watchman.** AGENTS.md notes it is broken on this machine and `metro.config.js` already sets `resolver.useWatchman = false`, so leave it uninstalled.
- **An Apple Developer account or code signing.** Those only matter for a standalone or dev-client build, not for Expo Go.

---

## Node and Expo tooling you already need

- **Node.js and npm**, since the whole project runs through them. Check: `node -v && npm -v`
- **The Expo CLI**, which runs through `npx` from the project's own installed package rather than needing a global install. Check (from inside loki-app): `npx expo --version`

---

## If something is missing

The simplest path is installing Xcode from the Mac App Store, which is a large download (room for 20 to 40 GB free is a safe estimate) but is the only source for the Simulator and its runtimes. Once Xcode is installed, if `xcode-select` still points at the old Command Line Tools path, fix it with: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`, then re-run the first-launch and runtime checks above.
