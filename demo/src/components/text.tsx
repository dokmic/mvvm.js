import { Children, Default, Input, createElement } from 'mvvm.js';
import { UiProps, Ui } from './ui';

export interface TextProps extends UiProps {
  font: Font;
  children?: string;
}

export class Text extends Ui<TextProps> {
  @Input font!: Font;

  @Input('children') @Default('') text!: string;

  render(): Children {
    return (
      <div
        style={{
          fontFamily: () => this.font.family,
          fontSize: () => `${this.font.size}px`,
          fontStyle: () => this.font.italic && 'italic',
          fontWeight: () => this.font.bold && 'bold',
          textAlign: () => this.font.align,
          textDecoration: () => this.font.underline && 'underline',
        }}
      >
        {() => this.text}
      </div>
    );
  }
}
