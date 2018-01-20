import { ViewModel } from './view-model';
import { PropertyDecorator } from './provider';

export interface View {}

/**
 * Basic View Implementation
 */
export abstract class AbstractView<TViewModel extends ViewModel = ViewModel> {
  constructor(readonly vm: TViewModel) {
    this.render();
    this.bindings();
  }

  /**
   * Initialize bindings
   */
  private bindings() {
    (this.constructor['bindings'] || []).forEach(
      (property: string) => this.vm.bind(property, this[property].bind(this))
    );
  }

  /**
   * View rendering
   */
  protected abstract render(...params: any[]): any;
}

/**
 * Method binding to a view model
 */
export let Binding = PropertyDecorator.bind(null, 'bindings');
