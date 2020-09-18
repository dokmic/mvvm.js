import { Children, Command, Input, createElement } from 'mvvm.js';
import { UiProps, Ui } from './ui';

export interface ButtonProps extends UiProps {
  icon?: string;
  label?: string;
  click?(button: Button): void;
}

export class Button<T extends ButtonProps = ButtonProps> extends Ui<T> {
  @Input icon?: string;

  @Input label?: string;

  // eslint-disable-next-line class-methods-use-this
  @Command click(event: MouseEvent): void {
    event.preventDefault();
  }

  render(): Children {
    return (
      <a href="#" role="button" class="btn btn-dark" title={() => this.label} onClick={this.click}>
        {() => this.icon && <i class={`fa fa-${this.icon}`} />}
        {() => this.label}
      </a>
    );
  }
}
