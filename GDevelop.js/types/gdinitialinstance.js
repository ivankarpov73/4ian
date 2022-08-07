// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdInitialInstance {
  constructor(): void;
  setObjectName(name: string): void;
  getObjectName(): string;
  getX(): number;
  setX(x: number): void;
  getY(): number;
  setY(y: number): void;
  getAngle(): number;
  setAngle(angle: number): void;
  isLocked(): boolean;
  setLocked(lock: boolean): void;
  isSealed(): boolean;
  setSealed(seal: boolean): void;
  getZOrder(): number;
  setZOrder(zOrder: number): void;
  getLayer(): string;
  setLayer(layer: string): void;
  setHasCustomSize(enable: boolean): void;
  hasCustomSize(): boolean;
  setCustomWidth(width: number): void;
  getCustomWidth(): number;
  setCustomHeight(height: number): void;
  getCustomHeight(): number;
  resetPersistentUuid(): gdInitialInstance;
  updateCustomProperty(name: string, value: string, project: gdProject, layout: gdLayout): void;
  getCustomProperties(project: gdProject, layout: gdLayout): gdMapStringPropertyDescriptor;
  getRawDoubleProperty(name: string): number;
  getRawStringProperty(name: string): string;
  setRawDoubleProperty(name: string, value: number): void;
  setRawStringProperty(name: string, value: string): void;
  getVariables(): gdVariablesContainer;
  serializeTo(element: gdSerializerElement): void;
  unserializeFrom(element: gdSerializerElement): void;
  delete(): void;
  ptr: number;
};