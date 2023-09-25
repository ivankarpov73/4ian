// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdObjectFolderOrObject {
  constructor(): void;
  isFolder(): boolean;
  getObject(): gdObject;
  getFolderName(): string;
  hasObjectNamed(name: string): boolean;
  getChildrenCount(): number;
  getChildAt(pos: number): gdObjectFolderOrObject;
  getObjectChild(name: string): gdObjectFolderOrObject;
  getChildPosition(child: gdObjectFolderOrObject): number;
  renameFolder(name: string): void;
  getParent(): gdObjectFolderOrObject;
  insertNewFolder(name: string, newPosition: number): gdObjectFolderOrObject;
  moveObjectFolderOrObjectToAnotherFolder(objectFolderOrObject: gdObjectFolderOrObject, newParentFolder: gdObjectFolderOrObject, newPosition: number): void;
  moveChild(oldIndex: number, newIndex: number): void;
  removeFolderChild(childToRemove: gdObjectFolderOrObject): void;
  delete(): void;
  ptr: number;
};