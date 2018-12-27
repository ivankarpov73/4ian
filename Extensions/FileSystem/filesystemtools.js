/**
 * @memberof gdjs
 * @class filesystem
 * @static
 * @private
 */

gdjs.filesystem = {}

/**
 * Get the path to 'Desktop' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the desktop folder
 */
gdjs.filesystem.getDesktopPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('desktop') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Documents' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the documents folder
 */
gdjs.filesystem.getDocumentsPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('documents') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'Pictures' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to the pictures folder
 */
gdjs.filesystem.getPicturesPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('pictures') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to this applications 'executable' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to this applications executable folder
 */
gdjs.filesystem.getExecutablePath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('exe') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'userdata' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to userdata folder
 */
gdjs.filesystem.getUserdataPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('userData') || '';
  } else {
    return '';
  }
}

/**
 * Get the path to 'temp' folder.
 * @param {gdjs.RuntimeScene} runtimeScene The current scene
 * @return {string} The path to temp folder
 */
gdjs.filesystem.getTempPath = function (runtimeScene) {
  const electron = runtimeScene.getGame().getRenderer().getElectron();

  if (electron) {
    return electron.getPath('temp') || '';
  } else {
    return '';
  }
}