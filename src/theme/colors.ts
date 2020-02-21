import chroma from 'chroma-js';
import { defaultScales } from './colorScales';
import { createLightShadows, createDarkShadows } from './shadows';
import { Scales, Palette, BackSepTexSh, ThemeColorModes } from './types';

export function brighten(c: string, amount: number): string {
  return chroma(c)
    .brighten(amount)
    .hex();
}

export function alpha(c: string, amount: number): string {
  return chroma(c)
    .alpha(amount)
    .hex();
}

/**
 * `light` is typically used in dark mode for things like
 *  outline buttons, ghost buttons, etc.
 * `base` is typically used for buttons, avatar colors, etc.
 */

const defaultPalette: Palette = {
  gray: {
    lightest: defaultScales.gray[1],
    light: defaultScales.gray[4],
    base: defaultScales.gray[7],
    dark: defaultScales.gray[9]
  },
  blue: {
    lightest: defaultScales.blue[2],
    light: defaultScales.blue[5],
    base: defaultScales.blue[8],
    dark: defaultScales.blue[9]
  },
  red: {
    lightest: defaultScales.red[2],
    light: defaultScales.red[4],
    base: defaultScales.red[8],
    dark: defaultScales.red[9]
  },
  orange: {
    lightest: defaultScales.orange[2],
    light: defaultScales.orange[5],
    base: defaultScales.orange[7],
    dark: defaultScales.orange[9]
  },
  yellow: {
    lightest: defaultScales.yellow[1],
    light: defaultScales.yellow[4],
    base: defaultScales.yellow[8],
    dark: defaultScales.yellow[9]
  },
  green: {
    lightest: defaultScales.green[1],
    light: defaultScales.green[2],
    base: defaultScales.green[8],
    dark: defaultScales.green[9]
  },
  lime: {
    lightest: defaultScales.lime[1],
    light: defaultScales.lime[4],
    base: defaultScales.lime[8],
    dark: defaultScales.lime[9]
  },
  violet: {
    lightest: defaultScales.violet[2],
    light: defaultScales.violet[4],
    base: defaultScales.violet[8],
    dark: defaultScales.violet[9]
  },
  aubergine: {
    lightest: defaultScales.aubergine[2],
    light: defaultScales.aubergine[4],
    base: defaultScales.aubergine[8],
    dark: defaultScales.aubergine[9]
  },
  white: {
    lightest: defaultScales.white[0],
    light: defaultScales.white[2],
    base: defaultScales.white[3],
    dark: defaultScales.white[6]
  },
  indigo: {
    lightest: defaultScales.indigo[0],
    light: defaultScales.indigo[2],
    base: defaultScales.indigo[3],
    dark: defaultScales.indigo[6]
  }
};

/**
 *  lightmode colors
 */

function defaultGenerateLightMode(
  scales: Scales,
  palette: Palette
): BackSepTexSh {
  return {
    background: {
      primary: scales.aubergine[9],
      secondary: scales.white[9],
      overlay: alpha(scales.gray[1], 0.6),
      layer: scales.white[8],
      default: scales.gray[2]
    },
    seperator: {
      default: alpha(scales.orange[8], 0.2),
      muted: alpha(scales.gray[8], 0.8)
    },
    text: {
      primary: scales.white[0],
      secondary: scales.gray[9],
      overlay: scales.white[8],
      layer: scales.gray[9],
      default: scales.gray[9],
      muted: brighten(scales.gray[7], 0.3),
      bright: scales.orange[5],
      selected: palette.lime.base
    },
    shadows: createLightShadows(scales.gray[8])
  };
}

/**
 * Generate dark mode colors
 * @param scales
 * @param palette
 */

function defaultGenerateDarkMode(
  scales: Scales,
  palette: Palette
): BackSepTexSh {
  const base = scales.gray[9];

  return {
    background: {
      primary: brighten(base, 0.9),
      secondary: brighten(base, 1.2),
      overlay: alpha(scales.gray[7], 0.8),
      layer: brighten(base, 0.2),
      default: scales.aubergine[9]
    },
    seperator: {
      default: scales.gray[9],
      muted: alpha(scales.gray[0], 0.08)
    },
    text: {
      primary: scales.white[9],
      secondary: 'rgba(255,255,255,0.7)',
      overlay: scales.white[6],
      layer: scales.white[0],
      muted: 'rgba(255,255,255,0.88)',
      default: scales.gray[1],
      bright: scales.orange[8],
      selected: palette.lime.base
    },
    shadows: createDarkShadows(palette.gray.base)
  };
}

/**
 
 */

function generateColorsFromScales(scales: Scales): ThemeColorModes {
  const modes = {
    light: {
      ...defaultGenerateLightMode(scales, defaultPalette),
      palette: defaultPalette,
      scales
    },
    dark: {
      ...defaultGenerateDarkMode(scales, defaultPalette),
      palette: defaultPalette,
      scales
    }
  };

  return {
    ...modes
  };
}

export const defaultColors = generateColorsFromScales(defaultScales);
