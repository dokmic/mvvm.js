import { Mutable, Bindable, Binding, Command } from 'ts-mvvm';
import { UI, UIModel, UIViewModel, UIView, uiViewModelProvider, uiViewProvider } from './core';

export interface UIGroup extends UI {
  children: UI[];
}

export class UIGroupModel<TUIGroup extends UIGroup = UIGroup>
  extends UIModel<TUIGroup>
  implements UIGroup {
    @Mutable children: UIModel[];
  }

export class UIGroupViewModel<TUIGroupModel extends UIGroupModel = UIGroupModel>
  extends UIViewModel<TUIGroupModel> {
    get children(): UIViewModel[] {
      return this.model.children
        .map(model => uiViewModelProvider.resolve(model));
    }
  }

export class UIGroupView<TUIGroupViewModel extends UIGroupViewModel = UIGroupViewModel>
  extends UIView<TUIGroupViewModel> {
    protected render() {
      super.render('div');
      this.element.className = 'btn-group';
    }

    @Binding protected children(value: UIViewModel[]) {
      value.forEach(child => {
        this.element.appendChild(uiViewProvider.resolve(child).element);
      });
    }
  }
