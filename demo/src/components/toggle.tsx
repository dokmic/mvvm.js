import { Bind, Command, Default, Input } from 'mvvm.js';
import { ButtonProps, Button } from './button';

export interface ToggleProps extends ButtonProps {
  active?: boolean;
}

export class Toggle extends Button<ToggleProps> {
  @Input @Default(false) active!: boolean;

  @Command click(event: MouseEvent): void {
    super.click(event);
    this.active = !this.active;
  }

  @Bind('class') state(className: string): string {
    return className
      .split(' ')
      .filter((value) => value !== 'active')
      .concat(this.active ? ['active'] : [])
      .join(' ');
  }
}
