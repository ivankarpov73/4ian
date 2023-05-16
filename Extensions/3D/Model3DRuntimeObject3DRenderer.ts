namespace gdjs {
  class Model3DRuntimeObject3DRenderer extends gdjs.RuntimeObject3DRenderer {
    private _model3DRuntimeObject: gdjs.Model3DRuntimeObject;
    /**
     * The 3D model stretched in a 1x1x1 cube.
     */
    private _threeObject: THREE.Object3D;

    constructor(
      runtimeObject: gdjs.Model3DRuntimeObject,
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      // @ts-ignore It can't be null if THREE exists.
      const originalModelMesh: THREE.Object3D = instanceContainer
        .getGame()
        .getModel3DManager()
        .getModel(runtimeObject._modelResourceName);
      const modelObject3D = originalModelMesh.clone();

      // Create a group to transform the object according to
      // position, angle and dimensions.
      const group = new THREE.Group();
      group.rotation.order = 'ZYX';
      group.add(modelObject3D);
      super(runtimeObject, instanceContainer, group);

      this._model3DRuntimeObject = runtimeObject;
      this._threeObject = modelObject3D;
    }

    _updateDefaultTransformation(
      rotationX: float,
      rotationY: float,
      rotationZ: float,
      originalWidth: float,
      originalHeight: float,
      originalDepth: float,
      keepAspectRatio: boolean
    ) {
      const boundingBox = this._getModelAABB(rotationX, rotationY, rotationZ);

      // Center the model.
      this._threeObject.position.set(
        -(boundingBox.min.x + boundingBox.max.x) / 2,
        (this._threeObject.position.y =
          -(boundingBox.min.y + boundingBox.max.y) / 2),
        (this._threeObject.position.z =
          -(boundingBox.min.z + boundingBox.max.z) / 2)
      );

      // Rotate the model.
      this._threeObject.scale.set(1, 1, 1);
      this._threeObject.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );

      // Stretch the model in a 1x1x1 cube.
      const modelWidth = boundingBox.max.x - boundingBox.min.x;
      const modelHeight = boundingBox.max.y - boundingBox.min.y;
      const modelDepth = boundingBox.max.z - boundingBox.min.z;

      const scaleX = 1 / modelWidth;
      const scaleY = 1 / modelHeight;
      const scaleZ = 1 / modelDepth;

      const scaleMatrix = new THREE.Matrix4();
      scaleMatrix.makeScale(scaleX, scaleY, scaleZ);
      this._threeObject.updateMatrix();
      this._threeObject.applyMatrix4(scaleMatrix);

      if (keepAspectRatio) {
        // Reduce the object dimensions to keep aspect ratio.
        const widthRatio = originalWidth / modelWidth;
        const heightRatio = originalHeight / modelHeight;
        const depthRatio = originalDepth / modelDepth;
        const scaleRatio = Math.min(widthRatio, heightRatio, depthRatio);

        this._object._setOriginalWidth(scaleRatio * modelWidth);
        this._object._setOriginalHeight(scaleRatio * modelHeight);
        this._object._setOriginalDepth(scaleRatio * modelDepth);
      }

      this._threeObject.updateMatrix();
    }

    private _getModelAABB(
      rotationX: float,
      rotationY: float,
      rotationZ: float
    ) {
      // The original model is used because `setFromObject` is working in
      // world transformation.

      // @ts-ignore It can't be null if THREE exists.
      const originalModelMesh: THREE.Object3D = this._object
        .getInstanceContainer()
        .getGame()
        .getModel3DManager()
        .getModel(this._model3DRuntimeObject._modelResourceName);

      originalModelMesh.rotation.set(
        gdjs.toRad(rotationX),
        gdjs.toRad(rotationY),
        gdjs.toRad(rotationZ)
      );

      const aabb = new THREE.Box3().setFromObject(originalModelMesh);

      // Revert changes.
      originalModelMesh.rotation.set(0, 0, 0);

      return aabb;
    }

    _updateMaterials() {
      // @ts-ignore It can't be null if THREE exists.
      const originalModelMesh: THREE.Object3D = this._model3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getModel3DManager()
        .getModel(this._model3DRuntimeObject._modelResourceName);
      const modelObject3D = originalModelMesh.clone();

      this.get3DRendererObject().remove(this._threeObject);
      this.get3DRendererObject().add(modelObject3D);

      this._threeObject = modelObject3D;

      this._replaceMaterials();
    }

    /**
     * Replace materials to better work with lights (or no light).
     */
    _replaceMaterials() {
      if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.StandardWithoutMetalness
      ) {
        this._threeObject.traverse((node) => {
          if (node.type === 'Mesh') {
            const mesh = node as THREE.Mesh;
            const material = mesh.material as THREE.MeshStandardMaterial;
            //@ts-ignore
            if (material.metalness) {
              //@ts-ignore
              material.metalness = 0;
            }
          }
        });
      } else if (
        this._model3DRuntimeObject._materialType ===
        gdjs.Model3DRuntimeObject.MaterialType.Basic
      ) {
        this._threeObject.traverse((node) => {
          if (node.type === 'Mesh') {
            const mesh = node as THREE.Mesh;
            const basicMaterial = new THREE.MeshBasicMaterial();
            //@ts-ignore
            if (mesh.material.color) {
              //@ts-ignore
              basicMaterial.color = mesh.material.color;
            }
            //@ts-ignore
            if (mesh.material.map) {
              //@ts-ignore
              basicMaterial.map = mesh.material.map;
            }
            mesh.material = basicMaterial;
          }
        });
      }
    }
  }

  export const Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
  export type Model3DRuntimeObjectRenderer = Model3DRuntimeObject3DRenderer;
}
