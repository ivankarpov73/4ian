// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdObjectCodeGenerator {
  constructor(project: gdProject): void;
  generateRuntimeObjectCompleteCode(extensionName: string, eventsBasedObject: gdEventsBasedObject, codeNamespace: string, objectMethodMangledNames: gdMapStringString, includes: gdSetString, compilationForRuntime: boolean): string;
  static getObjectPropertyGetterName(propertyName: string): string;
  static getObjectPropertySetterName(propertyName: string): string;
  delete(): void;
  ptr: number;
};