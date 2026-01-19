import type { OptionsRecord } from 'src/types';

export const friendlyLookup = {
  svg: 'Root',
  g: 'Group',
  rect: 'Rectangle',
  text: 'Text',
  path: 'Vector',
};
export const applicableOperations = {
  rect: ['image', 'fill', 'stroke'],
  polygon: ['fill', 'stroke'],
  text: ['text', 'fill', 'stroke', 'number'],
  image: ['image', 'stroke'],
  path: ['fill', 'stroke'],
};

export const variableOperations = {
  text: ['text'],
  number: ['text'],
  color: ['fill', 'stroke'],
  image: ['image'],
};

export const variableForOperation = {
  fill: 'color',
  stroke: 'color',
  image: 'image',
  text: 'text',
  number: 'number',
};

export const optionTypes: OptionsRecord = {
  text: [
    {
      name: 'h-align',
      displayName: 'Horizontal Alignment',
      options: ['left', 'center', 'right'],
      default: 'center',
    },
    {
      name: 'v-align',
      displayName: 'Vertical Alignment',
      options: ['baseline', 'center', 'hanging'],
      default: 'center',
    },
    {
      name: 'truncate-to',
      displayName: 'Trunkate Text to',
      options: [
        'as-is',
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
      ],
      default: 'as-is',
    },
    {
      name: 'case',
      displayName: 'Adjust Case',
      options: ['lower', 'upper', 'as-is'],
      default: 'as-is',
    },
  ],
  image: [
    {
      name: 'rescaleOn',
      displayName: 'Rescale Image On',
      options: ['height', 'width', 'long', 'short'],
      default: 'height',
    },
  ],
  fill: [],
  stroke: [],
};

export const selectableElements = Object.keys(applicableOperations);
export const hiddenElements = ['tspan', 'defs'];
