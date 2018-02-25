# Model–View–ViewModel Pattern Implementation for TypeScript

[![NPM](https://img.shields.io/npm/v/ts-mvvm.svg)](https://www.npmjs.com/package/ts-mvvm)
[![Build Status](https://travis-ci.org/dokmic/ts-mvvm.svg?branch=master)](https://travis-ci.org/dokmic/ts-mvvm)
[![Code Coverage](https://codecov.io/gh/dokmic/ts-mvvm/badge.svg?branch=master)](https://codecov.io/gh/dokmic/ts-mvvm?branch=master)

This package provides basic implementation of [Model-View-ViewModel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) architectural pattern.

## Install
```bash
npm install --save ts-mvvm
```

## API

### `AbstractModel(model: Model)`
Creates a new model instance with prefilled from `model`.

### `AbstractViewModel(model: AbstractModel)`
Creates a new view-model instance linked to `model`.

#### `AbstractViewModel.bind(property: string, callback: Function)`
Binds `callback` function to the view-model's `property` change. It used by a view to getting notified about the changes in the view-model.

### `AbstractCommandableViewModel(model: AbstractModel)`
Creates an interactive view-model instance that can perform some commands.

#### `AbstractCommandableViewModel.on(command: string, callback: Function)`
Adds command listener on `command` that can be used to get a feedback from a view.

### `AbstractView(vm: AbstractViewModel)`
Creates a new view instance linked to `vm`.

#### `AbstractView.render(...params)`
This abstract method should implement view's rendering logic.

### `SimpleProvider`
This a service to provide instances based on the predefined rules.

#### `SimpleProvider.register({ source: Constructor, resolver: Function })`
Registers `resolver` for `source` instances.

#### `SimpleProvider.resolve(object: Object)`
Finds resolution by matching prototype of `object` with registered sources.

### `CachingProvider`
Same as `SimpleProvider` but caches resolutions so it will be only one resolver call per input object.

### `@Mutable`
This is a decorator that marks mutable properties in the model. All the mutable properties will be observed for changes by a view-model.

### `@Bindable`
This is a property decorator that adds the property binding with the model to a callee view-model.

### `@Command`
This is a method decorator that makes the method to be listened by `AbstractCommandableViewModel.on`.

### `@Binding`
This is a method decorator that provides one-way binding with a view-model. The decorated method will be called at least once with the initial view-model property's value.

## Example

You can find usage example in [demo folder](https://github.com/dokmic/ts-mvvm/tree/master/demo).
