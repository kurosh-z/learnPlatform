/* 
type definitions for defaultScales.ts
*/
export type ColorScale = string[];
export interface Scales {
  gray: ColorScale;
  blue: ColorScale;
  green: ColorScale;
  red: ColorScale;
  orange: ColorScale;
  yellow: ColorScale;
  lime: ColorScale;
  violet: ColorScale;
  indigo: ColorScale;
  aubergine: ColorScale;
  white: ColorScale;
}

/* 
type definitions for colors.ts
*/
export type PaletteItem = {
  lightest: string;
  light: string;
  base: string;
  dark: string;
};

/* 
for every keys of T generates type U
 */
type GenerateTypesforKeys<T, U> = {
  [k in keyof T]: U;
};

export type Palette = GenerateTypesforKeys<Scales, PaletteItem>;

export type BackgroundColors = {
  primary: string;
  secondary: string;
  default: string;
  layer: string;
  overlay: string;
};
export type SeperatorColors = {
  default: string;
  muted: string;
};
export interface TextColors extends BackgroundColors {
  muted: string;
  bright: string;
  selected: string;
}

/* 
shadows
 */
export type Shadows = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};
export interface BackSepTexSh {
  background: BackgroundColors;
  seperator: SeperatorColors;
  text: TextColors;
  shadows: Shadows;
}

export interface ThemeColors extends BackSepTexSh {
  palette: Palette;
  scales: Scales;
}
export type ThemeColorModes = {
  light: ThemeColors;
  dark: ThemeColors;
};

/* 
breakPoints MediaQueries:
*/

export interface BreakPoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}
export interface MediaQueries extends BreakPoints {
  hover: string;
}
/* 
type definitions for fontSizes.tsx
*/
export type ThemeFontSize = {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
};
export type ThemeFont = {
  sans: string;
  base: string;
  monospace: string;
};
export type ThemeLineHeight = {
  reg: number;
  md: number;
  lg: number;
  xl: number;
};
export type ThemeFontWeights = {
  light: number;
  regular: number;
  medium: number;
  bold: number;
};
export type h = {
  fontFamily: string;
  fontWeight: number;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  textTransform?: string;
};
export type ThemeTypography = {
  fontSizes: ThemeFontSize;
  fonts: ThemeFont;
  fontWeights: ThemeFontWeights;
  lineHeights: ThemeLineHeight;
  h1: h;
  h2: h;
  h3: h;
  h4: h;
  h5: h;
  h6: h;
  subtitle1: h;
  subtitle2: h;
  body1: h;
  body2: h;
  button: h;
  caption: h;
};
/* 
type definitions for theme.tsx
*/
export type Spaces = {
  none: number;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};
export type Raddi = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
};
export type ZIndices = {
  back: number;
  backOverlay: number;
  back0: number;
  sticky: number;
  fixed: number;
  overlay: number;
  popover: number;
  tooltip: number;
};
export type IconSizes = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};
export interface Theme extends ThemeColors {
  spaces: Spaces;
  zIndices: ZIndices;
  breakpoints: BreakPoints;
  mediaQueries: MediaQueries;
  radii: Raddi;
  typography: ThemeTypography;
  createshadows: (color: string) => Shadows;
  iconSizes: IconSizes;
  outline: string;
  mode: 'dark' | 'light';
}

/* 
type definitions for useTheme.tsx
*/

export interface themeState {
  dark: boolean;
  hasThemeMounted: boolean;
}

export type darkModeHook = () => [themeState, (themeState: themeState) => void];

export interface providerValue {
  dark: boolean;
  toggle: () => void;
}
