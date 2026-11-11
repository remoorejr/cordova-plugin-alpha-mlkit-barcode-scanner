# Changes

All changes made to this fork since version 3.0.7 of `cordova-plugin-mlkit-barcode-scanner`,
newest first. Everything below is on the `dev` branch.

## Upgrading from 3.x

- **Requires `cordova-android >=14.0.0` and `cordova-ios >=7.0.0`** (and Cordova CLI `>=11`).
  `cordova-plugin-androidx` and `cordova-plugin-androidx-adapter` are no longer needed.
- **Install from GitHub** (see the README); the plugin is no longer published to the private registry it used before.
- **iOS needs iOS 15.5 or higher** because of the ML Kit pods.
- The scan options are backwards compatible. `detectorSize` is now the _width_ of the scan area as a fraction of
  the screen width (before: a fraction of the smaller screen dimension; identical in portrait).
- If several barcodes are inside the scan area without `highlightBarcode`, Android now returns the first
  one (it used to return the last).
- On iOS the scanner is no longer locked to portrait; it rotates with the device if the app allows it.

## 4.1.10 (2026-11-11)

- **iOS:** build hook `hooks/ios-pods-deployment-target.js` raises pods with a deployment target below 15.0
  (GoogleUtilities, GoogleToolboxForMac, nanopb, PromisesObjC, GTMSessionFetcher, GoogleDataTransport) to 15.0,
  which current Xcode requires. It patches the generated `Pods.xcodeproj` and adds a `post_install` to the
  Podfile. It runs automatically on `prepare` and `build`.

## 4.1.9 (2026-11-10)

- **iOS:** autofocus fixed. The scanner used the deprecated `[AVCaptureDevice devices]` (can be empty on current
  iOS) and never focused. It now keeps the camera it opened, focuses continuously on the center of the scan area
  at near range, and tap-to-focus works in every orientation.
- **iOS:** `GoogleMLKit/BarcodeScanning` updated from `~> 7.0.0` to `~> 9.0.0`.

## 4.1.8 (2026-11-10)

- **iOS:** landscape support. The scanner rotates with the device, the layout (scan area, buttons, highlight
  layer) is recalculated on rotation, and video/preview orientation follow the interface orientation.
  The scan area widens in landscape and keeps its portrait height (same as Android).

## 4.1.7 (2026-11-10)

- **Android:** in landscape the width of the scan area scales with the screen width, the height keeps its
  portrait size.
- README: clarified `detectorHeight`.

## 4.1.6 (2026-11-10)

- `showCaptureButton` now defaults to `false`.
- **Android:** first iteration of the landscape scaling (superseded by 4.1.7).

## 4.1.5 (2026-11-10)

- New option `showCaptureButton`: show or hide the capture button at the bottom of the scanner.

## 4.1.4 (2026-11-10)

- Tap the scan area to capture the barcode (Android and iOS). With `highlightBarcode`, tapping another outlined
  barcode selects it; tapping the selected barcode or empty space in the scan area returns it.

## 4.1.3 (2026-11-10)

- Highlighted barcodes are always outlined as an upright rectangle (no more skewed shapes) and the outline is
  smoothed so it no longer jumps around. Selection and hit testing use the same rectangles.

## 4.1.2 (2026-11-10)

- **Android:** CameraX updated from 1.3.4 to 1.4.2. Version 1.3.4 shipped a 4 KB aligned
  `libimage_processing_util_jni.so`; 1.4.2 is 16 KB aligned, which fixes the "app isn't 16 KB compatible" dialog.
  This raises the minimum to `cordova-android >=14.0.0` (compileSdk 35).

## 4.1.1 (2026-11-10)

- Targeting aid: a red horizontal line through the vertical center of the scan area with a small red vertical
  tick at its center (Android and iOS).

## 4.1.0 (2026-10-27)

- New option `detectorHeight`: the scan area is now a rectangle (`detectorSize` = width, `detectorHeight` =
  height). `0` (default) keeps the old square.
- New option `highlightBarcode`: all barcodes in the scan area are outlined, the one that will be returned is
  highlighted in green and its value is shown above it. Tap another outlined barcode to re-select.
- The scan area drawn on screen now exactly matches the area that is analyzed (the preview and analysis frames
  are mapped to each other on Android and iOS).
- **iOS:** frames are delivered upright (portrait) and only one frame is analyzed at a time.

## 4.0.3 (2026-10-27)

- **Android:** `Barcode` is imported from `com.google.mlkit.vision.barcode.common` (moved in ML Kit 17).

## 4.0.2 (2026-10-27)

- **Android:** removed the `app_name`, `launcher_name` and `activity_name` strings from the plugin's string
  resources; they duplicated the app's own resources and broke the build.

## 4.0.1 (2026-10-27)

- The plugin can be installed from git (`cordova plugin add <git url>#dev`):
  - removed the `.npmrc` that pointed at a private Azure registry (caused `E401`), `publishConfig` and the
    private `@teckel.ts-internal` dev dependencies and lint configuration;
  - the built `www/` output is committed so no build is needed on install;
  - the build uses `@rollup/plugin-typescript`; `package-lock.json` was regenerated.

## 4.0.0 (2026-10-27)

- Updated for current Cordova platforms (`cordova-android >=12` at the time, `cordova-ios >=7`).
- **Android:**
  - removed the old support libraries, `cordova-plugin-androidx-adapter`, `play-services-vision` and
    `build-extras.gradle`; added `appcompat` and `material`;
  - ML Kit `barcode-scanning` 16.2.0 → 17.3.0, CameraX 1.0.0-beta → 1.3.4, ConstraintLayout 2.1.4;
  - CameraX API changes (`setImplementationMode`, `getSurfaceProvider`, `UnsafeOptInUsageError`);
  - the plugin's strings go to `mlkit_barcode_scanner_strings.xml` instead of overwriting the app's `strings.xml`;
  - the activity is `exported="false"`, no storage permission is requested, cancelling the scanner no longer
    crashes, and a null overlay canvas is handled.
- **iOS:**
  - `GoogleMLKit/BarcodeScanning` 2.5.0 → 7.0.0 (arm64 simulator support);
  - `NSCameraUsageDescription` is added by the plugin (`CAMERA_USAGE_DESCRIPTION` variable);
  - uses the window scene orientation instead of the deprecated `statusBarOrientation`; the beep sound no
    longer crashes if the file is missing.
- New option `captureButton`: barcodes are only scanned after the user taps a capture button at the bottom of
  the scanner (message "No barcode found" if nothing was detected). English and German strings included.
