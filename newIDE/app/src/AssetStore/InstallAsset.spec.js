// @flow
import {
  addAssetToProject,
  getRequiredBehaviorsFromAsset,
  filterMissingBehaviors,
  downloadExtensions,
  installAsset,
  getRequiredExtensionsForEventsFromAsset,
  filterMissingExtensions,
  sanitizeObjectName,
} from './InstallAsset';
import { makeTestProject } from '../fixtures/TestProject';
import { type EventsFunctionsExtensionsState } from '../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import {
  fakeAssetShortHeader1,
  fakeAsset1,
  fakeAssetWithBehaviorCustomizations1,
  fakeAssetWithUnknownBehaviorCustomizations1,
  fakeAssetWithFlashBehaviorCustomizations1,
  fakeAssetWithEventCustomizationsAndFlashExtension1,
  flashExtensionShortHeader,
  fireBulletExtensionShortHeader,
  fakeAssetWithEventCustomizationsAndUnknownExtension1,
} from '../fixtures/GDevelopServicesTestData';
import { makeTestExtensions } from '../fixtures/TestExtensions';
import {
  getExtensionsRegistry,
  getExtension,
} from '../Utils/GDevelopServices/Extension';
import { jssPreset } from '@material-ui/core';
import { getAsset } from '../Utils/GDevelopServices/Asset';
const gd: libGDevelop = global.gd;

jest.mock('../Utils/GDevelopServices/Extension');
jest.mock('../Utils/GDevelopServices/Asset');

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

