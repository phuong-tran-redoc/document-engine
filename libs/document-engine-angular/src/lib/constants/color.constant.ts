import { Color } from '@notum/document-engine-core';

export const COLORS: Color[] = Color.fromArray([
  { name: 'Black', value: '#000000', type: 'hex' },
  { name: 'Dim gray', value: '#696969', type: 'hex' },
  { name: 'Light gray', value: '#d3d3d3', type: 'hex' },
  { name: 'White', value: '#ffffff', type: 'hex' },
  { name: 'Transparent', value: 'transparent', type: 'hex' },

  // row 2
  { name: 'Red', value: '#ff0000', type: 'hex' },
  { name: 'Orange', value: '#ffa500', type: 'hex' },
  { name: 'Yellow', value: '#ffff00', type: 'hex' },
  { name: 'Light green', value: '#90ee90', type: 'hex' },
  { name: 'Green', value: '#008000', type: 'hex' },

  // row 3
  { name: 'Aquamarine', value: '#7fffd4', type: 'hex' },
  { name: 'Turquoise', value: '#40e0d0', type: 'hex' },
  { name: 'Lightblue', value: '#add8e6', type: 'hex' },
  { name: 'Blue', value: '#0000ff', type: 'hex' },
  { name: 'Purple', value: '#800080', type: 'hex' },
]);
