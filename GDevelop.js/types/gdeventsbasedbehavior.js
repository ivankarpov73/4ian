// Automatically generated by GDevelop.js/scripts/generate-types.js
declare class gdEventsBasedBehavior extends gdAbstractEventsBasedEntity {
  constructor(): void;
  setDescription(description: string): gdEventsBasedBehavior;
  getDescription(): string;
  setName(name: string): gdEventsBasedBehavior;
  getName(): string;
  setFullName(fullName: string): gdEventsBasedBehavior;
  getFullName(): string;
  setObjectType(fullName: string): gdEventsBasedBehavior;
  getObjectType(): string;
  setPrivate(isPrivate: boolean): gdEventsBasedBehavior;
  isPrivate(): boolean;
  getSharedPropertyDescriptors(): gdNamedPropertyDescriptorsList;
  static getPropertyActionName(propertyName: string): string;
  static getPropertyConditionName(propertyName: string): string;
  static getPropertyExpressionName(propertyName: string): string;
  static getPropertyToggleActionName(propertyName: string): string;
  static getSharedPropertyActionName(propertyName: string): string;
  static getSharedPropertyConditionName(propertyName: string): string;
  static getSharedPropertyExpressionName(propertyName: string): string;
  static getSharedPropertyToggleActionName(propertyName: string): string;
  delete(): void;
  ptr: number;
};