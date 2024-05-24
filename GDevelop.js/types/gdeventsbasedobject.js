// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdEventsBasedObject extends gdAbstractEventsBasedEntity {
  constructor(): void;
  setDescription(description: string): gdEventsBasedObject;
  getDescription(): string;
  setName(name: string): gdEventsBasedObject;
  getName(): string;
  setFullName(fullName: string): gdEventsBasedObject;
  getFullName(): string;
  setDefaultName(defaultName: string): gdEventsBasedObject;
  getDefaultName(): string;
  markAsRenderedIn3D(isRenderedIn3D: boolean): gdEventsBasedObject;
  isRenderedIn3D(): boolean;
  markAsAnimatable(isAnimatable: boolean): gdEventsBasedObject;
  isAnimatable(): boolean;
  markAsTextContainer(isTextContainer: boolean): gdEventsBasedObject;
  isTextContainer(): boolean;
  getInitialInstances(): gdInitialInstancesContainer;
  getLayers(): gdLayersContainer;
  static getPropertyActionName(propertyName: string): string;
  static getPropertyConditionName(propertyName: string): string;
  static getPropertyExpressionName(propertyName: string): string;
  static getPropertyToggleActionName(propertyName: string): string;
  insertNewObject(project: gdProject, type: string, name: string, pos: number): gdObject;
  insertNewObjectInFolder(project: gdProject, type: string, name: string, folder: gdObjectFolderOrObject, pos: number): gdObject;
  insertObject(obj: gdObject, pos: number): gdObject;
  hasObjectNamed(name: string): boolean;
  getObject(name: string): gdObject;
  getObjectAt(pos: number): gdObject;
  getObjectPosition(name: string): number;
  removeObject(name: string): void;
  moveObject(oldIndex: number, newIndex: number): void;
  moveObjectFolderOrObjectToAnotherContainerInFolder(objectFolderOrObject: gdObjectFolderOrObject, newObjectsContainer: gdObjectsContainer, parentObjectFolderOrObject: gdObjectFolderOrObject, newPosition: number): void;
  getObjectsCount(): number;
  getRootFolder(): gdObjectFolderOrObject;
  getAllObjectFolderOrObjects(): gdVectorObjectFolderOrObject;
  getObjectGroups(): gdObjectGroupsContainer;
  delete(): void;
  ptr: number;
};