/**
 * Launch this script to re-generate the files containing the list of extensions
 * being used by each example.
 */
const fs = require('fs');
const _ = require('lodash');

const electronAppPackageJson = require('../../electron-app/app/package.json');
const version = electronAppPackageJson.version;
const outputFile = '../src/Version/VersionMetadata.js';

const writeFile = object => {
  return new Promise((resolve, reject) => {
    const content = [
      `// @ flow`,
      `// This file is generated by make-version-metadata.js script`,
      `// prettier-ignore`,
      `module.exports = ${JSON.stringify(object, null, 2)};`,
      ``,
    ].join('\n');
    fs.writeFile(outputFile, content, err => {
      if (err) return reject(err);

      resolve();
    });
  });
};

writeFile({
  version,
}).then(
  () => console.info('✅ src/Version/VersionMetadata.js properly generated.'),
  err => console.error('❌ Error while src/Version/VersionMetadata.js', err)
);
