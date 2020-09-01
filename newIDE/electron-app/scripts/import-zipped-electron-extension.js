/**
 * This script will extract a zipped file of a prebuilt Electron extension.
 * The zip file must contain the raw, unchanged sources, which will be extracted
 * to the folder passed as parameter, in a subfolder with the extension name.
 *
 * This is useful to avoid mixing the Electron extension source files inside
 * GDevelop sources.
 */
var shell = require('shelljs');
var fs = require('fs');
var unzipper = require('unzipper');
var process = require('process');
var path = require('path');

const fileName = process.argv[2];
const relativeExtractPath = process.argv[3];
const basePath = path.join(relativeExtractPath, fileName);
const zipFilePath = basePath + '.zip';

try {
  fs.createReadStream(zipFilePath)
    .pipe(
      unzipper.Extract({
        path: relativeExtractPath,
      })
    )
    .on('close', function() {
      shell.echo('✅ Extracted ' + zipFilePath + ' to ' + basePath + ' folder');
    });
} catch (e) {
  shell.echo(
    '❌ Error while extracting ' + zipFilePath + ' to ' + basePath + ' folder:',
    e.message
  );
}
