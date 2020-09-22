import { Children, Command, Default, Input, createElement } from 'mvvm.js';
import { UiProps, Ui } from './ui';

export interface DropdownProps extends UiProps {
  items: Record<string, string>;
  placeholder?: string;
  value?: string;
  change?(dropdown: DropdownProps, key: string): void;
}

export class Dropdown extends Ui<DropdownProps> {
  @Input @Default({}) items!: DropdownProps['items'];

  @Input placeholder?: string;

  @Input value?: string;

  @Command change(key: string): void {
    this.value = key;
  }

  render(): Children {
    return (
      <select
        class="custom-select"
        placeholder={this.placeholder}
        onChange={(event: any) => this.change(event.target.value)}
      >
        {() =>
          Object.entries(this.items).map(([key, title]) => (
            <option value={key} selected={() => this.value === key}>
              {title}
            </option>
          ))
        }
      </select>
    );
  }
}
