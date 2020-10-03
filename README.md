# MVVM.js
[![NPM](https://img.shields.io/npm/v/mvvm.js.svg)](https://www.npmjs.com/package/mvvm.js)
[![Build Status](https://travis-ci.org/dokmic/mvvm.js.svg?branch=master)](https://travis-ci.org/dokmic/mvvm.js)
[![Code Coverage](https://codecov.io/gh/dokmic/mvvm.js/badge.svg?branch=master)](https://codecov.io/gh/dokmic/mvvm.js?branch=master)

This package provides a simple framework that is implementing the [Model-View-ViewModel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) architectural pattern.

## Why?
This repository demonstrates a pure [Model-View-ViewModel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) architectural pattern implementation.
The framework provides a component model similar to all the modern frontend frameworks and can be used for reactive rendering in trivial JavaScript or TypeScript applications.

## Features
- Reactivity based on observables similar to Vue.js.
- Decorators defining a data-flow similar to Angular.
- JSX syntax support similar to React.
- JSX Fragments support.
- Lazy DOM updating based on observables without expensive diffing.

## Introduction
### Model
The model is a data-layer of an application.

```typescript
const model = { name: 'John' };
```

### View
The view is a representation of a model describing appearance on the screen and bindings between the model data and the representation.

### View-Model
The view-model is an abstraction of the view exposing public properties and commands.
A data inside the view can be changed through the view-model, and the user's interaction can be handled from the external code via the commands.

### Binding
The binding is an expression bound to a particular part of the representation.
The view is evaluating the expression upon rendering.
In case, when the expression is relying on some observables, the expression will be re-evaluated upon the observable change.
Bindings are working one-way only, and provide one-way incoming data flow.
There is no way to update the binding from a view.

```typescript
@Bind('style.display') visibility() {
  return !this.visible && 'none';
}
```

### Command
The command is a function that will be invoked from the representation upon some user interaction.
Commands can be listened from the external code and provide one-way outgoing data-flow.

```typescript
@Command click() {}
```

### Input
The input is a two-way data binding between a model property and a property available from the representation.
Properties marked as inputs are observables.
The view subscribes for the changes of used inputs and performs partial rerendering on demand.
The inputs provide two-way data-flow for the data between a model and its representation.

```typescript
@Input name?: string;
```

### Expression
The expression is a value that depends on some data that may change in the future.
The view automatically evaluates all the expressions during the rendering.
In case, when it is relying on some observable, the value will be reevaluated upon change.

```jsx
render() {
  return <div class={() => this.visible ? 'show' : 'hide'} />
}
```

### Observable
The observable is a value that may change later, and the changes can be observed from the outside.

### Component
The component is a composition of the view and the view-model.
There can be Class and Functional components.
Components accept properties on input, which represent a model.
The code of the functional component is the view.
In the case of the class component, the `render` method with all the bindings correspond to the view. And all the inputs and commands define the view-model.

```tsx
import { Component, Input } from 'mvvm.js';

class Button extends Component {
  @Input label?: string;

  render() {
    return <button>{this.label}</button>;
  }
}
```

### Reference
The reference is a model value that refers to property from another object.
In case, when a model property should be passed down to another view-model, the property should be passed as a reference.
Every update of the referring property from the child component will take place in the referred object.

```jsx
<Toggle active={$reference(this, 'visible')} />
```

## Get Started
### Installation
```bash
npm install --save mvvm.js
```

### Usage
```tsx
import { Bind, Command, Component, Default, Input } from 'mvvm.js';
import { render } from 'mvvm.js/lib/dom';

interface ButtonProps {
  icon?: string;
  label?: string;
  visible?: boolean;
  click?(button: UIButton): void;
}

class Button extends Component<ButtonProps> {
  @Input icon?: string;

  @Input label?: string;

  @Input @Default(true) visible?: boolean;

  @Command click() {}

  @Bind('style.display') visibility() {
    return !this.visible && 'none';
  }

  render() {
    return (
      <a role="button" class="btn btn-primary" title={() => this.label} onClick={this.click}>
        {() => this.icon && <i class={`fa fa-${this.icon}`}></i>}
        {() => this.label}
      </a>
    );
  }
}

render(
  <Button label='Button' />,
  document.querySelector('#root')!,
);
```

## API
You can find the complete API reference [here](https://dokmic.github.io/mvvm.js/api/).

## Example
You can see a working demo [here](https://dokmic.github.io/mvvm.js/) ([source code](https://github.com/dokmic/mvvm.js/tree/master/demo)).
