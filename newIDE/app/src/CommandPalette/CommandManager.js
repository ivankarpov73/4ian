// @flow
import { type CommandName } from './CommandsList';

type CommandHandler = () => void | Promise<void>;

export type SimpleCommand = {|
  handler: CommandHandler,
|};

export type CommandOption = {|
  handler: CommandHandler,
  text: string,
  iconSrc?: string,
|};

export type CommandWithOptions = {|
  generateOptions: () => Array<CommandOption>,
|};

export type Command = SimpleCommand | CommandWithOptions;

export type NamedCommand = {|
  name: string,
  ...Command,
|};

export type NamedCommandWithOptions = {|
  name: string,
  ...CommandWithOptions,
|};

export interface CommandManagerInterface {
  registerCommand: (commandName: string, command: Command) => void;
  deregisterCommand: (commandName: string) => void;
  getAllNamedCommands: () => Array<NamedCommand>;
}

export default class CommandManager implements CommandManagerInterface {
  commands: { [CommandName]: Command };

  constructor() {
    this.commands = {};
  }

  registerCommand = (commandName: CommandName, command: Command) => {
    if (this.commands[commandName])
      return console.warn(
        `Tried to register command ${commandName}, but it is already registered.`
      );
    this.commands[commandName] = command;
  };

  deregisterCommand = (commandName: CommandName) => {
    if (!this.commands[commandName])
      return console.warn(
        `Tried to deregister command ${commandName}, but it is not registered.`
      );
    delete this.commands[commandName];
  };

  getAllNamedCommands = () => {
    return Object.keys(this.commands).map<NamedCommand>(commandName => {
      const cmd = this.commands[commandName];
      return { ...cmd, name: commandName };
    });
  };
}
