// @ts-check

describe('Multiplayer', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  /**
   * @param {{name: string}} settings
   * @returns {SceneAndExtensionsData}
   */
  const getFakeSceneAndExtensionData = ({ name }) => ({
    sceneData: {
      layers: [
        {
          name: '',
          visibility: true,
          effects: [],
          cameras: [],
          ambientLightColorR: 0,
          ambientLightColorG: 0,
          ambientLightColorB: 0,
          isLightingLayer: false,
          followBaseLayerCamera: true,
        },
      ],
      r: 0,
      v: 0,
      b: 0,
      mangledName: name,
      name: name,
      stopSoundsOnStartup: false,
      title: '',
      behaviorsSharedData: [],
      objects: [
        {
          type: 'Sprite',
          name: 'MySpriteObject',
          behaviors: [
            {
              name: 'MultiplayerObject',
              type: 'Multiplayer::MultiplayerObjectBehavior',
              playerNumber: 0,
              actionOnPlayerDisconnect: 'Destroy',
            },
          ],
          effects: [],
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; name: string; behaviors: nev... Remove this comment to see the full error message
          animations: [],
          variables: [],
        },
      ],
      instances: [],
      variables: [],
      usedResources: [],
    },
    usedExtensionsWithVariablesData: [],
  });

  /**
   *
   * @param {gdjs.RuntimeScene} scene
   * @param {string} objectName
   * @returns {{object: gdjs.RuntimeObject, behavior: gdjs.MultiplayerObjectRuntimeBehavior}[]}
   */
  const getObjectAndMultiplayerBehaviorsFromScene = (scene, objectName) => {
    const objects = scene.getObjects(objectName);
    if (!objects)
      throw new Error(`No object with name ${objectName} found in scene`);
    return objects.map((object) => {
      /** @type {gdjs.MultiplayerObjectRuntimeBehavior | null} */
      // @ts-ignore - We know this returns a MultiplayerObjectRuntimeBehavior
      const behavior = object.getBehavior('MultiplayerObject');
      if (!behavior)
        throw new Error(
          `No MultiplayerObject behavior found on object ${objectName}`
        );
      return { object, behavior };
    });
  };

  const makeTestRuntimeSceneWithNetworkId = (timeDelta = 1000 / 60) => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
    runtimeScene.loadFromScene(
      getFakeSceneAndExtensionData({ name: 'Scene1' })
    );
    runtimeScene._timeManager.getElapsedTime = function () {
      return timeDelta;
    };
    runtimeScene.networkId = 'fake-hardcoded-scene-network-id';
    return runtimeScene;
  };

  /**
   * A mocked P2P event data.
   * @implements {gdjs.evtTools.p2p.IEventData}
   */
  class MockedEventData {
    /**
     * @param {string} data
     * @param {string} sender
     **/
    constructor(data, sender) {
      this.data = data;
      this.sender = sender;
    }

    /**
     * The data sent alongside the event.
     */
    data = '';

    /**
     * The ID of the sender of the event.
     */
    sender = '';
  }

  /**
   * A mocked P2P event.
   * @implements {gdjs.evtTools.p2p.IEvent}
   */
  class MockedEvent {
    data = [];
    dataloss = false;

    isTriggered() {
      return this.data.length > 0;
    }

    /**
     * @param {gdjs.evtTools.p2p.IEventData} newData
     */
    pushData(newData) {
      if (this.dataloss && this.data.length > 0) this.data[0] = newData;
      else this.data.push(newData);
    }

    popData() {
      this.data.shift();
    }

    getData() {
      return this.data.length === 0 ? '' : this.data[0].data;
    }

    getSender() {
      return this.data.length === 0 ? '' : this.data[0].sender;
    }
  }

  /**
   * Create a mocked P2P handler.
   * It stores the events sent to/from peers.
   */
  const createP2PAndMultiplayerMessageManagerMock = () => {
    const p2pState = {
      currentPeerId: '',
      otherPeerIds: [],
    };

    /** @type {Record<string, Map<string, MockedEvent>>} */
    const peerEvents = {};

    /** @type {Record<string, gdjs.MultiplayerMessageManager>} */
    const peerMultiplayerMessageManager = {};

    const getPeerEvents = (peerId) =>
      (peerEvents[peerId] = peerEvents[peerId] || new Map());

    /**
     * @param {string} eventName
     * @returns {gdjs.evtTools.p2p.IEvent}
     */
    const getEvent = (eventName) => {
      const events = getPeerEvents(p2pState.currentPeerId);
      let event = events.get(eventName);
      if (!event) events.set(eventName, (event = new MockedEvent()));
      return event;
    };

    /**
     * @param {string} peerId
     * @param {string} eventName
     * @param {string} eventData
     */
    const sendDataTo = (peerId, eventName, eventData) => {
      // console.log(`## SENDING DATA TO ${peerId}:`, eventName, eventData);
      const events = getPeerEvents(peerId);
      let event = events.get(eventName);
      if (!event) events.set(eventName, (event = new MockedEvent()));
      event.pushData(new MockedEventData(eventData, peerId));
    };

    /** @type {typeof gdjs.evtTools.p2p} */
    const p2pMock = {
      // @ts-ignore - this is a mock so private properties can't be the same.
      Event: MockedEvent,
      EventData: MockedEventData,
      sendVariableTo: () => {},
      sendVariableToAll: () => {},
      getEventVariable: (eventName, variable) => {
        variable.fromJSON(getEvent(eventName).getData());
      },
      onEvent: (eventName, dataloss) => {
        const event = getEvent(eventName);
        event.dataloss = dataloss;
        const isTriggered = event.isTriggered();
        return isTriggered;
      },
      getEvent,
      connect: (id) => {},
      disconnectFromPeer: (id) => {},
      disconnectFromAllPeers: () => {},
      disconnectFromAll: () => {},
      disconnectFromBroker: () => {},
      sendDataTo,
      sendDataToAll: (eventName, eventData) => {
        p2pState.otherPeerIds.forEach((peerId) => {
          sendDataTo(peerId, eventName, eventData);
        });
      },
      getEventData: (eventName) => getEvent(eventName).getData(),
      getEventSender: (eventName) => getEvent(eventName).getSender(),
      getEvents: () => getPeerEvents(p2pState.currentPeerId),
      useCustomBrokerServer: () => {},
      useDefaultBrokerServer: () => {},
      useCustomICECandidate: () => {},
      forceUseRelayServer: (shouldUseRelayServer) => {},
      overrideId: (id) => {},
      getCurrentId: () => 'fake-current-id',
      isReady: () => true,
      onError: () => false,
      getLastError: () => '',
      onDisconnect: () => false,
      getDisconnectedPeer: () => '',
      onConnection: () => false,
      getConnectedPeer: () => '',
      getAllPeers: () => p2pState.otherPeerIds,
      getConnectionInstance: () => undefined,
    };

    gdjs.evtTools.p2p = p2pMock;

    return {
      switchToPeer: ({ peerId, otherPeerIds, playerNumber }) => {
        // console.log('## SWITCHING TO PEER', peerId);

        // Switch the state of the P2P mock.
        p2pState.currentPeerId = peerId;
        p2pState.otherPeerIds = otherPeerIds;

        // Switch the state of the MultiplayerMessageManager.
        gdjs.multiplayerMessageManager = peerMultiplayerMessageManager[peerId] =
          peerMultiplayerMessageManager[peerId] ||
          gdjs.makeMultiplayerMessageManager();

        // Switch the state of the game.
        gdjs.multiplayer.playerNumber = playerNumber;
      },
      logEvents: () => {
        Object.keys(peerEvents).forEach((peerId) => {
          console.log(`## PEER ${peerId} events:`);
          for (const [eventName, event] of peerEvents[peerId]) {
            console.log(`${eventName}: ${JSON.stringify(event.data)}`);
          }
        });
      },
      markAllPeerEventsAsProcessed: () => {
        for (const events of Object.values(peerEvents)) {
          for (const event of events.values()) {
            event.popData();
          }
        }
      },
      expectNoEventsToBeProcessed: () => {
        for (const events of Object.values(peerEvents)) {
          for (const event of events.values()) {
            expect(event.isTriggered()).to.be(false);
          }
        }
      },
    };
  };

  let _originalP2pIfAny = undefined;

  const fakeLobby = {
    id: 'fake-lobby-id',
    name: 'Fake lobby',
    status: 'Playing',
    players: [
      {
        playerId: 'player-1',
        status: 'Playing',
      },
      {
        playerId: 'player-2',
        status: 'Playing',
      },
      {
        playerId: 'player-3',
        status: 'Playing',
      },
    ],
  };

  beforeEach(() => {
    _originalP2pIfAny = gdjs.evtTools.p2p;
    gdjs.multiplayer.disableMultiplayerForTesting = false;
    gdjs.multiplayer._isGameRunning = true;
    gdjs.multiplayer._lobby = fakeLobby;
  });
  afterEach(() => {
    gdjs.evtTools.p2p = _originalP2pIfAny;
    gdjs.multiplayer.disableMultiplayerForTesting = true;
    gdjs.multiplayer._isGameRunning = false;
    gdjs.multiplayer._lobby = null;
  });

  describe('Single scene tests', () => {
    it.only('synchronizes scene/global variables from the host to other players', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p1StringVariable = new gdjs.Variable();
      p1StringVariable.setString('Hello from remote world');
      const p1NumberVariable = new gdjs.Variable();
      p1NumberVariable.setNumber(42);
      const p1BooleanVariable = new gdjs.Variable();
      p1BooleanVariable.setBoolean(false);

      p1RuntimeScene.getVariables().add('MyStringVariable', p1StringVariable);
      p1RuntimeScene.getVariables().add('MyNumberVariable', p1NumberVariable);
      p1RuntimeScene.getVariables().add('MyBooleanVariable', p1BooleanVariable);

      p1RuntimeScene.renderAndStep(1000 / 60);

      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p2RuntimeScene.renderAndStep(1000 / 60);
      markAllPeerEventsAsProcessed();
      expect(p2RuntimeScene.getVariables().has('MyStringVariable')).to.be(true);
      expect(p2RuntimeScene.getVariables().has('MyNumberVariable')).to.be(true);
      expect(p2RuntimeScene.getVariables().has('MyBooleanVariable')).to.be(
        true
      );
      expect(
        p2RuntimeScene.getVariables().get('MyStringVariable').getAsString()
      ).to.be('Hello from remote world');
      expect(
        p2RuntimeScene.getVariables().get('MyNumberVariable').getAsNumber()
      ).to.be(42);
      expect(
        p2RuntimeScene.getVariables().get('MyBooleanVariable').getAsBoolean()
      ).to.be(false);

      // Also check global variables.
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });

      const p1GlobalStringVariable = new gdjs.Variable();
      p1GlobalStringVariable.setString('Hello from remote global world');
      const p1GlobalNumberVariable = new gdjs.Variable();
      p1GlobalNumberVariable.setNumber(142);
      const p1GlobalBooleanVariable = new gdjs.Variable();
      p1GlobalBooleanVariable.setBoolean(false);
      const p1GlobalArrayVariable = new gdjs.Variable();
      p1GlobalArrayVariable.pushValue('Hello from remote global array');
      p1GlobalArrayVariable.pushValue(143);
      p1GlobalArrayVariable.pushValue(true);
      const p1GlobalStructureVariable = new gdjs.Variable();
      const p1GlobalStructureVariableChildString = new gdjs.Variable();
      p1GlobalStructureVariableChildString.setString(
        'Hello from remote global structure'
      );
      const p1GlobalStructureVariableChildNumber = new gdjs.Variable();
      p1GlobalStructureVariableChildNumber.setNumber(144);
      const p1GlobalStructureVariableChildBoolean = new gdjs.Variable();
      p1GlobalStructureVariableChildBoolean.setBoolean(true);
      p1GlobalStructureVariable.addChild(
        'first',
        p1GlobalStructureVariableChildString
      );
      p1GlobalStructureVariable.addChild(
        'second',
        p1GlobalStructureVariableChildNumber
      );
      p1GlobalStructureVariable.addChild(
        'third',
        p1GlobalStructureVariableChildBoolean
      );

      p1RuntimeScene
        .getGame()
        .getVariables()
        .add('MyGlobalStringVariable', p1GlobalStringVariable);
      p1RuntimeScene
        .getGame()
        .getVariables()
        .add('MyGlobalNumberVariable', p1GlobalNumberVariable);
      p1RuntimeScene
        .getGame()
        .getVariables()
        .add('MyGlobalBooleanVariable', p1GlobalBooleanVariable);
      p1RuntimeScene
        .getGame()
        .getVariables()
        .add('MyGlobalArrayVariable', p1GlobalArrayVariable);
      p1RuntimeScene
        .getGame()
        .getVariables()
        .add('MyGlobalStructureVariable', p1GlobalStructureVariable);

      p1RuntimeScene.renderAndStep(1000 / 60);

      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      p2RuntimeScene.renderAndStep(1000 / 60);
      markAllPeerEventsAsProcessed();
      expect(
        p2RuntimeScene.getGame().getVariables().has('MyGlobalStringVariable')
      ).to.be(true);
      expect(
        p2RuntimeScene.getGame().getVariables().has('MyGlobalNumberVariable')
      ).to.be(true);
      expect(
        p2RuntimeScene.getGame().getVariables().has('MyGlobalBooleanVariable')
      ).to.be(true);
      expect(
        p2RuntimeScene.getGame().getVariables().has('MyGlobalArrayVariable')
      ).to.be(true);
      expect(
        p2RuntimeScene.getGame().getVariables().has('MyGlobalStructureVariable')
      ).to.be(true);

      expect(
        p2RuntimeScene
          .getGame()
          .getVariables()
          .get('MyGlobalStringVariable')
          .getAsString()
      ).to.be('Hello from remote global world');
      expect(
        p2RuntimeScene
          .getGame()
          .getVariables()
          .get('MyGlobalNumberVariable')
          .getAsNumber()
      ).to.be(142);
      expect(
        p2RuntimeScene
          .getGame()
          .getVariables()
          .get('MyGlobalBooleanVariable')
          .getAsBoolean()
      ).to.be(false);
      const p2GlobalArrayVariable = p2RuntimeScene
        .getGame()
        .getVariables()
        .get('MyGlobalArrayVariable')
        .getAllChildrenArray();
      expect(p2GlobalArrayVariable.length).to.be(3);
      expect(p2GlobalArrayVariable[0].getAsString()).to.be(
        'Hello from remote global array'
      );
      expect(p2GlobalArrayVariable[1].getAsNumber()).to.be(143);
      expect(p2GlobalArrayVariable[2].getAsBoolean()).to.be(true);
      const p2GlobalStructureVariable = p2RuntimeScene
        .getGame()
        .getVariables()
        .get('MyGlobalStructureVariable');
      expect(p2GlobalStructureVariable.hasChild('first')).to.be(true);
      expect(p2GlobalStructureVariable.hasChild('second')).to.be(true);
      expect(p2GlobalStructureVariable.hasChild('third')).to.be(true);
      expect(p2GlobalStructureVariable.getChild('first').getAsString()).to.be(
        'Hello from remote global structure'
      );
      expect(p2GlobalStructureVariable.getChild('second').getAsNumber()).to.be(
        144
      );
      expect(p2GlobalStructureVariable.getChild('third').getAsBoolean()).to.be(
        true
      );
    });

    it('overrides a scene/global variable, modified by a player, when synchronized by the host', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
        expectNoEventsToBeProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p1Variable = new gdjs.Variable();
      p1Variable.setString('Hello from remote world');
      p1RuntimeScene.getVariables().add('MyVariable', p1Variable);

      p1RuntimeScene.renderAndStep(1000 / 60);

      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      // Verify player 2 can create variables, but the one from the host will override any value set for it
      // by player 2.
      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      {
        const variable = new gdjs.Variable();
        variable.setString('This will be overriden');
        p2RuntimeScene.getVariables().add('MyVariable', variable);
      }
      {
        const variable = new gdjs.Variable();
        variable.setString('Something else');
        p2RuntimeScene.getVariables().add('MyOtherVariable', variable);
      }
      p2RuntimeScene.renderAndStep(1000 / 60);
      markAllPeerEventsAsProcessed();
      expect(
        p2RuntimeScene.getVariables().get('MyVariable').getAsString()
      ).to.be('Hello from remote world');
      expect(
        p2RuntimeScene.getVariables().get('MyOtherVariable').getAsString()
      ).to.be('Something else');

      expectNoEventsToBeProcessed();

      // Check the host sends again the variable, even if not changed, for reliability
      // (allows to work around a dropped message, without using a real acknowledgement).
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });

      p1RuntimeScene.renderAndStep(1000 / 60);

      // Check the variable on player 2 is overriden again.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      p2RuntimeScene
        .getVariables()
        .get('MyVariable')
        .setString('Changed value that will be overriden again');
      p2RuntimeScene.renderAndStep(1000 / 60);
      expect(
        p2RuntimeScene.getVariables().get('MyVariable').getAsString()
      ).to.be('Hello from remote world');
      expect(
        p2RuntimeScene.getVariables().get('MyOtherVariable').getAsString()
      ).to.be('Something else');

      markAllPeerEventsAsProcessed();
      expectNoEventsToBeProcessed();
    });

    it('synchronizes objects from the host to other players', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on the host's game:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p1RuntimeScene.createObject('MySpriteObject');
      const {
        object: p1SpriteObjectOriginal,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p1RuntimeScene,
        'MySpriteObject'
      )[0];
      p1SpriteObjectOriginal.setX(142);
      p1SpriteObjectOriginal.setY(143);

      p1RuntimeScene.renderAndStep(1000 / 60);

      // Check the object is created on the other peer.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p2Objects = p2RuntimeScene.getObjects('MySpriteObject');
      if (!p2Objects) throw new Error('No objects found');
      expect(p2Objects.length).to.be(0);
      p2RuntimeScene.renderAndStep(1000 / 60);
      markAllPeerEventsAsProcessed();

      const {
        object: p2SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];
      expect(p2SpriteObject.getX()).to.be(142);
      expect(p2SpriteObject.getY()).to.be(143);

      // Move the object on the host's game:
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        const {
          object: p1SpriteObject,
          behavior: p1SpriteObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        p1SpriteObjectBehavior._objectMaxTickRate = Infinity;
        p1SpriteObject.setX(242);
        p1SpriteObject.setY(243);
        p1RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is moved on the other peer.
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });
        p2RuntimeScene.renderAndStep(1000 / 60);
        markAllPeerEventsAsProcessed();

        const {
          object: p2SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p2SpriteObject.getX()).to.be(242);
        expect(p2SpriteObject.getY()).to.be(243);
      }

      // Destroy the object on the host's game:
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        const {
          object: p1SpriteObject1,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        p1SpriteObject1.deleteFromScene(p1RuntimeScene);
        p1RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is deleted on the other peer.
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });
        p2RuntimeScene.renderAndStep(1000 / 60);
        markAllPeerEventsAsProcessed();

        const p2Objects = p2RuntimeScene.getObjects('MySpriteObject');
        if (!p2Objects) throw new Error('No objects found');

        expect(p2Objects.length).to.be(0);
      }
    });

    it('synchronizes objects from a player to the host to other players', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on a player:
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p2RuntimeScene.createObject('MySpriteObject');
      const {
        object: mySpriteObjectOriginal,
        behavior: mySpriteObjectBehavior,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];
      mySpriteObjectOriginal.setX(142);
      mySpriteObjectOriginal.setY(143);
      mySpriteObjectBehavior.setPlayerObjectOwnership(2);

      p2RuntimeScene.renderAndStep(1000 / 60);

      // Check the object is created on the host's game.
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p1Objects = p1RuntimeScene.getObjects('MySpriteObject');
      if (!p1Objects) throw new Error('No objects found');
      expect(p1Objects.length).to.be(0);
      p1RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p1SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p1RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p1SpriteObject.getX()).to.be(142);
      expect(p1SpriteObject.getY()).to.be(143);

      // Check the object is created on the other player.
      switchToPeer({
        peerId: 'player-3',
        otherPeerIds: ['player-1'],
        playerNumber: 3,
      });

      const p3RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p3Objects = p3RuntimeScene.getObjects('MySpriteObject');
      if (!p3Objects) throw new Error('No objects found');
      expect(p3Objects.length).to.be(0);
      p3RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p3SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p3RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p3SpriteObject.getX()).to.be(142);
      expect(p3SpriteObject.getY()).to.be(143);

      markAllPeerEventsAsProcessed();

      // Move the object on the player:
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });

        const {
          object: p2SpriteObject,
          behavior: p2SpriteObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];

        p2SpriteObjectBehavior._objectMaxTickRate = Infinity;
        p2SpriteObject.setX(242);
        p2SpriteObject.setY(243);
        p2RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is moved on the host's game.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });
        p1RuntimeScene.renderAndStep(1000 / 60);

        const {
          object: p1SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p1SpriteObject.getX()).to.be(242);
        expect(p1SpriteObject.getY()).to.be(243);
      }

      // Check the object is moved on the other player.
      {
        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });
        p3RuntimeScene.renderAndStep(1000 / 60);
        markAllPeerEventsAsProcessed();

        const {
          object: p3SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p3SpriteObject.getX()).to.be(242);
        expect(p3SpriteObject.getY()).to.be(243);
      }

      // Destroy the object (on player 2):
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });

        const {
          object: p2SpriteObject1,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];

        p2SpriteObject1.deleteFromScene(p2RuntimeScene);
        p2RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is deleted on the host's game.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        const p1ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        );
        expect(p1ObjectsAndBehaviors.length).to.be(1);
        p1RuntimeScene.renderAndStep(1000 / 60);
        const p1ObjectsAndBehaviorsUpdated = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        );
        expect(p1ObjectsAndBehaviorsUpdated.length).to.be(0);
      }

      // Check the object is deleted on the other player.
      {
        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });

        const p3ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        );
        expect(p3ObjectsAndBehaviors.length).to.be(1);
        p3RuntimeScene.renderAndStep(1000 / 60);
        const p3ObjectsAndBehaviorsUpdated = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        );
        expect(p3ObjectsAndBehaviorsUpdated.length).to.be(0);
      }

      markAllPeerEventsAsProcessed();
    });

    it('allows ownership to change from host to a player to another player', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
        expectNoEventsToBeProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on the host's game:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p1RuntimeScene.createObject('MySpriteObject');
      const {
        object: p1SpriteObjectOriginal,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p1RuntimeScene,
        'MySpriteObject'
      )[0];
      p1SpriteObjectOriginal.setX(142);
      p1SpriteObjectOriginal.setY(143);

      p1RuntimeScene.renderAndStep(1000 / 60);

      // Check the object is created on the players.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p2RuntimeScene.renderAndStep(1000 / 60);
      const {
        object: p2SpriteObjectOriginal,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];
      expect(p2SpriteObjectOriginal.getX()).to.be(142);
      expect(p2SpriteObjectOriginal.getY()).to.be(143);

      switchToPeer({
        peerId: 'player-3',
        otherPeerIds: ['player-1'],
        playerNumber: 3,
      });

      const p3RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p3RuntimeScene.renderAndStep(1000 / 60);
      const {
        object: p3SpriteObjectOriginal,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p3RuntimeScene,
        'MySpriteObject'
      )[0];
      expect(p3SpriteObjectOriginal.getX()).to.be(142);
      expect(p3SpriteObjectOriginal.getY()).to.be(143);

      markAllPeerEventsAsProcessed();
      expectNoEventsToBeProcessed();

      // Check player 3 can get ownership (and can directly move the instance, without waiting for the
      // host to acknowledge the change).
      {
        const {
          object: p3SpriteObject,
          behavior: p3MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];
        p3SpriteObject.setX(342);
        p3SpriteObject.setY(343);
        p3MultiplayerObjectBehavior.setPlayerObjectOwnership(3);

        p3RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the host is notified of the new ownership (and the new position).
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        p1RuntimeScene.renderAndStep(1000 / 60);

        const {
          object: p1SpriteObject,
          behavior: p1MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p1MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(3);
        expect(p1SpriteObject.getX()).to.be(342);
        expect(p1SpriteObject.getY()).to.be(343);
      }

      // Check the player 2 is notified of the new ownership (and the new position).
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });

        p2RuntimeScene.renderAndStep(1000 / 60);

        const {
          object: p2SpriteObject,
          behavior: p2MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p2MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(3);
        expect(p2SpriteObject.getX()).to.be(342);
        expect(p2SpriteObject.getY()).to.be(343);

        markAllPeerEventsAsProcessed();
        markAllPeerEventsAsProcessed();
        expectNoEventsToBeProcessed();
      }

      // Check player 2 can get ownership.
      // It will also communicate the new position/changes to the instance.
      {
        const {
          object: p2SpriteObject,
          behavior: p2MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];
        p2MultiplayerObjectBehavior.setPlayerObjectOwnership(2);
        p2SpriteObject.setX(242);
        p2SpriteObject.setY(243);

        p2RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the host is notified of the new ownership.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        const {
          behavior: p1MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p1MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(3);
        p1RuntimeScene.renderAndStep(1000 / 60);

        const {
          behavior: p1MultiplayerObjectBehaviorUpdated,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(
          p1MultiplayerObjectBehaviorUpdated.getPlayerObjectOwnership()
        ).to.be(2);
      }

      // Check the player 3 is notified of the new ownership.
      {
        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });

        const {
          behavior: p3MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p3MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(3);
        p3RuntimeScene.renderAndStep(1000 / 60);

        const {
          behavior: p3MultiplayerObjectBehaviorUpdated,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(
          p3MultiplayerObjectBehaviorUpdated.getPlayerObjectOwnership()
        ).to.be(2);
      }

      markAllPeerEventsAsProcessed();

      // Check that the position given by player 2 is updated on the host and player 3.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        const {
          behavior: p1MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p1MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(2);
        p1RuntimeScene.renderAndStep(1000 / 60);
        const {
          object: p1SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(p1SpriteObject.getX()).to.be(242);
        expect(p1SpriteObject.getY()).to.be(243);

        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });

        const {
          behavior: p3MultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p3MultiplayerObjectBehavior.getPlayerObjectOwnership()).to.be(2);
        p3RuntimeScene.renderAndStep(1000 / 60);
        const {
          object: p3SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(p3SpriteObject.getX()).to.be(242);
        expect(p3SpriteObject.getY()).to.be(243);
      }

      markAllPeerEventsAsProcessed();
      expectNoEventsToBeProcessed();
    });

    it('reconciles an instance owned by a player with a "ghost" instance created on other peers without a network ID (as not owned by them)', () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on a player:
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p2RuntimeScene.createObject('MySpriteObject');
      const {
        object: p2SpriteObject,
        behavior: p2SpriteObjectBehavior,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];
      p2SpriteObject.setX(142);
      p2SpriteObject.setY(143);
      p2SpriteObjectBehavior.setPlayerObjectOwnership(2);

      p2RuntimeScene.renderAndStep(1000 / 60);

      // Check the object is created on the host's game.
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p1Objects = p1RuntimeScene.getObjects('MySpriteObject');
      if (!p1Objects) throw new Error('No objects found');
      expect(p1Objects.length).to.be(0);

      p1RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p1SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p1RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p1SpriteObject.getX()).to.be(142);
      expect(p1SpriteObject.getY()).to.be(143);

      // Check the object is created on the other player.
      switchToPeer({
        peerId: 'player-3',
        otherPeerIds: ['player-1'],
        playerNumber: 3,
      });

      const p3RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p3Objects = p3RuntimeScene.getObjects('MySpriteObject');
      if (!p3Objects) throw new Error('No objects found');
      expect(p3Objects.length).to.be(0);

      p3RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p3SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p3RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p3SpriteObject.getX()).to.be(142);
      expect(p3SpriteObject.getY()).to.be(143);

      markAllPeerEventsAsProcessed();

      // Now, create a new instance on the host and player 3, but owned by player 2.
      // We call this in this test a "ghost" instance as it would be deleted if not "reconcilied".
      // We can assume it's because there is some common logic running for all players
      // resulting in the creation of this instance everywhere.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });
        p1RuntimeScene.createObject('MySpriteObject');
        const {
          behavior: p1MultiplayerBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[1]; // The new instance
        p1MultiplayerBehavior.setPlayerObjectOwnership(2);
        p1RuntimeScene.renderAndStep(1000 / 60);

        const p1ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        );
        expect(p1ObjectsAndBehaviors.length).to.be(2);
        const { object: p1Object1 } = p1ObjectsAndBehaviors[0];
        const { object: p1Object2 } = p1ObjectsAndBehaviors[1];
        expect(p1Object1.getX()).to.be(142);
        expect(p1Object1.getY()).to.be(143);
        expect(p1Object2.getX()).to.be(0);
        expect(p1Object2.getY()).to.be(0);

        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });
        p3RuntimeScene.createObject('MySpriteObject');
        const {
          behavior: p3MultiplayerBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[1]; // The new instance
        p3MultiplayerBehavior.setPlayerObjectOwnership(2);
        p3RuntimeScene.renderAndStep(1000 / 60);

        const p3ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        );
        expect(p3ObjectsAndBehaviors.length).to.be(2);
        const { object: p3Object1 } = p3ObjectsAndBehaviors[0];
        const { object: p3Object2 } = p3ObjectsAndBehaviors[1];
        expect(p3Object1.getX()).to.be(142);
        expect(p3Object1.getY()).to.be(143);
        expect(p3Object2.getX()).to.be(0);
        expect(p3Object2.getY()).to.be(0);
      }

      // Create an instance on player 2, owned by player 2.
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });
        p2RuntimeScene.createObject('MySpriteObject');
        const p2ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        );
        expect(p2ObjectsAndBehaviors.length).to.be(2);
        const { object: p2Object1 } = p2ObjectsAndBehaviors[0];
        const {
          object: p2Object2,
          behavior: p2MultiplayerBehavior2,
        } = p2ObjectsAndBehaviors[1];
        expect(p2Object1.getX()).to.be(142);
        expect(p2Object1.getY()).to.be(143);
        expect(p2Object2.getX()).to.be(0);
        expect(p2Object2.getY()).to.be(0);
        p2Object2.setX(42);
        p2Object2.setY(43);
        p2MultiplayerBehavior2.setPlayerObjectOwnership(2);
        p2RuntimeScene.renderAndStep(1000 / 60);
      }

      // Verify the host and player 3 are notified of the new instance, and that they reuse
      // their "ghost" instance for it.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });

        p1RuntimeScene.renderAndStep(1000 / 60);
        const p1ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        );
        expect(p1ObjectsAndBehaviors.length).to.be(2); // Initial instance + new instance overriding the ghost
        const { object: p1Object1 } = p1ObjectsAndBehaviors[0];
        const { object: p1Object2 } = p1ObjectsAndBehaviors[1];
        expect(p1Object1.getX()).to.be(142);
        expect(p1Object1.getY()).to.be(143);
        expect(p1Object2.getX()).to.be(42);
        expect(p1Object2.getY()).to.be(43);

        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });

        p3RuntimeScene.renderAndStep(1000 / 60);
        const p3ObjectsAndBehaviors = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        );
        expect(p3ObjectsAndBehaviors.length).to.be(2); // Initial instance + new instance overriding the ghost
        const { object: p3Object1 } = p3ObjectsAndBehaviors[0];
        const { object: p3Object2 } = p3ObjectsAndBehaviors[1];
        expect(p3Object1.getX()).to.be(142);
        expect(p3Object1.getY()).to.be(143);
        expect(p3Object2.getX()).to.be(42);
        expect(p3Object2.getY()).to.be(43);

        markAllPeerEventsAsProcessed();
      }
    });

    it('deletes an instance owned by another player after a bit (if not "reconciled" in the meantime)', async () => {
      const { switchToPeer } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on a player (2), owned by another player (3).
      // We can assume it's because there is some common logic running for all players
      // resulting in the creation of this instance everywhere.

      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p2RuntimeScene.createObject('MySpriteObject');

      const {
        object: mySpriteObject1,
        behavior: p2SpriteMultiplayerObjectBehavior,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];
      mySpriteObject1.setX(142);
      mySpriteObject1.setY(143);
      p2SpriteMultiplayerObjectBehavior.setPlayerObjectOwnership(3);

      p2RuntimeScene.renderAndStep(1000 / 60);
      const p2Objects = p2RuntimeScene.getObjects('MySpriteObject');
      if (!p2Objects) throw new Error('No object found');
      expect(p2Objects.length).to.be(1);

      await delay(20);

      p2RuntimeScene.renderAndStep(1000 / 60);
      const p2ObjectsUpdated = p2RuntimeScene.getObjects('MySpriteObject');
      if (!p2ObjectsUpdated) throw new Error('No object found');
      expect(p2ObjectsUpdated.length).to.be(1);

      // After some time, the instance should be deleted as it is owned by another player
      // and was never synchronized since then. Player 3 probably created an instance for a logic
      // that was run too early, or never ran on the other players.
      await delay(500);

      p2RuntimeScene.renderAndStep(1000 / 60);
      const p2ObjectsUpdated2 = p2RuntimeScene.getObjects('MySpriteObject');
      if (!p2ObjectsUpdated2) throw new Error('No object found');
      expect(p2ObjectsUpdated2.length).to.be(0);
    });

    it('gives priority to the first ownership change and revert the wrong one', async () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      // Create an instance on the host's game:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      const p1RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      p1RuntimeScene.createObject('MySpriteObject');
      const {
        object: mySpriteObject1,
        behavior: p1SpriteMultiplayerObjectBehavior,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p1RuntimeScene,
        'MySpriteObject'
      )[0];
      mySpriteObject1.setX(142);
      mySpriteObject1.setY(143);
      // No ownership given, it's owned by the host.
      expect(
        p1SpriteMultiplayerObjectBehavior.getPlayerObjectOwnership()
      ).to.be(0);

      p1RuntimeScene.renderAndStep(1000 / 60);

      // Check the object is created on the other players.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      const p2RuntimeScene = makeTestRuntimeSceneWithNetworkId();
      const p2Objects = p2RuntimeScene.getObjects('MySpriteObject');
      if (!p2Objects) throw new Error('No object found');
      expect(p2Objects.length).to.be(0);
      p2RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p2SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p2RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p2SpriteObject.getX()).to.be(142);
      expect(p2SpriteObject.getY()).to.be(143);

      switchToPeer({
        peerId: 'player-3',
        otherPeerIds: ['player-1'],
        playerNumber: 3,
      });

      const p3RuntimeScene = makeTestRuntimeSceneWithNetworkId();

      const p3Objects = p3RuntimeScene.getObjects('MySpriteObject');
      if (!p3Objects) throw new Error('No object found');
      expect(p3Objects.length).to.be(0);
      p3RuntimeScene.renderAndStep(1000 / 60);

      const {
        object: p3SpriteObject,
      } = getObjectAndMultiplayerBehaviorsFromScene(
        p3RuntimeScene,
        'MySpriteObject'
      )[0];

      expect(p3SpriteObject.getX()).to.be(142);
      expect(p3SpriteObject.getY()).to.be(143);

      markAllPeerEventsAsProcessed();

      // Now, try to change ownership to player 2 and 3 at the "same time".
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });

        const {
          behavior: p2SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];

        p2SpriteMultiplayerObjectBehavior.setPlayerObjectOwnership(2);
        p2RuntimeScene.renderAndStep(1000 / 60);

        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });

        const {
          behavior: p3SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];

        p3SpriteMultiplayerObjectBehavior.setPlayerObjectOwnership(3);
        p3RuntimeScene.renderAndStep(1000 / 60);
      }

      // Verify the host honors the first one (ownership change from 0 to 2).
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });
        const {
          behavior: p1SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(
          p1SpriteMultiplayerObjectBehavior.getPlayerObjectOwnership()
        ).to.be(0);
        p1RuntimeScene.renderAndStep(1000 / 60);

        const {
          behavior: p1SpriteMultiplayerObjectBehaviorUpdated,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(
          p1SpriteMultiplayerObjectBehaviorUpdated.getPlayerObjectOwnership()
        ).to.be(2);

        markAllPeerEventsAsProcessed();
      }

      // Wait so that player 3 retries.
      await delay(210);

      // Try 4 times and wait for more than 200ms between each try.
      {
        for (let i = 0; i < 4; i++) {
          switchToPeer({
            peerId: 'player-3',
            otherPeerIds: ['player-1'],
            playerNumber: 3,
          });

          p3RuntimeScene.renderAndStep(1000 / 60);

          const {
            behavior: p3SpriteMultiplayerObjectBehavior,
          } = getObjectAndMultiplayerBehaviorsFromScene(
            p3RuntimeScene,
            'MySpriteObject'
          )[0];
          expect(
            p3SpriteMultiplayerObjectBehavior.getPlayerObjectOwnership()
          ).to.be(3);

          markAllPeerEventsAsProcessed();

          await delay(210);
        }
      }

      // Check ownership was reverted.
      {
        p3RuntimeScene.renderAndStep(1000 / 60);

        const {
          behavior: p3SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];
        expect(
          p3SpriteMultiplayerObjectBehavior.getPlayerObjectOwnership()
        ).to.be(0);
        markAllPeerEventsAsProcessed();
      }

      // Move the object on the player 2:
      {
        switchToPeer({
          peerId: 'player-2',
          otherPeerIds: ['player-1'],
          playerNumber: 2,
        });

        const {
          object: p2SpriteObject,
          behavior: p2SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p2RuntimeScene,
          'MySpriteObject'
        )[0];
        p2SpriteMultiplayerObjectBehavior._objectMaxTickRate = Infinity;
        p2SpriteObject.setX(242);
        p2SpriteObject.setY(243);
        p2RuntimeScene.renderAndStep(1000 / 60);
      }

      // Check the object is moved on the host.
      {
        switchToPeer({
          peerId: 'player-1',
          otherPeerIds: ['player-2', 'player-3'],
          playerNumber: 1,
        });
        p1RuntimeScene.renderAndStep(1000 / 60);

        const {
          object: p1SpriteObject,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p1RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p1SpriteObject.getX()).to.be(242);
        expect(p1SpriteObject.getY()).to.be(243);
      }

      // Check the object is moved on the other player.
      {
        switchToPeer({
          peerId: 'player-3',
          otherPeerIds: ['player-1'],
          playerNumber: 3,
        });
        p3RuntimeScene.renderAndStep(1000 / 60);

        const {
          object: p3SpriteObject,
          behavior: p3SpriteMultiplayerObjectBehavior,
        } = getObjectAndMultiplayerBehaviorsFromScene(
          p3RuntimeScene,
          'MySpriteObject'
        )[0];

        expect(p3SpriteObject.getX()).to.be(242);
        expect(p3SpriteObject.getY()).to.be(243);
        expect(
          p3SpriteMultiplayerObjectBehavior.getPlayerObjectOwnership()
        ).to.be(2);
      }
      markAllPeerEventsAsProcessed();
    });
  });

  describe('Multiple scene tests', () => {
    /**
     * @param {gdjs.RuntimeGame} runtimeGame
     * @param {string} expectedSceneName
     * @returns {{currentScene: gdjs.RuntimeScene}}
     */
    const checkCurrentSceneIs = (runtimeGame, expectedSceneName) => {
      const currentScene = runtimeGame.getSceneStack().getCurrentScene();
      if (!currentScene) throw new Error('No current scene found.');
      expect(currentScene.getName()).to.be(expectedSceneName);

      return { currentScene };
    };

    it('synchronizes scenes from the host to other players', async () => {
      const { switchToPeer } = createP2PAndMultiplayerMessageManagerMock();

      const gameLayoutData = [
        getFakeSceneAndExtensionData({ name: 'Scene1' }).sceneData,
        getFakeSceneAndExtensionData({ name: 'Scene2' }).sceneData,
        getFakeSceneAndExtensionData({ name: 'Scene3' }).sceneData,
      ];

      // Launch two games.
      const p1RuntimeGame = gdjs.getPixiRuntimeGame({
        layouts: gameLayoutData,
      });

      await p1RuntimeGame._resourcesLoader.loadAllResources(() => {});

      const p2RuntimeGame = gdjs.getPixiRuntimeGame({
        layouts: gameLayoutData,
      });

      await p2RuntimeGame._resourcesLoader.loadAllResources(() => {});

      // Launch two scenes on the host:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      p1RuntimeGame.getSceneStack().push('Scene1');
      p1RuntimeGame.getSceneStack().push('Scene3');

      checkCurrentSceneIs(p1RuntimeGame, 'Scene3');
      p1RuntimeGame.getSceneStack().step(1000 / 60);

      // Launch the game on a client, with just the first scene.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      p2RuntimeGame.getSceneStack().push('Scene1');

      // Ensure the second scene (Scene3) is started.
      checkCurrentSceneIs(p2RuntimeGame, 'Scene1');
      p2RuntimeGame.getSceneStack().step(1000 / 60);
      checkCurrentSceneIs(p2RuntimeGame, 'Scene3');
      p2RuntimeGame.getSceneStack().step(1000 / 60);

      // Start again the same scene (Scene3) on the host's game
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });

      let p1FirstScene3NetworkId;
      checkCurrentSceneIs(p1RuntimeGame, 'Scene3');
      {
        const { currentScene } = checkCurrentSceneIs(p1RuntimeGame, 'Scene3');
        p1RuntimeGame.getSceneStack().step(1000 / 60);
        p1FirstScene3NetworkId = currentScene.networkId;
      }

      p1RuntimeGame.getSceneStack().push('Scene3');
      let p1SecondScene3NetworkId;
      {
        const { currentScene } = checkCurrentSceneIs(p1RuntimeGame, 'Scene3');
        p1RuntimeGame.getSceneStack().step(1000 / 60);
        p1SecondScene3NetworkId = currentScene.networkId;
      }

      expect(p1FirstScene3NetworkId).not.to.be(null);
      expect(p1SecondScene3NetworkId).not.to.be(null);
      expect(p1FirstScene3NetworkId).not.to.be(p1SecondScene3NetworkId);

      // Ensure the second Scene3 is also started on the player.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });
      {
        const { currentScene } = checkCurrentSceneIs(p2RuntimeGame, 'Scene3');
        p2RuntimeGame.getSceneStack().step(1000 / 60);
        expect(currentScene.networkId).to.be(p1FirstScene3NetworkId);
      }
      {
        const { currentScene } = checkCurrentSceneIs(p2RuntimeGame, 'Scene3');
        p2RuntimeGame.getSceneStack().step(1000 / 60);
        expect(currentScene.networkId).to.be(p1SecondScene3NetworkId);
      }

      // Remove the two Scene3 on the host's game.
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2'],
        playerNumber: 1,
      });
      p1RuntimeGame.getSceneStack().pop();
      p1RuntimeGame.getSceneStack().pop();

      let p1Scene1NetworkId;
      {
        const { currentScene } = checkCurrentSceneIs(p1RuntimeGame, 'Scene1');
        p1RuntimeGame.getSceneStack().step(1000 / 60);
        p1Scene1NetworkId = currentScene.networkId;
      }

      // Check that the player also goes back to Scene1:
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      checkCurrentSceneIs(p2RuntimeGame, 'Scene3');
      p2RuntimeGame.getSceneStack().step(1000 / 60);
      {
        const { currentScene } = checkCurrentSceneIs(p2RuntimeGame, 'Scene1');
        expect(currentScene.networkId).to.be(p1Scene1NetworkId);
      }
    });

    it('reconciles a scene launched both by the host and by a player', async () => {
      const {
        switchToPeer,
        markAllPeerEventsAsProcessed,
      } = createP2PAndMultiplayerMessageManagerMock();

      const gameLayoutData = [
        getFakeSceneAndExtensionData({ name: 'Scene1' }).sceneData,
        getFakeSceneAndExtensionData({ name: 'Scene2' }).sceneData,
        getFakeSceneAndExtensionData({ name: 'Scene3' }).sceneData,
      ];

      // Launch two games.
      const p1RuntimeGame = gdjs.getPixiRuntimeGame({
        layouts: gameLayoutData,
      });

      await p1RuntimeGame._resourcesLoader.loadAllResources(() => {});

      const p2RuntimeGame = gdjs.getPixiRuntimeGame({
        layouts: gameLayoutData,
      });

      await p2RuntimeGame._resourcesLoader.loadAllResources(() => {});

      // Launch two scenes on the host's game:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      p1RuntimeGame.getSceneStack().push('Scene1');
      p1RuntimeGame.getSceneStack().step(1000 / 60);

      checkCurrentSceneIs(p1RuntimeGame, 'Scene1');

      // Launch the game on a client, with just the first scene.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      p2RuntimeGame.getSceneStack().push('Scene1');
      p2RuntimeGame.getSceneStack().step(1000 / 60);

      checkCurrentSceneIs(p2RuntimeGame, 'Scene1');
      markAllPeerEventsAsProcessed();

      // Launch a second scene, first on the player:
      p2RuntimeGame.getSceneStack().push('Scene2');
      p2RuntimeGame.getSceneStack().step(1000 / 60);

      expect(
        checkCurrentSceneIs(p2RuntimeGame, 'Scene2').currentScene.networkId
      ).to.be(null);

      // Launch a second scene, this time on the host's game:
      switchToPeer({
        peerId: 'player-1',
        otherPeerIds: ['player-2', 'player-3'],
        playerNumber: 1,
      });

      p1RuntimeGame.getSceneStack().push('Scene2');
      p1RuntimeGame.getSceneStack().step(1000 / 60);

      const p1Scene2NetworkId = checkCurrentSceneIs(p1RuntimeGame, 'Scene2')
        .currentScene.networkId;

      // Check the network id of the scene on the player is reconciled with the host.
      switchToPeer({
        peerId: 'player-2',
        otherPeerIds: ['player-1'],
        playerNumber: 2,
      });

      expect(
        checkCurrentSceneIs(p2RuntimeGame, 'Scene2').currentScene.networkId
      ).to.be(null);
      p2RuntimeGame.getSceneStack().step(1000 / 60);

      expect(
        checkCurrentSceneIs(p2RuntimeGame, 'Scene2').currentScene.networkId
      ).to.be(p1Scene2NetworkId);
    });
  });
});
