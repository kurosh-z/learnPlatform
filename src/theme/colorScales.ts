import chroma from 'chroma-js';
import { ColorScale, Scales } from './types';
/**
 * scales are compatible with other color libraries
 * like palx.
 */
const blueScale: ColorScale = chroma
  .scale(['#d0ebff', '#008cff', '#0000ff'])
  .correctLightness()
  .colors(10);

const orangeScale: ColorScale = chroma
  .scale(['#f98d75', '#f8795d', '#f6512c'])
  .correctLightness()
  .colors(10);

const limeScale: ColorScale = chroma
  .bezier(['#f4fce3', '#94d82d', '#5c940d'])
  .scale()
  .correctLightness()
  .colors(10);

const greenScale: ColorScale = chroma
  .scale(['#ebfbee', '#5df879', '#2b8a3e'])
  .correctLightness()
  .colors(10);

const indigoScale: ColorScale = chroma
  .scale(['#edf2ff', '#748ffc', '#364fc7'])
  .correctLightness()
  .colors(10);

const violetScale: ColorScale = chroma
  .scale(['#f3f0ff', '#9775fa', '#5f3dc4'])
  .correctLightness()
  .colors(10);

const grayScale: ColorScale = chroma
  .scale(['#f8f9fa', '#666666', '#000000'])
  .correctLightness()
  .colors(10);

const redScale: ColorScale = chroma
  .scale(['#fff5f5', '#fa5252', '#e60000'])
  .correctLightness()
  .colors(10);

const yellowScale: ColorScale = chroma
  .scale(['#fcffdb', '#faef00', '#fcc419'])
  .correctLightness()
  .colors(10);

const aubergineScale: ColorScale = chroma
  .scale(['#dfbee3', '#5f2c65', '#2d1530', '#2c142e'])
  .correctLightness()
  .colors(10);

const whiteScale: ColorScale = chroma
  .scale(['#ffff', '#F7F5F5', '#eeefee'])
  .correctLightness()
  .colors(10);

export const defaultScales: Scales = {
  gray: grayScale,
  blue: blueScale,
  green: greenScale,
  red: redScale,
  orange: orangeScale,
  yellow: yellowScale,
  lime: limeScale,
  violet: violetScale,
  indigo: indigoScale,
  aubergine: aubergineScale,
  white: whiteScale
};
