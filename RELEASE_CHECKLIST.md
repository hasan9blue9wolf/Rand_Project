# Release Checklist

## Before Cutting A Release

- [ ] Update `APP_VERSION`, `IOS_BUILD_NUMBER`, and `ANDROID_VERSION_CODE` for the release candidate.
- [ ] Confirm `APP_VARIANT=production`, `APP_ENV=production`, `EXPO_PUBLIC_APP_MODE=live`, and `EXPO_PUBLIC_HEIA_PROVIDER=real`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test -- --runInBand`.
- [ ] Verify `npm audit --omit=dev` stays at zero runtime vulnerabilities.

## Build Commands

- [ ] `eas build --profile staging --platform ios`
- [ ] `eas build --profile staging --platform android`
- [ ] Validate staging binaries against staging services and store metadata.
- [ ] `eas build --profile production --platform ios`
- [ ] `eas build --profile production --platform android`

## Submission Commands

- [ ] `eas submit --profile production --platform ios --latest`
- [ ] `eas submit --profile production --platform android --latest`
- [ ] Attach release notes, reviewer instructions, privacy policy URL, and support contact details in each store console.

## After Submission

- [ ] Monitor App Review / Play Console policy feedback daily.
- [ ] Prepare a hotfix branch with incremented build numbers in case a store-only issue appears.
- [ ] Keep staging available for quick verification of any rejection fixes before re-submitting.
