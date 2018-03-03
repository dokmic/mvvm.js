import { Mutable, Bindable, Binding, Command } from 'ts-mvvm';
import { UI, UIModel, UIViewModel, UIView, uiViewModelProvider, uiViewProvider, UIControlViewModel } from './core';
import { UIToggle, UIToggleModel, UIToggleViewModel } from './toggle';
import { UIGroupModel, UIGroupViewModel, UIGroupView } from './group';

export interface UIToggleGroup extends UI {
  children: UIToggle[];
  value?: UIToggle;
}

export class UIToggleGroupModel<TUIToggleGroup extends UIToggleGroup = UIToggleGroup>
  extends UIGroupModel< TUIToggleGroup >
  implements UIToggleGroup {
    @Mutable children: UIToggleModel[];

    set value(value: UIToggleModel) {
      this.children.forEach(child => child.active = child === value);
    }

    get value(): UIToggleModel {
      return this.children.find(child => child.active);
    }
  }

export class UIToggleGroupViewModel<TUIToggleGroupModel extends UIToggleGroupModel = UIToggleGroupModel>
  extends UIControlViewModel<TUIToggleGroupModel>
  implements UIGroupViewModel<TUIToggleGroupModel> {
    get children(): UIToggleViewModel[] {
      return this.model.children.map(
        model => (uiViewModelProvider.resolve(model) as UIToggleViewModel)
          .on('click', this.change)
      );
    }

    get value() {
      return uiViewModelProvider.resolve(this.model.value) as UIToggleViewModel;
    }

    set value(value: UIToggleViewModel) {
      this.model.value = value.model;
    }

    @Command change(vm: UIToggleViewModel) {
      this.value = vm;
    }
  }

export class UIToggleGroupView<TUIToggleGroupViewModel extends UIToggleGroupViewModel = UIToggleGroupViewModel>
  extends UIGroupView<TUIToggleGroupViewModel> {
    @Binding protected children(value: UIViewModel[]) {
      value.forEach(child => {
        this.element.appendChild(uiViewProvider.resolve(child).element);
      });
    }
  }
