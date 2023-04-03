namespace gdjs {
  class ThreeDShapeRuntimeObjectPixiRenderer {
    private _object: gdjs.ThreeDShapeRuntimeObject;
    private _instanceContainer: gdjs.RuntimeInstanceContainer;
    private _runtimeGame: gdjs.RuntimeGame;
    private _box: THREE.Mesh;

    constructor(
      runtimeObject: gdjs.ThreeDShapeRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._object = runtimeObject;
      this._runtimeGame = instanceContainer.getGame();
      this._instanceContainer = instanceContainer;

      const geometry = new THREE.BoxGeometry(1, 1, 1);
      this._box = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({
          map: this._runtimeGame.getImageManager().getTHREETexture('Wood.png'),
          side: THREE.DoubleSide,
        })
      );

      this.updateSize();
      instanceContainer.getRenderer().get3dRendererObject().add(this._box);
    }

    updatePreRender() {
      // TODO: do this on demand
      this._box.position.set(
        this._object.x + this._object.getWidth() / 2,
        this._object.y + this._object.getHeight() / 2,
        this._object.z
      );
      this._box.rotation.set(0, 0, gdjs.toRad(this._object.angle));
    }

    updateSize() {
      this._box.scale.set(
        this._object.getWidth(),
        this._object.getHeight(),
        100
      );
    }

    onDestroy() {
      // TODO: dispose the geometry and mesh.
      // TODO: Move to onDestroyFromScene??
      this._instanceContainer
        .getRenderer()
        .get3dRendererObject()
        .remove(this._box);
    }
  }

  export const ThreeDShapeRuntimeObjectRenderer =
    ThreeDShapeRuntimeObjectPixiRenderer;
  export type ThreeDShapeRuntimeObjectRenderer =
    ThreeDShapeRuntimeObjectPixiRenderer;
}
