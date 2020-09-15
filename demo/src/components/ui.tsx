import { Bind, Component, Default, Input } from 'mvvm.js';

export interface UiProps {
  visible?: boolean;
}

export abstract class Ui<T extends UiProps = UiProps> extends Component<T> {
  @Input @Default(true) visible?: boolean;

  @Bind('style.display') visibility(): string | false {
    return !this.visible && 'none';
  }
}
