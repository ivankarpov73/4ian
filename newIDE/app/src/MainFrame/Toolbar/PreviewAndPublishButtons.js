// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { LineStackLayout } from '../../UI/Layout';
import FlatButton from '../../UI/FlatButton';
import RaisedButton from '../../UI/RaisedButton';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { type PreviewState } from '../PreviewState';
import PreviewIcon from '../../UI/CustomSvgIcons/Preview';
import UpdateIcon from '../../UI/CustomSvgIcons/Update';
import PublishIcon from '../../UI/CustomSvgIcons/Publish';

export type PreviewAndPublishButtonsProps = {|
  onPreviewWithoutHotReload: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  onHotReloadPreview: () => void,
  setPreviewOverride: ({|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  canDoNetworkPreview: boolean,
  isPreviewEnabled: boolean,
  hasPreviewsRunning: boolean,
  previewState: PreviewState,
  exportProject: () => void,
|};

export default function PreviewAndPublishButtons({
  onPreviewWithoutHotReload,
  onNetworkPreview,
  onOpenDebugger,
  onHotReloadPreview,
  canDoNetworkPreview,
  isPreviewEnabled,
  hasPreviewsRunning,
  previewState,
  setPreviewOverride,
  exportProject,
}: PreviewAndPublishButtonsProps) {
  const previewBuildMenuTemplate = React.useCallback(
    (i18n: I18nType) => [
      {
        label: i18n._(t`Start Network Preview (Preview over WiFi/LAN)`),
        click: onNetworkPreview,
        enabled: canDoNetworkPreview,
      },
      {
        label: i18n._(t`Start Preview and Debugger`),
        click: onOpenDebugger,
      },
      {
        label: i18n._(t`Launch another preview in a new window`),
        click: onPreviewWithoutHotReload,
        enabled: isPreviewEnabled && hasPreviewsRunning,
      },
      { type: 'separator' },
      ...(previewState.overridenPreviewLayoutName
        ? [
            {
              type: 'checkbox',
              label: previewState.overridenPreviewExternalLayoutName
                ? i18n._(
                    t`Start all previews from external layout ${
                      previewState.overridenPreviewExternalLayoutName
                    }`
                  )
                : i18n._(
                    t`Start all previews from scene ${
                      previewState.overridenPreviewLayoutName
                    }`
                  ),
              checked: previewState.isPreviewOverriden,
              click: () =>
                setPreviewOverride({
                  isPreviewOverriden: !previewState.isPreviewOverriden,
                  overridenPreviewLayoutName:
                    previewState.overridenPreviewLayoutName,
                  overridenPreviewExternalLayoutName:
                    previewState.overridenPreviewExternalLayoutName,
                }),
            },
            { type: 'separator' },
          ]
        : []),
      {
        label: previewState.previewExternalLayoutName
          ? i18n._(
              t`Use this external layout inside this scene to start all previews`
            )
          : i18n._(t`Use this scene to start all previews`),
        click: () =>
          setPreviewOverride({
            isPreviewOverriden: true,
            overridenPreviewLayoutName: previewState.previewLayoutName,
            overridenPreviewExternalLayoutName:
              previewState.previewExternalLayoutName,
          }),
        enabled:
          previewState.previewLayoutName !==
            previewState.overridenPreviewLayoutName ||
          previewState.previewExternalLayoutName !==
            previewState.overridenPreviewExternalLayoutName,
      },
    ],
    [
      onPreviewWithoutHotReload,
      isPreviewEnabled,
      hasPreviewsRunning,
      setPreviewOverride,
      previewState,
      onNetworkPreview,
      onOpenDebugger,
      canDoNetworkPreview,
    ]
  );

  const onClickPreview = event => {
    if (event.target) event.target.blur();
    onHotReloadPreview();
  };

  return (
    <LineStackLayout noMargin>
      <ElementWithMenu
        element={
          <FlatButton
            primary
            onClick={onClickPreview}
            disabled={!isPreviewEnabled}
            leftIcon={hasPreviewsRunning ? <UpdateIcon /> : <PreviewIcon />}
            label={
              hasPreviewsRunning ? (
                <Trans>Update</Trans>
              ) : (
                <Trans>Preview</Trans>
              )
            }
            id={'toolbar-preview-button'}
            exceptionalTooltipForToolbar={
              hasPreviewsRunning ? (
                <Trans>
                  Apply changes to the running preview, right click for more
                </Trans>
              ) : previewState.isPreviewOverriden ? (
                <Trans>Preview is overridden, right click for more</Trans>
              ) : previewState.previewExternalLayoutName ? (
                <Trans>
                  Launch a preview of the external layout inside the scene,
                  right click for more
                </Trans>
              ) : (
                <Trans>
                  Launch a preview of the scene, right click for more
                </Trans>
              )
            }
          />
        }
        openMenuWithSecondaryClick
        buildMenuTemplate={previewBuildMenuTemplate}
      />
      <RaisedButton
        primary
        onClick={exportProject}
        icon={<PublishIcon />}
        label={<Trans>Publish</Trans>}
        id={'toolbar-publish-button'}
        exceptionalTooltipForToolbar={
          <Trans>Export the game (Web, Android, iOS...)</Trans>
        }
      />
    </LineStackLayout>
  );
}
