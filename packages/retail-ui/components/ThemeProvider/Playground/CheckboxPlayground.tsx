import React from 'react';
import Gapped from '../../Gapped';
import Checkbox, { CheckboxProps } from '../../Checkbox';
import { getComponentsFromPropsList } from './helpers';

const propsList: CheckboxProps[] = [
  { children: 'Default' },
  { children: 'Checked', checked: true },
  { children: 'Disabled', checked: true, disabled: true },
  { children: 'Semichecked', initialIndeterminate: true },
  { children: 'Focused', autoFocus: true, ref: 'focusElement' } as any,
  { children: 'Error', error: true },
  { children: 'Warning', warning: true },
];

export class CheckboxPlayground extends React.Component<{}, {}> {
  public render() {
    return <Gapped vertical>{getComponentsFromPropsList(<Checkbox />, propsList)}</Gapped>;
  }

  public componentDidMount(): void {
    const focusElement = this.refs.focusElement as Checkbox;

    if (focusElement) {
      focusElement.focus();
    }
  }
}
