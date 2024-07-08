// @flow

import * as PIXI from 'pixi.js-legacy';
import ViewPosition from './ViewPosition';
import { type TileMapTileSelection } from './TileMapPainter';

type Props = {|
  viewPosition: ViewPosition,
  getTileMapTileSelection: () => ?TileMapTileSelection,
  onClick: (sceneCoordinates: {| x: number, y: number |}) => void,
|};

class ClickInterceptor {
  viewPosition: ViewPosition;
  getTileMapTileSelection: () => ?TileMapTileSelection;
  onClick: (sceneCoordinates: {| x: number, y: number |}) => void;

  pixiContainer: PIXI.Container;
  interceptingSprite: PIXI.sprite;

  constructor({ viewPosition, getTileMapTileSelection, onClick }: Props) {
    this.viewPosition = viewPosition;
    this.onClick = onClick;
    this.getTileMapTileSelection = getTileMapTileSelection;
    this.interceptingSprite = new PIXI.Sprite();
    this.interceptingSprite.alpha = 0;
    this.interceptingSprite.interactive = true;
    this.interceptingSprite.addEventListener(
      'click',
      (e: PIXI.FederatedPointerEvent) => {
        const sceneCoordinates = this.viewPosition.toSceneCoordinates(
          e.global.x,
          e.global.y
        );
        this.onClick({ x: sceneCoordinates[0], y: sceneCoordinates[1] });
      }
    );
    this.pixiContainer = new PIXI.Container();
    this.pixiContainer.addChild(this.interceptingSprite);
  }

  getPixiObject(): PIXI.Container {
    return this.pixiContainer;
  }

  render() {
    this.pixiContainer.removeChildren(0);
    const tileMapTileSelection = this.getTileMapTileSelection();
    if (!tileMapTileSelection) return;
    this.pixiContainer.position.x = 0;
    this.pixiContainer.position.y = 0;
    this.interceptingSprite.width = this.viewPosition.getWidth();
    this.interceptingSprite.height = this.viewPosition.getHeight();
    this.pixiContainer.addChild(this.interceptingSprite);
  }
}
export default ClickInterceptor;
