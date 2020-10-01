import { Fragment, createElement } from 'mvvm.js';
import { render } from 'mvvm.js/lib/dom';
import { Toolbar, Text } from './components';

const font: Font = { align: 'center', family: 'courier', size: 30 };

render(
  <>
    <div class="mt-3">
      <Toolbar font={font} />
    </div>
    <div class="my-auto">
      <Text font={font}>Hello, MVVM.js</Text>
    </div>
  </>,
  document.querySelector('#root')!,
);
