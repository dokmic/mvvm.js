import { Mutable, Bindable, Binding, Command } from 'ts-mvvm';
import { UIButton, UIButtonModel, UIButtonViewModel, UIButtonView } from './button';
import { UIProvideModel, UIProvideViewModel } from './core';

export interface UIToggle extends UIButton {
  active ? : boolean;
}

export class UIToggleModel<TUIToggle extends UIToggle = UIToggle>
  extends UIButtonModel<TUIToggle>
  implements UIToggle {
    @Mutable active: boolean;
  }

@UIProvideModel(UIToggleModel)
export class UIToggleViewModel<TUIToggleModel extends UIToggleModel = UIToggleModel>
  extends UIButtonViewModel<TUIToggleModel> {
    @Bindable active: boolean;

    @Command click() {
      this.active = !this.active;
    }
  }

@UIProvideViewModel(UIToggleViewModel)
export class UIToggleView extends UIButtonView {
  @Binding protected active(value: boolean) {
    this.element.classList[value ? 'add' : 'remove']('active');
  }
}
