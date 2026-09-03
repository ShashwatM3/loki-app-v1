# Fix the Expo simulator permission error, step by step

Your Mac is blocking your terminal from telling the Simulator app what to do. This is a one-time permission toggle, not a bug in your project. Once you flip it, this error goes away for good.

---

## Step 1: turn on the permission

- Open System Settings, go to Privacy & Security, then click Automation.
- Find your terminal app in that list (it's probably called "Terminal").
- Check the box next to "System Events" under your terminal app.
- Go back to your terminal, run `npx expo start` again, then press `i`.

---

## Step 2: only if your terminal isn't in that list at all

- Type this and hit enter: `tccutil reset AppleEvents`
- Run `npx expo start` again and press `i`.
- A popup should now appear asking for permission, click **Allow**.
- Press `i` one more time if the simulator didn't open on that same try.
