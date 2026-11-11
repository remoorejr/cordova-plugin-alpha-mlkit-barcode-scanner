'use strict';

// Some of the pods that Google ML Kit depends on (GoogleUtilities, GoogleToolboxForMac, nanopb,
// PromisesObjC, ...) still declare an iOS deployment target below 15. Recent Xcode versions only
// support 15.0 and up and refuse to build such pods, so raise them to the minimum supported target.

var fs = require('fs');
var path = require('path');

var MIN_TARGET = 15.0;

var POST_INSTALL = [
  '',
  '# Added by cordova-plugin-alpha-mlkit-barcode-scanner: raise too low pod deployment targets',
  'post_install do |installer|',
  '  installer.pods_project.targets.each do |target|',
  '    target.build_configurations.each do |config|',
  "      if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < " + MIN_TARGET.toFixed(1),
  "        config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '" + MIN_TARGET.toFixed(1) + "'",
  '      end',
  '    end',
  '  end',
  'end',
  ''
].join('\n');

function patchPodfile(iosPath) {
  var podfile = path.join(iosPath, 'Podfile');
  if (!fs.existsSync(podfile)) {
    return;
  }
  var content = fs.readFileSync(podfile, 'utf8');
  if (content.indexOf('post_install') !== -1) {
    return;
  }
  fs.writeFileSync(podfile, content + POST_INSTALL);
}

// Pods are already installed when the build starts, so fix the generated Pods project as well.
function patchPodsProject(iosPath) {
  var pbxproj = path.join(iosPath, 'Pods', 'Pods.xcodeproj', 'project.pbxproj');
  if (!fs.existsSync(pbxproj)) {
    return;
  }
  var content = fs.readFileSync(pbxproj, 'utf8');
  var patched = content.replace(/IPHONEOS_DEPLOYMENT_TARGET = ([0-9.]+);/g, function (match, version) {
    return parseFloat(version) < MIN_TARGET ? 'IPHONEOS_DEPLOYMENT_TARGET = ' + MIN_TARGET.toFixed(1) + ';' : match;
  });
  if (patched !== content) {
    fs.writeFileSync(pbxproj, patched);
    console.log('cordova-plugin-alpha-mlkit-barcode-scanner: raised pod deployment targets to ' + MIN_TARGET.toFixed(1));
  }
}

module.exports = function (context) {
  var platforms = (context.opts && context.opts.platforms) || [];
  if (platforms.length && platforms.indexOf('ios') === -1) {
    return;
  }

  var iosPath = path.join(context.opts.projectRoot, 'platforms', 'ios');
  if (!fs.existsSync(iosPath)) {
    return;
  }

  patchPodfile(iosPath);
  patchPodsProject(iosPath);
};
