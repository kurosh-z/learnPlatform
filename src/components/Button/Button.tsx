import React, { useMemo } from 'react';
import { css } from '@emotion/core';
import { SerializedStyles } from '@emotion/utils';
import { useTheme } from 'emotion-theming';
import BaseBtn, { BaseBtnProps } from '../baseBtn/BaseBtn';
import { Theme, Raddi } from '../../theme/types';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const ButtonHeights = {
  xs: '2rem',
  sm: '2.3rem',
  md: '3rem',
  lg: '3.5rem',
  xl: '3.9rem',
};
// const ButtonWidths = {
//   xs: '4rem',
//   sm: '4.8rem',
//   md: '7rem',
//   lg: '7.8rem',
//   xl: '8.4rem'
// };

const ButtonPaddings = {
  xs: '0 0.6rem',
  sm: '0 0.9rem',
  md: '0 1.7rem',
  lg: '0 2.2rem',
  xl: '0 2.3rem',
};

const getFontSize = (size: ButtonSize, theme: Theme) => {
  if (size === 'xs') return theme.typography.button.fontSize;
  if (size === 'lg') return theme.typography.fontSizes[1];
  if (size === 'sm') return theme.typography.fontSizes[0];
  if (size === 'xl') return theme.typography.fontSizes[2];
  return theme.typography.button.fontSize;
};

// export function focusShadow(first: string, second: string, third: string) {
//   return `0 0 0 3px ${first}, inset 0 0 0 1px ${second}, inset 0 -1px 1px 0 ${third}`;
// }

// function insetShadow(from: string, to: string) {
//   return `inset 0 0 0 1px ${from}, inset 0 -1px 1px 0 ${to}`;
// }

const getDefaultColor = (color: BtnColors, theme: Theme, disabled: boolean) => {
  let mode = theme.mode;
  if (disabled) return theme.palette.gray.lightest;
  if (color === 'primary')
    return mode == 'light'
      ? theme.palette.orange.base
      : theme.palette.orange.light;
  if (color === 'secondary')
    return mode === 'light'
      ? theme.palette.blue.base
      : theme.palette.blue.light;
  if (color === 'default')
    return mode == 'light'
      ? theme.palette.gray.light
      : theme.palette.gray.lightest;
  else {
    let ret = mode == 'dark' ? color.dark : color.light;
    return ret;
  }
};

const getTextcolor = (
  color: BtnColors,
  textColor: { dark: string; light: string } | undefined,
  variant: 'outlined' | 'contained' | 'textButton',
  theme: Theme
) => {
  const mode = theme.mode;

  // if this is not a contained button:
  if (variant !== 'contained') {
    // if there is textColor just return it:
    if (textColor) {
      return mode === 'light' ? textColor.light : textColor.dark;
    } // if there is no textColor choose the textcolor based on color:
    else if (!textColor) {
      if (mode === 'light') {
        if (color === 'primary') return theme.palette.orange.base;
        if (color === 'secondary') return theme.palette.blue.base;
        if (color == 'default') return theme.palette.gray.base;
        else return color.light;
      } else if (mode === 'dark') {
        if (color === 'primary') return theme.palette.orange.light;
        if (color === 'secondary') return theme.palette.blue.light;
        if (color == 'default') return theme.palette.gray.lightest;
        else return color.dark;
      }
    }
  }
  // if it is acontained button text should be choose according to the filling color:
  if (variant === 'contained') {
    if (textColor) {
      return mode === 'light' ? textColor.light : textColor.dark;
    }
    if (!textColor) {
      if (mode === 'light') {
        if (color !== 'default') return theme.palette.white.base;
        if (color == 'default') return theme.palette.gray.dark;
      } else if (mode === 'dark') {
        if (color !== 'default') return theme.palette.gray.base;
        if (color == 'default') return theme.palette.gray.dark;
      }
    }
  }
  //TODO: see whty without this not all the combinations are met!
  return theme.palette.violet.light;
};

const getHoverColor = (
  color: BtnColors,
  hoverColor: BtnColors | undefined,
  variant: 'outlined' | 'contained' | 'textButton',
  theme: Theme
) => {
  if (variant === 'contained' && !hoverColor && theme.mode === 'light')
    return theme.palette.lime.light;
  else if (variant === 'contained' && !hoverColor && theme.mode === 'dark')
    return theme.palette.lime.base;
  else {
    let ret =
      !hoverColor && variant !== 'contained' ? color : hoverColor || color;
    if (ret === 'primary') return theme.palette.orange.light;
    if (ret === 'secondary') return theme.palette.blue.light;
    if (ret === 'default') return theme.palette.lime.base;
    if (theme.mode === 'dark') return ret.dark;
    else return ret.light;
  }
};

