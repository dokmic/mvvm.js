import { Command, Default, Input, createElement, Children } from 'mvvm.js';
import { UiProps, Ui } from './ui';

export interface FieldProps extends UiProps {
  icon?: string;
  type?: string;
  value?: string | number;
  size?: number;
  change?(input: Field, value: string): void;
}

export class Field extends Ui<FieldProps> {
  @Input icon?: string;

  @Input @Default('text') type!: string;

  @Input @Default('') value!: string | number;

  @Input size?: number;

  @Command change(value: string): void {
    if (this.type === 'number') {
      this.value = Number(value);

      return;
    }

    this.value = value;
  }

  render(): Children {
    return (
      <div class="input-group">
        <div class="input-group-prepend">
          <div class="input-group-text">
            <i class={() => `fa fa-${this.icon}`} />
          </div>
        </div>
        <input
          type={() => this.type}
          class="form-control"
          value={() => this.value}
          onChange={(event: any) => this.change(event.target.value)}
          style={{ width: () => this.size && `${this.size}px` }}
        />
      </div>
    );
  }
}
