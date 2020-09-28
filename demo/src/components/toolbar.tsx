import { Children, Command, Input, $reference, createElement } from 'mvvm.js';
import { UiProps, Ui } from './ui';
import { Dropdown } from './dropdown';
import { Field } from './field';
import { Group } from './group';
import { Toggle } from './toggle';

const ALIGN_LEFT = 'left';
const ALIGN_CENTER = 'center';
const ALIGN_RIGHT = 'right';

export interface ToolbarProps extends UiProps {
  font: Font;
  change?(font: Toolbar): void;
}

export class Toolbar extends Ui<ToolbarProps> {
  @Input font!: Font;

  // eslint-disable-next-line class-methods-use-this
  @Command change(): void {
    //
  }

  render(): Children {
    return (
      <div class="btn-toolbar" role="toolbar">
        <Group>
          <Dropdown
            items={{ arial: 'Arial', courier: 'Courier', georgia: 'Georgia', helvetica: 'Helvetica' }}
            value={$reference(this.font, 'family')}
            change={this.change}
          />
        </Group>

        <Group>
          <Field
            type="number"
            icon="text-height"
            value={$reference(this.font, 'size')}
            size={70}
            change={this.change}
          />
        </Group>

        <Group>
          <Toggle icon="bold" active={$reference(this.font, 'bold')} click={this.change} />
          <Toggle icon="italic" active={$reference(this.font, 'italic')} click={this.change} />
          <Toggle icon="underline" active={$reference(this.font, 'underline')} click={this.change} />
        </Group>

        <Group>
          <Toggle
            icon="align-left"
            active={() => this.font.align === ALIGN_LEFT}
            click={() => {
              this.font.align = ALIGN_LEFT;
              this.change();
            }}
          />
          <Toggle
            icon="align-center"
            active={() => this.font.align === ALIGN_CENTER}
            click={() => {
              this.font.align = ALIGN_CENTER;
              this.change();
            }}
          />
          <Toggle
            icon="align-right"
            active={() => this.font.align === ALIGN_RIGHT}
            click={() => {
              this.font.align = ALIGN_RIGHT;
              this.change();
            }}
          />
        </Group>
      </div>
    );
  }
}
