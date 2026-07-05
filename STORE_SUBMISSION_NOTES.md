# Store Submission Notes

## Current Launch Setup

- `development`, `staging`, and `production` now build as separate native variants.
- `staging` and `production` use different bundle/package identifiers so they can be installed side-by-side.
- The unused microphone permission and iOS microphone usage string were removed because the current codebase does not record audio.
- Notifications remain enabled because the app schedules local travel reminders through `expo-notifications`.

## Apple App Store Notes

- The app currently supports iPad, so iPad screenshots are required in App Store Connect.
- A privacy policy URL is mandatory in App Store Connect and is still a business-side input for this repo.
- App Privacy answers must reflect both first-party behavior and third-party SDK behavior.
- Review notes should explain that the app supports both demo and live modes, and that production submission should use `EXPO_PUBLIC_APP_MODE=live`.
- If Apple asks about encryption, verify the answer with legal/compliance for your organization before submission.

## Google Play Notes

- The main store listing needs an app icon, feature graphic, and at least two screenshots to publish.
- Google strongly recommends at least four high-resolution screenshots for app merchandising placements.
- The Data safety form is required for published apps and must include third-party SDK data handling where applicable.
- Internal testing can be used before production rollout, but production metadata and policy forms still need to be accurate before release.

## Remaining Business Inputs

- Final privacy policy URL
- Support email and/or support site URL
- Final marketing copy for Apple and Google
- Final screenshot set and feature graphic
- Final reviewer/tester credentials if any live flow requires a gated account

## Official References

- Expo app variants: https://docs.expo.dev/build-reference/variants/
- Expo EAS environments: https://docs.expo.dev/eas/environment-variables/
- Apple screenshot specs: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications
- Apple app privacy: https://developer.apple.com/app-store/app-privacy-details/
- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151?hl=en
- Google Play publishing flow: https://support.google.com/googleplay/android-developer/answer/9859751?hl=en
- Google Play Data safety: https://support.google.com/googleplay/android-developer/answer/10787469?hl=en
