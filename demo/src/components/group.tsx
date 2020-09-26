import { Children, Input, createElement } from 'mvvm.js';
import { UiProps, Ui } from './ui';

export interface GroupProps extends UiProps {
  children?: any;
}

export class Group extends Ui<GroupProps> {
  @Input children: any;

  render(): Children {
    return <div class="btn-group mr-2 mb-2">{() => this.children}</div>;
  }
}
