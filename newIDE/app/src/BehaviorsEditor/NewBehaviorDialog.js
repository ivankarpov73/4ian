// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import Dialog from '../UI/Dialog';
import HelpButton from '../UI/HelpButton';
import FlatButton from '../UI/FlatButton';
import { showMessageBox } from '../UI/Messages/MessageBox';
import { getDeprecatedBehaviorsInformation } from '../Hints';
import { enumerateBehaviorsMetadata } from './EnumerateBehaviorsMetadata';
import { BehaviorStore } from '../AssetStore/BehaviorStore';
import { type SearchableBehaviorMetadata } from '../AssetStore/BehaviorStore/BehaviorStoreContext';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import { installExtension } from '../AssetStore/ExtensionStore/InstallExtension';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_BEHAVIOR,
  TRIVIAL_FIRST_EXTENSION,
} from '../Utils/GDevelopServices/Badge';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension?: gdEventsFunctionsExtension,
  objectType: string,
  objectBehaviorsTypes: Array<string>,
  open: boolean,
  onClose: () => void,
  onChoose: (type: string, defaultName: string) => void,
|};

export default function NewBehaviorDialog({
  project,
  eventsFunctionsExtension,
  open,
  onClose,
  onChoose,
  objectType,
  objectBehaviorsTypes,
}: Props) {
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [extensionInstallTime, setExtensionInstallTime] = React.useState(0);
  const eventsFunctionsExtensionsState = React.useContext(
    EventsFunctionsExtensionsContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);

  const installDisplayedExtension = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_EXTENSION,
    installExtension
  );

  const deprecatedBehaviorsInformation = getDeprecatedBehaviorsInformation();

  const allInstalledBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () => {
      const platform = project.getCurrentPlatform();
      const behaviorMetadataList =
        project && platform
          ? enumerateBehaviorsMetadata(
              platform,
              project,
              eventsFunctionsExtension
            )
          : [];
      return behaviorMetadataList.map(behavior => ({
        type: behavior.type,
        fullName: behavior.fullName,
        description: behavior.description,
        previewIconUrl: behavior.previewIconUrl,
        objectType: behavior.objectType,
        category: behavior.category,
        // TODO Add the tags of the extension.
        tags: [],
      }));
    },
    [project, eventsFunctionsExtension, extensionInstallTime] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const installedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () =>
      allInstalledBehaviorMetadataList.filter(
        behavior => !deprecatedBehaviorsInformation[behavior.type]
      ),
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  const deprecatedBehaviorMetadataList: Array<SearchableBehaviorMetadata> = React.useMemo(
    () => {
      const deprecatedBehaviors = allInstalledBehaviorMetadataList.filter(
        behavior => deprecatedBehaviorsInformation[behavior.type]
      );
      deprecatedBehaviors.forEach(behavior => (behavior.isDeprecated = true));
      return deprecatedBehaviors;
    },
    [allInstalledBehaviorMetadataList, deprecatedBehaviorsInformation]
  );

  if (!open || !project) return null;

  const _chooseBehavior = (i18n: I18nType, behaviorType: string) => {
    if (deprecatedBehaviorsInformation[behaviorType]) {
      showMessageBox(
        i18n._(deprecatedBehaviorsInformation[behaviorType].warning)
      );
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behaviorType
    );

    return onChoose(behaviorType, behaviorMetadata.getDefaultName());
  };
  const chooseBehavior = addCreateBadgePreHookIfNotClaimed(
    authenticatedUser,
    TRIVIAL_FIRST_BEHAVIOR,
    _chooseBehavior
  );

  const onInstallExtension = async (
    i18n: I18nType,
    extensionShortHeader: { url: string }
  ) => {
    setIsInstalling(true);
    try {
      const wasExtensionInstalled = await installDisplayedExtension(
        i18n,
        project,
        eventsFunctionsExtensionsState,
        extensionShortHeader
      );

      if (wasExtensionInstalled) {
        // Setting the extension install time will force a reload of
        // the behavior metadata, and so the list of behaviors.
        setExtensionInstallTime(Date.now());
        return true;
      }
      return false;
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Dialog
          title={<Trans>Add a new behavior to the object</Trans>}
          actions={[
            <FlatButton
              key="close"
              label={<Trans>Close</Trans>}
              primary={false}
              onClick={onClose}
            />,
          ]}
          secondaryActions={[
            <HelpButton helpPagePath="/behaviors" key="help" />,
          ]}
          open
          onRequestClose={onClose}
          flexBody
          fullHeight
          id="new-behavior-dialog"
        >
          <BehaviorStore
            project={project}
            objectType={objectType}
            objectBehaviorsTypes={objectBehaviorsTypes}
            isInstalling={isInstalling}
            onInstall={async extensionShortHeader =>
              onInstallExtension(i18n, extensionShortHeader)
            }
            onChoose={behaviorType => chooseBehavior(i18n, behaviorType)}
            installedBehaviorMetadataList={installedBehaviorMetadataList}
            deprecatedBehaviorMetadataList={deprecatedBehaviorMetadataList}
          />
          <DismissableInfoBar
            identifier="extension-installed-explanation"
            message={
              <Trans>
                The behavior was added to the project. You can now add it to
                your object.
              </Trans>
            }
            show={extensionInstallTime !== 0}
          />
        </Dialog>
      )}
    </I18n>
  );
}
