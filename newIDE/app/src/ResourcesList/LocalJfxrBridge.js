import optionalRequire from '../Utils/OptionalRequire.js';
import { type ExternalEditorOpenOptions } from './ResourceExternalEditor.flow';
import { createOrUpdateResource } from './ResourceUtils.js';

const electron = optionalRequire('electron');
const path = optionalRequire('path');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const gd = global.gd;

/**
 * Open JFXR to create wav resources.
 */
export const openJfxr = ({
  project,
  resourcesLoader,
  resourceNames,
  onChangesSaved,
  resourcePath,
  extraOptions,
}: ExternalEditorOpenOptions) => {
  if (!electron || !ipcRenderer) return;
  const projectPath = path.dirname(project.getProjectFile());

  let initialResourcePath = '';
  initialResourcePath = resourcesLoader.getFullUrl(project, resourceNames[0]);
  initialResourcePath = initialResourcePath.substring(
    7,
    initialResourcePath.lastIndexOf('?cache=')
  );

  const jfxrData = {
    resourcePath: initialResourcePath,
    externalEditorData: extraOptions.initialResourceMetadata,
    projectPath,
  };

  ipcRenderer.removeAllListeners('jfxr-changes-saved');
  ipcRenderer.on('jfxr-changes-saved', (event, newFilePath, receivedData) => {

    const resourceName = path.relative(projectPath, newFilePath);
    createOrUpdateResource(project, new gd.AudioResource(), resourceName);

    const externalEditorData = {
      jfxr: receivedData,
    };
    project
    .getResourcesManager()
    .getResource(resourceName)
    .setMetadata(JSON.stringify(externalEditorData));
    onChangesSaved([{ externalEditorData }], resourceName);
  });

  ipcRenderer.send('jfxr-create-wav', jfxrData);
};