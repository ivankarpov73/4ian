// @flow
import { Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { t } from '@lingui/macro';

import * as React from 'react';
import { AutoSizer } from 'react-virtualized';
import Background from '../UI/Background';
import SearchBar from '../UI/SearchBar';
import NewObjectDialog from '../AssetStore/NewObjectDialog';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import Window from '../Utils/Window';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { showWarningBox } from '../UI/Messages/MessageBox';
import { type ObjectEditorTab } from '../ObjectEditor/ObjectEditorDialog';
import type { ObjectWithContext } from '../ObjectsList/EnumerateObjects';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import TreeView, {
  type TreeViewInterface,
  type MenuButton,
} from '../UI/TreeView';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { getInstanceCountInLayoutForObject } from '../Utils/Layout';
import EventsFunctionsExtensionsContext from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import useForceUpdate from '../Utils/UseForceUpdate';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import defaultShortcuts from '../KeyboardShortcuts/DefaultShortcuts';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { Column, Line } from '../UI/Grid';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import Add from '../UI/CustomSvgIcons/Add';
import InAppTutorialContext from '../InAppTutorial/InAppTutorialContext';
import { mapFor } from '../Utils/MapFor';
import IconButton from '../UI/IconButton';
import AddFolder from '../UI/CustomSvgIcons/AddFolder';
import { LineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import Link from '../UI/Link';
import { getHelpLink } from '../Utils/HelpLink';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { useResponsiveWindowWidth } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import ErrorBoundary from '../UI/ErrorBoundary';
import {
  FunctionTreeViewItemContent,
  getFunctionTreeViewItemId,
  type EventFunctionProps,
  type EventFunctionCommonProps,
  type EventFunctionCallbacks,
  type EventsFunctionCreationParameters,
} from './FunctionTreeViewItemContent';
import {
  BehaviorTreeViewItemContent,
  getBehaviorTreeViewItemId,
  type EventBehaviorProps,
  type EventBehaviorCallbacks,
} from './BehaviorTreeViewItemContent';
import {
  ObjectTreeViewItemContent,
  getObjectTreeViewItemId,
  type EventObjectProps,
  type EventObjectCallbacks,
} from './ObjectTreeViewItemContent';
import { type HTMLDataset } from '../Utils/HTMLDataset';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';

const gd: libGDevelop = global.gd;

const extensionObjectsRootFolderId = 'extension-objects';
const extensionBehaviorsRootFolderId = 'extension-behaviors';
const extensionFunctionsRootFolderId = 'extension-functions';
const extensionObjectsEmptyPlaceholderId = 'extension-objects-placeholder';
const extensionBehaviorsEmptyPlaceholderId = 'extension-behaviors-placeholder';
const extensionFunctionsEmptyPlaceholderId = 'extension-functions-placeholder';

const styles = {
  listContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  autoSizerContainer: { flex: 1 },
  autoSizer: { width: '100%' },
};

const objectWithContextReactDndType = 'GD_OBJECT_WITH_CONTEXT';

export interface TreeViewItemContent {
  getName(): string | React.Node;
  getId(): string;
  getHtmlId(index: number): ?string;
  getThumbnail(): ?string;
  getDataset(): ?HTMLDataset;
  onSelect(): void;
  buildMenuTemplate(i18n: I18nType, index: number): Array<MenuItemTemplate>;
  getRightButton(): ?MenuButton;
  renderLeftComponent(i18n: I18nType): ?React.Node;
  rename(newName: string): void;
  edit(): void;
  getIndex(): number;
  moveAt(destinationIndex: number): void;
  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer;
  getEventsFunction(): ?gdEventsFunction;
  getEventsBasedBehavior(): ?gdEventsBasedBehavior;
  getEventsBasedObject(): ?gdEventsBasedObject;
}

interface TreeViewItem {
  isRoot?: boolean;
  isPlaceholder?: boolean;
  +content: TreeViewItemContent;
  getChildren(): ?Array<TreeViewItem>;
}

export type TreeItemProps = {|
  forceUpdate: () => void,
  forceUpdateList: () => void,
  unsavedChanges?: ?UnsavedChanges,
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  editName: (itemId: string) => void,
  scrollToItem: (itemId: string) => void,
|};

class ObjectTreeViewItem implements TreeViewItem {
  content: ObjectTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    content: ObjectTreeViewItemContent,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(): ?Array<TreeViewItem> {
    const eventsBasedObject = this.content.object;
    const eventsFunctionsContainer = eventsBasedObject.getEventsFunctions();
    const eventFunctionProps = {
      eventsBasedObject,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    const functions = eventsBasedObject.getEventsFunctions();
    return mapFor(
      0,
      functions.getEventsFunctionsCount(),
      i =>
        new LeafTreeViewItem(
          new FunctionTreeViewItemContent(
            functions.getEventsFunctionAt(i),
            eventFunctionProps
          )
        )
    );
  }
}

class BehaviorTreeViewItem implements TreeViewItem {
  content: BehaviorTreeViewItemContent;
  eventFunctionProps: EventFunctionCommonProps;

  constructor(
    content: BehaviorTreeViewItemContent,
    eventFunctionProps: EventFunctionCommonProps
  ) {
    this.content = content;
    this.eventFunctionProps = eventFunctionProps;
  }

  getChildren(): ?Array<TreeViewItem> {
    const eventsBasedBehavior = this.content.behavior;
    const eventsFunctionsContainer = eventsBasedBehavior.getEventsFunctions();
    const eventFunctionProps = {
      eventsBasedBehavior,
      eventsFunctionsContainer,
      ...this.eventFunctionProps,
    };
    return mapFor(
      0,
      eventsFunctionsContainer.getEventsFunctionsCount(),
      i =>
        new LeafTreeViewItem(
          new FunctionTreeViewItemContent(
            eventsFunctionsContainer.getEventsFunctionAt(i),
            eventFunctionProps
          )
        )
    );
  }
}

class LeafTreeViewItem implements TreeViewItem {
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItem implements TreeViewItem {
  isPlaceholder = true;
  content: TreeViewItemContent;

  constructor(content: TreeViewItemContent) {
    this.content = content;
  }

  getChildren(): ?Array<TreeViewItem> {
    return null;
  }
}

class PlaceHolderTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;

  constructor(id: string, label: string | React.Node) {
    this.id = id;
    this.label = label;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return null;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getThumbnail(): ?string {
    return null;
  }

  getDataset(): ?HTMLDataset {
    return null;
  }

  onSelect(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return [];
  }

  getRightButton(): ?MenuButton {
    return null;
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}
}

class RootTreeViewItemContent implements TreeViewItemContent {
  id: string;
  label: string | React.Node;
  buildMenuTemplateFunction: (
    i18n: I18nType,
    index: number
  ) => Array<MenuItemTemplate>;
  rightButton: MenuButton;

  constructor(id: string, label: string | React.Node, rightButton: MenuButton) {
    this.id = id;
    this.label = label;
    this.buildMenuTemplateFunction = (i18n: I18nType, index: number) => [
      {
        label: rightButton.label,
        click: rightButton.click,
      },
    ];
    this.rightButton = rightButton;
  }

  getName(): string | React.Node {
    return this.label;
  }

  getId(): string {
    return this.id;
  }

  getRightButton(): ?MenuButton {
    return this.rightButton;
  }

  getEventsFunctionsContainer(): ?gdEventsFunctionsContainer {
    return null;
  }

  getEventsFunction(): ?gdEventsFunction {
    return null;
  }

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    return null;
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    return null;
  }

  getHtmlId(index: number): ?string {
    return null;
  }

  getThumbnail(): ?string {
    return null;
  }

  getDataset(): ?HTMLDataset {
    return null;
  }

  onSelect(): void {}

  buildMenuTemplate(i18n: I18nType, index: number) {
    return this.buildMenuTemplateFunction(i18n, index);
  }

  renderLeftComponent(i18n: I18nType): ?React.Node {
    return null;
  }

  rename(newName: string): void {}

  edit(): void {}

  getIndex(): number {
    return 0;
  }

  moveAt(destinationIndex: number): void {}
}

const getTreeViewItemName = (item: TreeViewItem) => item.content.getName();
const getTreeViewItemId = (item: TreeViewItem) => item.content.getId();
const getTreeViewItemHtmlId = (item: TreeViewItem, index: number) =>
  item.content.getHtmlId(index);
const getTreeViewItemChildren = (item: TreeViewItem) => item.getChildren();
const getTreeViewItemThumbnail = (item: TreeViewItem) =>
  item.content.getThumbnail();
const getTreeViewItemData = (item: TreeViewItem) => item.content.getDataset();
const buildMenuTemplate = (i18n: I18nType) => (
  item: TreeViewItem,
  index: number
) => item.content.buildMenuTemplate(i18n, index);
const renderTreeViewItemLeftComponent = (i18n: I18nType) => (
  item: TreeViewItem
) => item.content.renderLeftComponent(i18n);
const renameItem = (item: TreeViewItem, newName: string) => {
  item.content.rename(newName);
};
const editItem = (item: TreeViewItem) => {
  item.content.edit();
};
const getTreeViewItemRightButton = (item: TreeViewItem) =>
  item.content.getRightButton();

const CLIPBOARD_KIND = 'Object';

const getPasteLabel = (
  i18n: I18nType,
  { isGlobalObject, isFolder }: {| isGlobalObject: boolean, isFolder: boolean |}
) => {
  let translation = t`Paste`;
  if (Clipboard.has(CLIPBOARD_KIND)) {
    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    const clipboardObjectName =
      SafeExtractor.extractStringProperty(clipboardContent, 'name') || '';
    translation = isGlobalObject
      ? isFolder
        ? t`Paste ${clipboardObjectName} as a Global Object inside folder`
        : t`Paste ${clipboardObjectName} as a Global Object`
      : isFolder
      ? t`Paste ${clipboardObjectName} inside folder`
      : t`Paste ${clipboardObjectName}`;
  }
  return i18n._(translation);
};

export type EventsFunctionsListInterface = {|
  forceUpdateList: () => void,
  renameObjectFolderOrObjectWithContext: TreeViewItem => void,
|};

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  unsavedChanges?: ?UnsavedChanges,
  // Objects
  selectedEventsBasedObject: ?gdEventsBasedObject,
  ...EventObjectCallbacks,
  // Behaviors
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  ...EventBehaviorCallbacks,
  // Free functions
  selectedEventsFunction: ?gdEventsFunction,
  ...EventFunctionCallbacks,
|};

const EventsFunctionsList = React.forwardRef<
  Props,
  EventsFunctionsListInterface
>(
  (
    {
      project,
      eventsFunctionsExtension,
      unsavedChanges,
      onSelectEventsFunction,
      onDeleteEventsFunction,
      canRename,
      onRenameEventsFunction,
      onAddEventsFunction,
      onEventsFunctionAdded,
      onSelectEventsBasedBehavior,
      onDeleteEventsBasedBehavior,
      onRenameEventsBasedBehavior,
      onEventsBasedBehaviorRenamed,
      onEventsBasedBehaviorPasted,
      onSelectEventsBasedObject,
      onDeleteEventsBasedObject,
      onRenameEventsBasedObject,
      onEventsBasedObjectRenamed,
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      selectedEventsBasedObject,
    }: Props,
    ref
  ) => {
    const [selectedItems, setSelectedItems] = React.useState<
      Array<TreeViewItem>
    >([]);

    const preferences = React.useContext(PreferencesContext);
    const { currentlyRunningInAppTutorial } = React.useContext(
      InAppTutorialContext
    );
    const treeViewRef = React.useRef<?TreeViewInterface<TreeViewItem>>(null);
    const forceUpdate = useForceUpdate();
    const windowWidth = useResponsiveWindowWidth();
    const isMobileScreen = windowWidth === 'small';

    const forceUpdateList = React.useCallback(
      () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      [forceUpdate]
    );

    React.useImperativeHandle(ref, () => ({
      forceUpdateList: () => {
        forceUpdate();
        if (treeViewRef.current) treeViewRef.current.forceUpdateList();
      },
      renameObjectFolderOrObjectWithContext: objectFolderOrObjectWithContext => {
        if (treeViewRef.current)
          treeViewRef.current.renameItem(objectFolderOrObjectWithContext);
      },
    }));

    const [searchText, setSearchText] = React.useState('');

    const scrollToItem = React.useCallback((itemId: string) => {
      if (treeViewRef.current) {
        treeViewRef.current.scrollToItemFromId(itemId);
      }
    }, []);

    const editName = React.useCallback(
      (itemId: string) => {
        const treeView = treeViewRef.current;
        if (treeView) {
          if (isMobileScreen) {
            // Position item at top of the screen to make sure it will be visible
            // once the keyboard is open.
            treeView.scrollToItemFromId(itemId, 'start');
          }
          treeView.renameItemFromId(itemId);
        }
      },
      [isMobileScreen]
    );

    const addNewEventsFunction = React.useCallback(
      (itemContent: ?TreeViewItemContent) => {
        const eventsFunctionsContainer = itemContent
          ? itemContent.getEventsFunctionsContainer() ||
            eventsFunctionsExtension
          : eventsFunctionsExtension;

        const eventsBasedBehavior = itemContent
          ? itemContent.getEventsBasedBehavior()
          : null;
        if (eventsBasedBehavior) {
          onSelectEventsBasedBehavior(eventsBasedBehavior);
        }
        const eventsBasedObject = itemContent
          ? itemContent.getEventsBasedObject()
          : null;
        if (eventsBasedObject) {
          onSelectEventsBasedObject(eventsBasedObject);
        }

        onAddEventsFunction(
          eventsBasedBehavior,
          eventsBasedObject,
          (parameters: ?EventsFunctionCreationParameters) => {
            if (!parameters) {
              return;
            }

            const eventsFunctionName =
              parameters.name ||
              newNameGenerator('Function', name =>
                eventsFunctionsContainer.hasEventsFunctionNamed(name)
              );

            const eventsFunction = eventsFunctionsContainer.insertNewEventsFunction(
              eventsFunctionName,
              eventsFunctionsContainer.getEventsFunctionsCount()
            );
            eventsFunction.setFunctionType(parameters.functionType);

            if (
              eventsFunction.isCondition() &&
              !eventsFunction.isExpression()
            ) {
              gd.PropertyFunctionGenerator.generateConditionSkeleton(
                project,
                eventsFunction
              );
            }

            const functionItemId = getFunctionTreeViewItemId(
              eventsFunction,
              eventsBasedBehavior,
              eventsBasedObject
            );

            // Scroll to the new function.
            // Ideally, we'd wait for the list to be updated to scroll, but
            // to simplify the code, we just wait a few ms for a new render
            // to be done.
            setTimeout(() => {
              scrollToItem(functionItemId);
            }, 100); // A few ms is enough for a new render to be done.

            onEventsFunctionAdded(eventsFunction);
            if (unsavedChanges) {
              unsavedChanges.triggerUnsavedChanges();
            }
            forceUpdate();

            // We focus it so the user can edit the name directly.
            onSelectEventsFunction(
              eventsFunction,
              eventsBasedBehavior,
              eventsBasedObject
            );
            if (canRename(eventsFunction)) {
              editName(functionItemId);
            }
          }
        );
      },
      [
        canRename,
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        onAddEventsFunction,
        onEventsFunctionAdded,
        onSelectEventsBasedBehavior,
        onSelectEventsBasedObject,
        onSelectEventsFunction,
        project,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const addNewEventsBehavior = React.useCallback(
      () => {
        const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

        const name = newNameGenerator('MyBehavior', name =>
          eventBasedBehaviors.has(name)
        );
        const newEventsBasedBehavior = eventBasedBehaviors.insertNew(
          name,
          eventBasedBehaviors.getCount()
        );
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }
        forceUpdate();

        const behaviorItemId = getBehaviorTreeViewItemId(
          newEventsBasedBehavior
        );

        // Scroll to the new behavior.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(behaviorItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        onSelectEventsBasedBehavior(newEventsBasedBehavior);
        editName(behaviorItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        onSelectEventsBasedBehavior,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const addNewEventsObject = React.useCallback(
      () => {
        const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();

        const name = newNameGenerator('MyObject', name =>
          eventBasedObjects.has(name)
        );
        const newEventsBasedObject = eventBasedObjects.insertNew(
          name,
          eventBasedObjects.getCount()
        );
        if (unsavedChanges) {
          unsavedChanges.triggerUnsavedChanges();
        }
        forceUpdate();

        const objectItemId = getObjectTreeViewItemId(newEventsBasedObject);

        // Scroll to the new function.
        // Ideally, we'd wait for the list to be updated to scroll, but
        // to simplify the code, we just wait a few ms for a new render
        // to be done.
        setTimeout(() => {
          scrollToItem(objectItemId);
        }, 100); // A few ms is enough for a new render to be done.

        // We focus it so the user can edit the name directly.
        onSelectEventsBasedObject(newEventsBasedObject);
        editName(objectItemId);
      },
      [
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        onSelectEventsBasedObject,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const onObjectModified = React.useCallback(
      (shouldForceUpdateList: boolean) => {
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();

        if (shouldForceUpdateList) forceUpdateList();
        else forceUpdate();
      },
      [forceUpdate, forceUpdateList, unsavedChanges]
    );

    const selectObjectFolderOrObjectWithContext = React.useCallback(
      (objectFolderOrObjectWithContext: ?TreeViewItem) => {
        // TODO
      },
      []
    );

    const deleteObjectFolderOrObjectWithContext = React.useCallback(
      async (objectFolderOrObjectWithContext: ?TreeViewItem) => {
        // TODO
      },
      []
    );

    // Initialize keyboard shortcuts as empty.
    // onDelete callback is set outside because it deletes the selected
    // item (that is a props). As it is stored in a ref, the keyboard shortcut
    // instance does not update with selectedObjectFolderOrObjectsWithContext changes.
    const keyboardShortcutsRef = React.useRef<KeyboardShortcuts>(
      new KeyboardShortcuts({
        shortcutCallbacks: {},
      })
    );
    React.useEffect(
      () => {
        if (keyboardShortcutsRef.current) {
          keyboardShortcutsRef.current.setShortcutCallback('onDelete', () => {
            deleteObjectFolderOrObjectWithContext(
              // TODO
              null
            );
          });
        }
      },
      [deleteObjectFolderOrObjectWithContext]
    );

    const getClosestVisibleParent = (
      objectFolderOrObjectWithContext: TreeViewItem
    ): ?TreeViewItem => {
      // TODO
      return null;
    };

    const eventFunctionProps = React.useMemo<EventFunctionCommonProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        unsavedChanges,
        forceUpdate,
        forceUpdateList,
        editName,
        scrollToItem,
        onSelectEventsFunction,
        onDeleteEventsFunction,
        canRename,
        onRenameEventsFunction,
        onAddEventsFunction,
        onEventsFunctionAdded,
      }),
      [
        canRename,
        editName,
        eventsFunctionsExtension,
        forceUpdate,
        forceUpdateList,
        onAddEventsFunction,
        onDeleteEventsFunction,
        onEventsFunctionAdded,
        onRenameEventsFunction,
        onSelectEventsFunction,
        project,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const eventBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    const eventBasedBehaviors = eventsFunctionsExtension.getEventsBasedBehaviors();

    const eventBehaviorProps = React.useMemo<EventBehaviorProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedBehaviorsList: eventBasedBehaviors,
        unsavedChanges,
        forceUpdate,
        forceUpdateList,
        editName,
        scrollToItem,
        onSelectEventsBasedBehavior,
        onDeleteEventsBasedBehavior,
        onRenameEventsBasedBehavior,
        onEventsBasedBehaviorRenamed,
        onEventsBasedBehaviorPasted,
        addNewEventsFunction,
      }),
      [
        addNewEventsFunction,
        editName,
        eventBasedBehaviors,
        eventsFunctionsExtension,
        forceUpdate,
        forceUpdateList,
        onDeleteEventsBasedBehavior,
        onEventsBasedBehaviorPasted,
        onEventsBasedBehaviorRenamed,
        onRenameEventsBasedBehavior,
        onSelectEventsBasedBehavior,
        project,
        scrollToItem,
        unsavedChanges,
      ]
    );

    const eventObjectProps = React.useMemo<EventObjectProps>(
      () => ({
        project,
        eventsFunctionsExtension,
        eventsBasedObjectsList: eventBasedObjects,
        unsavedChanges,
        forceUpdate,
        forceUpdateList,
        editName,
        scrollToItem,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        addNewEventsFunction,
      }),
      [
        project,
        eventsFunctionsExtension,
        eventBasedObjects,
        unsavedChanges,
        forceUpdate,
        forceUpdateList,
        editName,
        scrollToItem,
        onSelectEventsBasedObject,
        onDeleteEventsBasedObject,
        onRenameEventsBasedObject,
        onEventsBasedObjectRenamed,
        addNewEventsFunction,
      ]
    );

    const objectTreeViewItems = mapFor(
      0,
      eventBasedObjects.size(),
      i =>
        new ObjectTreeViewItem(
          new ObjectTreeViewItemContent(
            eventBasedObjects.at(i),
            eventObjectProps
          ),
          eventFunctionProps
        )
    );
    const behaviorTreeViewItems = mapFor(
      0,
      eventBasedBehaviors.size(),
      i =>
        new BehaviorTreeViewItem(
          new BehaviorTreeViewItemContent(
            eventBasedBehaviors.at(i),
            eventBehaviorProps
          ),
          eventFunctionProps
        )
    );
    const getTreeViewData = React.useCallback(
      (i18n: I18nType): Array<TreeViewItem> => {
        return [
          {
            isRoot: true,
            content: new RootTreeViewItemContent(
              extensionObjectsRootFolderId,
              i18n._(t`Objects`),
              {
                icon: <Add />,
                label: i18n._(t`Add an object`),
                click: addNewEventsObject,
              }
            ),
            getChildren(): ?Array<TreeViewItem> {
              return objectTreeViewItems.length === 0
                ? [
                    new PlaceHolderTreeViewItem(
                      new PlaceHolderTreeViewItemContent(
                        extensionObjectsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new object.`)
                      )
                    ),
                  ]
                : objectTreeViewItems;
            },
          },
          {
            isRoot: true,
            content: new RootTreeViewItemContent(
              extensionBehaviorsRootFolderId,
              i18n._(t`Behaviors`),
              {
                icon: <Add />,
                label: i18n._(t`Add a behavior`),
                click: addNewEventsBehavior,
              }
            ),
            getChildren(): ?Array<TreeViewItem> {
              return behaviorTreeViewItems.length === 0
                ? [
                    new PlaceHolderTreeViewItem(
                      new PlaceHolderTreeViewItemContent(
                        extensionBehaviorsEmptyPlaceholderId,
                        i18n._(t`Start by adding a new behavior.`)
                      )
                    ),
                  ]
                : behaviorTreeViewItems;
            },
          },
          {
            isRoot: true,
            content: new RootTreeViewItemContent(
              extensionFunctionsRootFolderId,
              i18n._(t`Functions`),
              {
                icon: <Add />,
                label: i18n._(t`Add a function`),
                click: () => addNewEventsFunction(null),
              }
            ),
            getChildren(): ?Array<TreeViewItem> {
              if (eventsFunctionsExtension.getEventsFunctionsCount() === 0) {
                return [
                  new PlaceHolderTreeViewItem(
                    new PlaceHolderTreeViewItemContent(
                      extensionFunctionsEmptyPlaceholderId,
                      i18n._(t`Start by adding a new function.`)
                    )
                  ),
                ];
              }
              const freeFunctionProps = {
                eventsFunctionsContainer: eventsFunctionsExtension,
                ...eventFunctionProps,
              };
              return mapFor(
                0,
                eventsFunctionsExtension.getEventsFunctionsCount(),
                i =>
                  new LeafTreeViewItem(
                    new FunctionTreeViewItemContent(
                      eventsFunctionsExtension.getEventsFunctionAt(i),
                      freeFunctionProps
                    )
                  )
              );
            },
          },
        ];
      },
      [
        addNewEventsBehavior,
        addNewEventsFunction,
        addNewEventsObject,
        behaviorTreeViewItems,
        eventFunctionProps,
        eventsFunctionsExtension,
        objectTreeViewItems,
      ]
    );

    const canMoveSelectionTo = React.useCallback(
      (destinationItem: TreeViewItem) =>
        selectedItems.every(item => {
          if (
            item.content.getEventsFunction() &&
            destinationItem.content.getEventsFunction()
          ) {
            // Functions from the same container
            return (
              item.content.getEventsFunctionsContainer() ===
              destinationItem.content.getEventsFunctionsContainer()
            );
          }
          // Behaviors or Objects
          return (
            (item.content.getEventsBasedBehavior() &&
              destinationItem.content.getEventsBasedBehavior()) ||
            (item.content.getEventsBasedObject() &&
              destinationItem.content.getEventsBasedObject())
          );
        }),
      [selectedItems]
    );

    const moveSelectionTo = React.useCallback(
      (
        i18n: I18nType,
        destinationItem: TreeViewItem,
        where: 'before' | 'inside' | 'after'
      ) => {
        if (selectedItems.length === 0) {
          return;
        }
        const selectedItem = selectedItems[0];
        selectedItem.content.moveAt(
          destinationItem.content.getIndex() + (where === 'after' ? 1 : 0)
        );
      },
      [selectedItems]
    );

    /**
     * Unselect item if one of the parent is collapsed (folded) so that the item
     * does not stay selected and not visible to the user.
     */
    const onCollapseItem = React.useCallback((item: TreeViewItem) => {
      // TODO
    }, []);

    // Force List component to be mounted again if project or objectsContainer
    // has been changed. Avoid accessing to invalid objects that could
    // crash the app.
    const listKey = project.ptr + ';' + eventsFunctionsExtension.ptr;
    const initiallyOpenedNodeIds = [
      extensionObjectsRootFolderId,
      extensionBehaviorsRootFolderId,
      extensionFunctionsRootFolderId,
      ...objectTreeViewItems.map(item => item.content.getId()),
      ...behaviorTreeViewItems.map(item => item.content.getId()),
    ];

    const arrowKeyNavigationProps = React.useMemo(
      () => ({
        onGetItemInside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          if (!item.objectFolderOrObject.isFolder()) return null;
          else {
            if (item.objectFolderOrObject.getChildrenCount() === 0) return null;
            return {
              objectFolderOrObject: item.objectFolderOrObject.getChildAt(0),
              global: item.global,
            };
          }
        },
        onGetItemOutside: item => {
          if (item.isPlaceholder || item.isRoot) return null;
          const parent = item.objectFolderOrObject.getParent();
          if (parent.isRootFolder()) return null;
          return {
            objectFolderOrObject: parent,
            global: item.global,
          };
        },
      }),
      []
    );

    return (
      <Background maxWidth>
        <Column>
          <LineStackLayout>
            <Column expand noMargin>
              <SearchBar
                value={searchText}
                onRequestSearch={() => {}}
                onChange={text => setSearchText(text)}
                placeholder={t`Search functions`}
              />
            </Column>
          </LineStackLayout>
        </Column>
        <div
          style={styles.listContainer}
          onKeyDown={keyboardShortcutsRef.current.onKeyDown}
          onKeyUp={keyboardShortcutsRef.current.onKeyUp}
          id="events-function-list"
        >
          <I18n>
            {({ i18n }) => (
              <div style={styles.autoSizerContainer}>
                <AutoSizer style={styles.autoSizer} disableWidth>
                  {({ height }) => (
                    <TreeView
                      key={listKey}
                      ref={treeViewRef}
                      items={getTreeViewData(i18n)}
                      height={height}
                      forceAllOpened={!!currentlyRunningInAppTutorial}
                      searchText={searchText}
                      getItemName={getTreeViewItemName}
                      getItemThumbnail={getTreeViewItemThumbnail}
                      getItemChildren={getTreeViewItemChildren}
                      multiSelect={false}
                      getItemId={getTreeViewItemId}
                      getItemHtmlId={getTreeViewItemHtmlId}
                      getItemDataset={getTreeViewItemData}
                      onEditItem={editItem}
                      onCollapseItem={onCollapseItem}
                      selectedItems={selectedItems}
                      onSelectItems={items => {
                        if (!items) selectObjectFolderOrObjectWithContext(null);
                        const itemToSelect = items[0];
                        if (itemToSelect.isRoot) return;
                        if (!itemToSelect) return;
                        itemToSelect.content.onSelect();
                        setSelectedItems(items);
                      }}
                      onRenameItem={renameItem}
                      buildMenuTemplate={buildMenuTemplate(i18n)}
                      getItemRightButton={getTreeViewItemRightButton}
                      renderLeftComponent={renderTreeViewItemLeftComponent(
                        i18n
                      )}
                      onMoveSelectionToItem={(destinationItem, where) =>
                        moveSelectionTo(i18n, destinationItem, where)
                      }
                      canMoveSelectionToItem={canMoveSelectionTo}
                      reactDndType={objectWithContextReactDndType}
                      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
                      arrowKeyNavigationProps={arrowKeyNavigationProps}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </I18n>
        </div>
        <Line>
          <Column expand>
            <ResponsiveRaisedButton
              label={<Trans>Add a new function</Trans>}
              primary
              onClick={() =>
                addNewEventsFunction(
                  selectedItems.length === 0 ? null : selectedItems[0].content
                )
              }
              id="add-new-function-button"
              icon={<Add />}
            />
          </Column>
        </Line>
      </Background>
    );
  }
);

const arePropsEqual = (prevProps: Props, nextProps: Props): boolean =>
  // The component is costly to render, so avoid any re-rendering as much
  // as possible.
  // We make the assumption that no changes to objects list is made outside
  // from the component.
  // If a change is made, the component won't notice it: you have to manually
  // call forceUpdate.
  prevProps.selectedEventsFunction === nextProps.selectedEventsFunction &&
  prevProps.project === nextProps.project &&
  prevProps.eventsFunctionsExtension === nextProps.eventsFunctionsExtension;

const MemoizedObjectsList = React.memo<Props, EventsFunctionsListInterface>(
  EventsFunctionsList,
  arePropsEqual
);

const EventsFunctionsListWithErrorBoundary = React.forwardRef<
  Props,
  EventsFunctionsListInterface
>((props, ref) => (
  <ErrorBoundary
    componentTitle={<Trans>Objects list</Trans>}
    scope="scene-editor-objects-list"
  >
    <MemoizedObjectsList ref={ref} {...props} />
  </ErrorBoundary>
));

export default EventsFunctionsListWithErrorBoundary;