const hoverRotateIn: (
  theme: Theme,
  borderRad: string,
  hoverColor?: string
) => SerializedStyles = (theme, borderRad, hoverColor) => {
  let reducedRad = '.2rem';
  if (borderRad === theme.radii.sm || borderRad === theme.radii.md)
    reducedRad = '.1rem';
  else if (borderRad === theme.radii.lg) reducedRad = '.4rem';
  else if (borderRad === theme.radii.xl || borderRad === theme.radii.xxl) {
    reducedRad = '2rem';
  }

  const hover = css({
    '&::after': {
      label: '-rotateIn',
      backgroundColor: hoverColor,
      content: `" "`,
      borderRadius: reducedRad,
      display: 'block',
      position: 'absolute',
      height: '100%',
      width: '100%',
      left: 0,
      top: 0,
      transform: 'translate(-100%, 0) rotate(10deg)',
      transformOrigin: 'top left',
      transition: '.15s transform ease-out',
      willChange: 'transform opacity',
      opacity: 0.8,
      zIndex: -2,
    },
    '&:hover::after': {
      transform: 'translate(0,0)',
      opacity: 1,
    },
    '&:hover': {
      color: theme.palette.white.lightest,
      transform: 'scale(1.05)',
      willChange: 'transform',
    },
  });

  return hover;
};

type BtnColors =
  | 'primary'
  | 'secondary'
  | 'default'
  | { dark: string; light: string };

interface ButtonProps extends BaseBtnProps {
  color?: BtnColors;
  textColor?: { light: string; dark: string };
  variant?: 'contained' | 'outlined' | 'textButton';
  hover?: 'default' | 'rotateIn';
  hoverColor?: BtnColors;
  size?: ButtonSize;
  borderRad?: keyof Raddi;
  onClick?: (ev: MouseEvent) => void;
}

type StyleProps = {
  theme: Theme;
  color: BtnColors;
  textColor?: { dark: string; light: string };
  variant: 'contained' | 'outlined' | 'textButton';
  size: ButtonSize;
  disabled: boolean;
  borderRad: keyof Raddi;
  hover: 'default' | 'rotateIn';
  hoverColor?: BtnColors;
};

const computeStyles = ({
  theme,
  color,
  variant,
  size,
  disabled,
  borderRad,
  hover,
  hoverColor,
  textColor,
}: StyleProps) => {
  const backColor = getDefaultColor(color, theme, disabled);

  const basicStyle = css({
    label: 'btn',
    // width: ButtonWidths[size],
    height: ButtonHeights[size],
    padding: ButtonPaddings[size],
    margin: theme.spaces.xs,
    backgroundColor: variant === 'contained' ? backColor : 'transparent',
    border:
      variant === 'contained' || variant === 'textButton'
        ? 'none'
        : `2px solid ${backColor}`,
    borderRadius: theme.radii[borderRad],
    overflow: 'hidden',
    textAlign: 'center',
    fontSize: getFontSize(size, theme),
    fontFamily: theme.typography.button.fontFamily,
    letterSpacing: theme.typography.button.letterSpacing,
    fontWeight: theme.typography.button.fontWeight,
    whiteSpace: 'nowrap',
    boxShadow:
      theme.mode === 'light'
        ? theme.createshadows(backColor)['sm']
        : theme.shadows.sm,
    color: getTextcolor(color, textColor, variant, theme),
    textTransform: 'uppercase',
    transition: '.2s transfrom ease-in',
    willChange: 'transform',
    cursor: 'pointer',
    zIndex: 0,
  });
  let hoverStyle;
  if (hover === 'rotateIn') {
    hoverStyle = hoverRotateIn(
      theme,
      borderRad,
      getHoverColor(color, hoverColor, variant, theme)
    );
  } else {
    // TODO: the ripple effect on  hover / click?
    hoverStyle = css({});
  }

  return [basicStyle, hoverStyle];
};

const Button: React.RefForwardingComponent<
  HTMLButtonElement,
  ButtonProps
> = React.forwardRef((props, ref: React.Ref<any>) => {
  const {
    component = 'button',
    type = 'button',
    disabled = false,
    children,
    className,
    href,
    variant = 'outlined',
    color = 'primary',
    textColor,
    size = 'md',
    hover = 'rotateIn',
    hoverColor,
    borderRad = 'md',
    onClick,
  } = props;

  const theme = useTheme<Theme>();

  const styleProps = {
    theme: theme,
    color: color,
    textColor: textColor,
    variant: variant,
    size: size,
    hover: hover,
    disabled: disabled,
    borderRad: borderRad,
    hoverColor: hoverColor,
  };
  const styles = useMemo(() => computeStyles(styleProps), [styleProps]);

  return (
    <BaseBtn
      css={styles}
      type={type}
      component={component}
      ref={ref}
      href={href}
      disabled={disabled}
      onClick={onClick}
      className={className}>
      {typeof children !== 'string' ? <span>{children}</span> : children}
    </BaseBtn>
  );
});

export default Button;
