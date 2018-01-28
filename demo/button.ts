import { Mutable, Bindable, Binding, Command } from 'ts-mvvm';
import { UI, UIModel, UIControlViewModel, UIView, UIProvideModel, UIProvideViewModel } from './core';

export interface UIButton extends UI {
  icon: string;
  label: string;
}

export class UIButtonModel<TUIButton extends UIButton = UIButton>
  extends UIModel<TUIButton>
  implements UIButton {
    @Mutable icon: string;
    @Mutable label: string;
  }

@UIProvideModel(UIButtonModel)
export class UIButtonViewModel<TUIButtonModel extends UIButtonModel = UIButtonModel>
  extends UIControlViewModel<TUIButtonModel> {
    @Bindable icon: string;
    @Bindable label: string;
    @Command click() {}
  }

@UIProvideViewModel(UIButtonViewModel)
export class UIButtonView<TUIButtonViewModel extends UIButtonViewModel = UIButtonViewModel>
  extends UIView<TUIButtonViewModel> {
    protected i: HTMLElement;

    protected render() {
      super.render('a');
      this.i = document.createElement('i');
      this.i.className = 'fa';
      this.element.className = 'btn btn-default';
      this.element.appendChild(this.i);
      this.element.addEventListener('click', this.vm.click.bind(this.vm));
    }

    @Binding protected label(value: string) {
      this.element.setAttribute('title', value);
    }

    @Binding protected icon(value: string) {
      this.i.className = 'fa fa-' + value;
    }
  }
