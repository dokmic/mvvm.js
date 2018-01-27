import {
  Model,
  AbstractModel,
  AbstractViewModel,
  AbstractView,
  Mutable,
  Bindable,
  Binding,
  AbstractCommandableViewModel,
  CachingProvider,
  ProvideDecorator
} from 'ts-mvvm';

export interface UI extends Model {
  visible?: boolean;
}

export class UIModel<TUI extends UI = UI>
  extends AbstractModel<TUI>
  implements UI {
    @Mutable visible = true;
}

export class UIViewModel<TUIModel extends UIModel = UIModel>
  extends AbstractViewModel<TUIModel> {
    @Bindable visible: boolean;
  }

export class UIControlViewModel<TUIModel extends UIModel = UIModel>
  extends AbstractCommandableViewModel<TUIModel>
  implements UIViewModel<TUIModel> {
    @Bindable visible: boolean;
  }

export class UIView<TUIViewModel extends UIViewModel = UIViewModel>
  extends AbstractView<TUIViewModel> {
    element: HTMLElement;

    protected render(tag = '') {
      this.element = document.createElement(tag);
    }

    @Binding protected visible(value: boolean) {
      this.element.style.display = value ? '' : 'none';
    }
  }

export const uiViewModelProvider = new CachingProvider<UIModel, UIViewModel>(),
  uiViewProvider = new CachingProvider<UIViewModel, UIView>(),
  UIProvideModel = ProvideDecorator.bind(null, uiViewModelProvider),
  UIProvideViewModel = ProvideDecorator.bind(null, uiViewProvider);
