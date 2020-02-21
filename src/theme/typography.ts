import {
  ThemeFontSize,
  ThemeFont,
  ThemeLineHeight,
  ThemeFontWeights,
  h,
  ThemeTypography
} from './types';

// font sizes
const fontSizes: ThemeFontSize = {
  0: '0.875rem', // 13.12px
  1: '1rem', // 15px
  2: '1.25rem', // 18.75px
  3: '1.5rem', // 22.5px
  4: '1.75rem', // 26.25
  5: '2rem', // 30px
  6: '2.5rem', //37.5px
  7: '3.5rem',
  8: '4.5rem',
  9: '5.5rem'
};

const sansFonts: string = [
  '-apple-system',
  '"Segoe UI"',
  '"Roboto"',
  'Raleway',
  'Helvetica'
].join(',');

const baseFonts: string = `Rossario`;
const monospaceFonts: string = [
  'SFMono-Regular',
  'Menlo',
  'Monaco',
  'Consolas',
  '"Liberation Mono"',
  '"Courier New"',
  'monospace'
].join(',');

const fonts: ThemeFont = {
  sans: sansFonts,
  base: baseFonts,
  monospace: monospaceFonts
};

const lineHeights: ThemeLineHeight = {
  reg: 1,
  md: 1.07,
  lg: 1.17,
  xl: 1.33
};

const fontWeights: ThemeFontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  bold: 700
};

const h1: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 300,
  fontSize: '6rem',
  lineHeight: 1,
  letterSpacing: '-0.01562em'
};
const h2: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 300,
  fontSize: '3.75rem',
  lineHeight: 1,
  letterSpacing: '-0.00833em'
};
const h3: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '3rem',
  lineHeight: 1.04,
  letterSpacing: '0em'
};
const h4: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '2.125rem',
  lineHeight: 1.17,
  letterSpacing: '-0.00735em'
};
const h5: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 300,
  fontSize: '1.5rem',
  lineHeight: 1.33,
  letterSpacing: '0.0em'
};
const h6: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 500,
  fontSize: '1.25rem',
  lineHeight: 1.6,
  letterSpacing: '0.0075em'
};
const subtitle1: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.75,
  letterSpacing: '0.00938em'
};
const subtitle2: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: 1.57,
  letterSpacing: '0.00714em'
};

const body1: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.5,
  letterSpacing: '0.00938em'
};

const body2: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.43,
  letterSpacing: '0.01071em'
};
const button: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 700,
  fontSize: '0.875rem',
  lineHeight: 1.75,
  letterSpacing: '0.02857em',
  textTransform: 'uppercase'
};
const caption: h = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: 1.66,
  letterSpacing: '0.03333em'
};
export const typography: ThemeTypography = {
  fontSizes: fontSizes,
  fonts: fonts,
  fontWeights: fontWeights,
  lineHeights: lineHeights,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  subtitle1,
  subtitle2,
  body1,
  body2,
  button,
  caption
};
