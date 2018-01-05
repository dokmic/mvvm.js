type Observer = (...params: any[]) => any;

/**
 * Base Observable Object
 */
export interface Observable {
  /**
   * Register observer
   * @param observer Observer instance
   */
  addObserver(observer: Observer): void;

  /**
   * Unregister observer
   * @param observer Observer instance
   */
  removeObserver(observer: Observer): void;
}

/**
 * Basic Observable Implementation
 */
export abstract class AbstractObservable implements Observable {
  /**
   * Check whether a value is observable
   * @param value Value to check
   */
  static isObservable(value: any) {
    return !!(undefined !== value && value['addObserver']);
  }

  protected listeners: Observer[] = [];

  addObserver(observer: Observer) {
    if (this.listeners.indexOf(observer) === -1) {
      this.listeners.push(observer);
    }
  }

  removeObserver(observer: Observer) {
    const index = this.listeners.indexOf(observer);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Call all registered observers
   * @param params Parameters to be passed into observers calls
   */
  protected notify(...params: any[]) {
    this.listeners.forEach(observer => observer.apply(observer, params));
  }
}
