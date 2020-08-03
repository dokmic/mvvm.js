import { CommandableMixin, CommandDecorator } from './commandable';
import { RuntimeDecorator } from './decoratable';

/**
 * Command method decorator handle.
 */
export const commands = new RuntimeDecorator('command');

/**
 * Command method decorator.
 */
export const Command = commands.getDecorator() as CommandDecorator;

/**
 * Base commandable class.
 */
export class CommandableImpl extends CommandableMixin(commands)(class {}) {}

export * from './commandable';
export * from './decoratable';
export * from './evaluable';
export * from './mixable';
export * from './types';
