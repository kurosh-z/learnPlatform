import { defaultColors, alpha } from './colors';
import { breakpoints, generateMediaQueries } from './breakpoints';
import { createLightShadows, createDarkShadows } from './shadows';
import { typography } from './typography';
import { Spaces, Raddi, ZIndices, IconSizes, Theme } from './types';

const spacer: number = 1;

// padding & margin
const spaces: Spaces = {
  none: 0,
  xs: `${spacer * 0.3}rem`,
  sm: `${spacer * 0.5}rem`,
  md: `${spacer}rem`,
  lg: `${spacer * 1.5}rem`,
  xl: `${spacer * 3}rem`
};

// radius (for layers, buttons, etc)
const radii: Raddi = {
  sm: '0.25rem',
  md: '0.4rem',
  lg: '1rem',
  xl: '2rem',
  xxl: '3rem'
};

// bootstrap z-indexs
/* 
@zIndices: this is 
*/
const zIndices: ZIndices = {
  back: -1030, // for background images videos
  backOverlay: -1020, // overlay on top of background but still behind everything
  back0: -1000, // first negative layer and on top of backoverlay
  sticky: 1020, // first positve layer over everything normal
  overlay: 1030, // overlay on everything
  fixed: 1040, // fixed for navigations etc
  popover: 1050, // for pop up messages etc
  tooltip: 1060 // tooltip the last one
};

const iconSizes: IconSizes = {
  xs: '12px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px'
};

const defaultTheme = (mode: 'dark' | 'light'): Theme => {
  const colors = mode === 'dark' ? defaultColors.dark : defaultColors.light;
  const createShadows =
    mode === 'dark' ? createDarkShadows : createLightShadows;
  return {
    ...colors,
    spaces,
    zIndices,
    breakpoints,
    mediaQueries: generateMediaQueries(breakpoints),
    radii,
    typography,
    createshadows: createShadows,
    iconSizes,
    outline: `3px auto ${alpha(colors.palette.violet.base, 0.8)}`,
    mode: mode
  };
};

export default defaultTheme;