describe('InstallAsset', () => {
  describe('sanitizeObjectName', () => {
    expect(sanitizeObjectName('')).toBe('UnnamedObject');
    expect(sanitizeObjectName('HelloWorld')).toBe('HelloWorld');
    expect(sanitizeObjectName('Hello World')).toBe('HelloWorld');
    expect(sanitizeObjectName('hello world')).toBe('HelloWorld');
    expect(sanitizeObjectName('hello world12')).toBe('HelloWorld12');
    expect(sanitizeObjectName('12 hello world')).toBe('_12HelloWorld');
    expect(sanitizeObjectName('/-=hello/-=world/-=')).toBe('HelloWorld');
    expect(sanitizeObjectName('  hello/-=world/-=')).toBe('HelloWorld');
    expect(sanitizeObjectName('9hello/-=world/-=')).toBe('_9helloWorld');
    expect(sanitizeObjectName('  9hello/-=world/-=')).toBe('_9helloWorld');
  });

  describe('addAssetToProject', () => {
    it('installs an object asset in the project, without renaming it if not needed', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout,
        events: layout.getEvents(),
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(output.createdObjects).toEqual([
        layout.getObject('PlayerSpaceship'),
      ]);
      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
    });

    it('renames the object if name is already used', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      layout.insertNewObject(project, 'Sprite', 'PlayerSpaceship', 0);

      const output = await addAssetToProject({
        project,
        objectsContainer: layout,
        events: layout.getEvents(),
        asset: fakeAsset1,
      });

      expect(output.createdObjects).toHaveLength(1);
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(layout.hasObjectNamed('PlayerSpaceship2')).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship1.png')
      ).toBe(true);
      expect(
        project.getResourcesManager().hasResource('player-ship2.png')
      ).toBe(true);
    });

    it('does not add a resource if it is already existing', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const originalResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();

      // Create a resource that is the same as the one added for the spaceship
      const resource = new gd.ImageResource();
      resource.setName('player-ship1.png');
      resource.setFile('https://example.com/player-ship1.png');
      project.getResourcesManager().addResource(resource);
      resource.delete();

      // Install the spaceship
      await addAssetToProject({
        project,
        objectsContainer: layout,
        events: layout.getEvents(),
        asset: fakeAsset1,
      });

      // Verify there was not extra resource added.
      expect(
        project
          .getResourcesManager()
          .getAllResourceNames()
          .toJSArray()
      ).toEqual([
        ...originalResourceNames,
        'player-ship1.png',
        'player-ship2.png',
      ]);
    });

    it('add a resource with a new name, if this name is already taken by another', async () => {
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      const originalResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();

      // Create a resource that is NOT the same as the one added for the spaceship
      // but has the same name.
      const resource = new gd.ImageResource();
      resource.setName('player-ship1.png');
      resource.setFile('https://example.com/some-unrelated-file.png');
      project.getResourcesManager().addResource(resource);
      resource.delete();

      // Install the spaceship
      await addAssetToProject({
        project,
        objectsContainer: layout,
        events: layout.getEvents(),
        asset: fakeAsset1,
      });

      // Verify there was not extra resource added
      expect(
        project
          .getResourcesManager()
          .getAllResourceNames()
          .toJSArray()
      ).toEqual([
        ...originalResourceNames,
        'player-ship1.png',
        'player-ship1.png2',
        'player-ship2.png',
      ]);
      expect(
        project
          .getResourcesManager()
          .getResource('player-ship1.png2')
          .getFile()
      ).toBe('https://example.com/player-ship1.png');

      // Verify the resource names used by the object
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      const object = layout.getObject('PlayerSpaceship');

      const resourcesInUse = new gd.ResourcesInUseHelper();
      object.exposeResources(resourcesInUse);
      const objectResourceNames = resourcesInUse
        .getAllImages()
        .toNewVectorString()
        .toJSArray();
      resourcesInUse.delete();

      expect(objectResourceNames).toEqual([
        'player-ship1.png2',
        'player-ship2.png',
      ]);
    });

    it('installs an object asset in the project, adding the required behaviors', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);

      await addAssetToProject({
        project,
        objectsContainer: layout,
        events: layout.getEvents(),
        asset: fakeAssetWithBehaviorCustomizations1,
      });

      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getAllBehaviorNames()
          .toJSArray()
      ).toEqual(['MyBehavior']);
      expect(
        layout
          .getObject('PlayerSpaceship')
          .getBehavior('MyBehavior')
          .getTypeName()
      ).toBe('FakeBehavior::FakeBehavior');

      // Check that the properties from customization were set.
      expect(
        gd.Serializer.toJSON(
          layout
            .getObject('PlayerSpaceship')
            .getBehavior('MyBehavior')
            .getContent()
        )
      ).toBe('{"property1": "Overriden value","property2": true}');
    });

    it('installs an object asset in the project, adding the required events', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      await addAssetToProject({
        project,
        objectsContainer: layout,
        events: eventsList,
        asset: fakeAssetWithEventCustomizationsAndFlashExtension1,
      });

      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);
      expect(eventsList.getEventsCount()).toBe(1);

      // Check that the events had their customization parameters properly applied
      const serializedEvents = new gd.SerializerElement();
      eventsList.serializeTo(serializedEvents);
      const serializedEventsJson = gd.Serializer.toJSON(serializedEvents);
      expect(serializedEventsJson).toMatch(
        '3 + PlayerSpaceship.Variable(test)'
      );
      expect(serializedEventsJson).toMatch(
        '3 + PlayerSpaceship.Variable(test2)'
      );
    });

    it('renames the object if name is already used, including in events', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Add an object with the same name as the object asset.
      layout.insertNewObject(project, 'Sprite', 'PlayerSpaceship', 0);
      expect(layout.hasObjectNamed('PlayerSpaceship')).toBe(true);

      await addAssetToProject({
        project,
        objectsContainer: layout,
        events: eventsList,
        asset: fakeAssetWithEventCustomizationsAndFlashExtension1,
      });

      expect(layout.hasObjectNamed('PlayerSpaceship2')).toBe(true);
      expect(eventsList.getEventsCount()).toBe(1);

      // Check that the events had their customization parameters properly applied
      // and the object renamed.
      const serializedEvents = new gd.SerializerElement();
      eventsList.serializeTo(serializedEvents);
      const serializedEventsJson = gd.Serializer.toJSON(serializedEvents);
      expect(serializedEventsJson).toMatch(
        '3 + PlayerSpaceship2.Variable(test)'
      );
      expect(serializedEventsJson).toMatch(
        '3 + PlayerSpaceship2.Variable(test2)'
      );
    });
  });

  describe('getRequiredBehaviorsFromAsset', () => {
    it('get the behaviors required for an asset', () => {
      expect(
        getRequiredBehaviorsFromAsset(
          fakeAssetWithEventCustomizationsAndFlashExtension1
        )
      ).toEqual([]);
      expect(
        getRequiredBehaviorsFromAsset(fakeAssetWithBehaviorCustomizations1)
      ).toEqual([
        {
          behaviorType: 'FakeBehavior::FakeBehavior',
          extensionName: 'FakeBehavior',
          extensionVersion: '1.0.0',
        },
      ]);
    });
  });

  describe('getRequiredExtensionsForEventsFromAsset', () => {
    it('get the extensions required for an asset', () => {
      expect(
        getRequiredExtensionsForEventsFromAsset(
          fakeAssetWithBehaviorCustomizations1
        )
      ).toEqual([]);
      expect(
        getRequiredExtensionsForEventsFromAsset(
          fakeAssetWithEventCustomizationsAndFlashExtension1
        )
      ).toEqual([
        {
          extensionName: 'Flash',
          extensionVersion: '1.0.0',
        },
      ]);
    });
  });

  describe('filterMissingBehaviors', () => {
    it('filters behaviors that are not loaded ', () => {
      makeTestExtensions(gd);

      expect(
        filterMissingBehaviors(gd, [
          // An unknown behavior not loaded:
          {
            extensionName: 'NotExistingExtension',
            extensionVersion: '1.0.0',
            behaviorType: 'NotExistingExtension::MissingBehavior',
          },
          // A fake behavior loaded in makeTestExtensions:
          {
            behaviorType: 'FakeBehavior::FakeBehavior',
            extensionName: 'FakeBehavior',
            extensionVersion: '1.0.0',
          },
        ])
      ).toEqual([
        {
          extensionName: 'NotExistingExtension',
          extensionVersion: '1.0.0',
          behaviorType: 'NotExistingExtension::MissingBehavior',
        },
      ]);
    });
  });

  describe('filterMissingExtensions', () => {
    it('filters extensions that are not loaded ', () => {
      makeTestExtensions(gd);

      expect(
        filterMissingExtensions(gd, [
          // An unknown behavior not loaded:
          {
            extensionName: 'NotExistingExtension',
            extensionVersion: '1.0.0',
          },
          // A fake extension loaded in makeTestExtensions:
          {
            extensionName: 'FakeBehavior',
            extensionVersion: '1.0.0',
          },
        ])
      ).toEqual([
        {
          extensionName: 'NotExistingExtension',
          extensionVersion: '1.0.0',
        },
      ]);
    });
  });

  describe('downloadExtensions', () => {
    it('loads the required extensions ', async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => fireBulletExtensionShortHeader
      );

      await expect(downloadExtensions(['FireBullet'])).resolves.toEqual([
        fireBulletExtensionShortHeader,
      ]);
    });

    it('errors if an extension is not found ', async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      await expect(
        downloadExtensions(['NotFoundExtension'])
      ).rejects.toMatchObject({
        message: 'Unable to find extension NotFoundExtension in the registry.',
      });
    });

    it("errors if the registry can't be loaded ", async () => {
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => {
        throw new Error('Fake error');
      });

      await expect(downloadExtensions(['FakeExtension'])).rejects.toMatchObject(
        { message: 'Fake error' }
      );
    });
  });

  describe('installAsset', () => {
    beforeEach(() => {
      mockFn(getAsset).mockReset();
      mockFn(getExtensionsRegistry).mockReset();
      mockFn(getExtension).mockReset();
    });

    const mockEventsFunctionsExtensionsState: EventsFunctionsExtensionsState = {
      eventsFunctionsExtensionsError: null,
      loadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtensions: () => {},
      reloadProjectEventsFunctionsExtensions: () => Promise.resolve(),
      unloadProjectEventsFunctionsExtension: () => {},
      getEventsFunctionsExtensionWriter: () => null,
      getEventsFunctionsExtensionOpener: () => null,
      ensureLoadFinished: () => Promise.resolve(),
      getIncludeFileHashs: () => ({}),
    };

    it("throws if asset can't be downloaded", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();
      mockFn(getAsset).mockImplementationOnce(() => {
        throw new Error('Fake error - unable to download');
      });

      await expect(
        installAsset({
          assetShortHeader: fakeAssetShortHeader1,
          events: eventsList,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        })
      ).rejects.toMatchObject({
        message: 'Fake error - unable to download',
      });

      expect(getExtensionsRegistry).not.toHaveBeenCalled();
      expect(getExtension).not.toHaveBeenCalled();
    });

    it("throws if an extension for a behavior can't be found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Get an asset that uses a behavior...
      mockFn(getAsset).mockImplementationOnce(
        () => fakeAssetWithUnknownBehaviorCustomizations1
      );

      // ...but this behavior extension does not exist in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      // Check that the extension is stated as not found in the registry
      await expect(
        installAsset({
          assetShortHeader: fakeAssetShortHeader1,
          events: eventsList,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        })
      ).rejects.toMatchObject({
        message: 'Unable to find extension UnknownBehavior in the registry.',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).not.toHaveBeenCalled();
    });

    it("throws if an extension can't be found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Get an asset that uses an extension...
      mockFn(getAsset).mockImplementationOnce(
        () => fakeAssetWithEventCustomizationsAndUnknownExtension1
      );

      // ...but this extension does not exist in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      // Check that the extension is stated as not found in the registry
      await expect(
        installAsset({
          assetShortHeader: fakeAssetShortHeader1,
          events: eventsList,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        })
      ).rejects.toMatchObject({
        message: 'Unable to find extension UnknownExtension in the registry.',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).not.toHaveBeenCalled();
    });

    it("throws if a behavior can't be installed, even if its extension was properly found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Get an asset that uses a behavior...
      mockFn(getAsset).mockImplementationOnce(
        () => fakeAssetWithFlashBehaviorCustomizations1
      );

      // ...and this behavior extension is in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => flashExtensionShortHeader
      );

      // Verify that, because we use `mockEventsFunctionsExtensionsState`, the
      // extension won't be loaded, so the behavior won't be installed.
      await expect(
        installAsset({
          assetShortHeader: fakeAssetShortHeader1,
          events: eventsList,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        })
      ).rejects.toMatchObject({
        message: 'These behaviors could not be installed: Flash::Flash (Flash)',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).toHaveBeenCalledTimes(1);
    });

    it("throws if an extension can't be installed, even if it was properly found in the registry", async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Get an asset that uses an extension...
      mockFn(getAsset).mockImplementationOnce(
        () => fakeAssetWithEventCustomizationsAndFlashExtension1
      );

      // ...and this extension is in the registry
      mockFn(getExtensionsRegistry).mockImplementationOnce(() => ({
        version: '1.0.0',
        allTags: [''],
        extensionShortHeaders: [
          flashExtensionShortHeader,
          fireBulletExtensionShortHeader,
        ],
      }));

      mockFn(getExtension).mockImplementationOnce(
        () => flashExtensionShortHeader
      );

      // Verify that, because we use `mockEventsFunctionsExtensionsState`, the
      // extension won't be loaded, so the extension won't be installed.
      await expect(
        installAsset({
          assetShortHeader: fakeAssetShortHeader1,
          events: eventsList,
          project,
          objectsContainer: layout,
          eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
        })
      ).rejects.toMatchObject({
        message: 'These extensions could not be installed: Flash',
      });

      expect(getExtensionsRegistry).toHaveBeenCalledTimes(1);
      expect(getExtension).toHaveBeenCalledTimes(1);
    });

    it('install an asset, with a behavior that is already installed', async () => {
      makeTestExtensions(gd);
      const { project } = makeTestProject(gd);
      const layout = project.insertNewLayout('MyTestLayout', 0);
      const eventsList = new gd.EventsList();

      // Fake an asset with a behavior of type "FakeBehavior::FakeBehavior",
      // that is installed already.
      mockFn(getAsset).mockImplementationOnce(
        () => fakeAssetWithBehaviorCustomizations1
      );

      // Install the asset
      await installAsset({
        assetShortHeader: fakeAssetShortHeader1,
        events: eventsList,
        project,
        objectsContainer: layout,
        eventsFunctionsExtensionsState: mockEventsFunctionsExtensionsState,
      });

      // No extensions fetched because the behavior is already installed.
      expect(getExtension).not.toHaveBeenCalled();
      expect(getExtensionsRegistry).not.toHaveBeenCalled();

      // Check that the object was created, with the proper behavior:
      expect(layout.getObjectsCount()).toBe(1);
      expect(layout.getObjectAt(0).getName()).toBe('PlayerSpaceship');
      expect(
        layout
          .getObjectAt(0)
          .getAllBehaviorNames()
          .toJSArray()
      ).toEqual(['MyBehavior']);
    });
  });
});
