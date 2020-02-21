// import * as ReactDOM from 'react-dom';
import React from 'react';
// import { useTheme } from 'emotion-theming';
import { css as emoCSS } from '@emotion/core';
// import emoStyled from '../../theme/emoStyled';
// import { default as emoStyled, StyledComponent } from '@emotion/styled';
// import { SerializedStyles } from '@emotion/utils';

// import { Theme } from '../../theme/types';
const baseStyles = emoCSS({
  /* Styles applied to the root element. */
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    WebkitTapHighlightColor: 'transparent',
    WebkitFontSmoothing: 'antialiased',
    textRendering: 'optimizeLegibility',
    backgroundColor: 'transparent', // Reset default value
    // We disable the focus ring for mouse, touch and keyboard users.
    outline: 0,
    border: 0,
    margin: 0, // Remove the margin in Safari
    borderRadius: 0,
    padding: 0, // Remove the padding in Firefox
    cursor: 'pointer',
    userSelect: 'none',
    verticalAlign: 'middle',

    // '-moz-appearance': 'none', // Reset
    // '-webkit-appearance': 'none', // Reset
    textDecoration: 'none',
    // So we take precedent over the style of a native <a /> element.
    color: 'inherit',
    '&::-moz-focus-inner': {
      borderStyle: 'none' // Remove Firefox dotted outline.
    }
  },
  outlineStyle: 'none',
  boxShadow: 'none',
  borderColor: 'transparent'
});

export interface BaseBtnProps {
  component?: React.ElementType<any>;
  type?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  href?: string;
  rest?: any;
  ref?: React.Ref<any>;
}

const BaseBtn: React.RefForwardingComponent<
  HTMLButtonElement,
  BaseBtnProps
> = React.forwardRef((props, ref) => {
  const {
    component = 'button',
    type = 'button',
    disabled = false,
    children,
    className,
    href,
    rest
  } = props;

  // const buttonRef = React.userRef(null);

  // function getButtonNode() {
  //   return ReactDOM.findDOMNode(buttonRef.current);
  // }

  // const theme = useTheme<Theme>();

  let BtnComponent = component;
  const compProps: { type?: string; disabled?: boolean; role?: string } = {};
  if (BtnComponent === 'button') {
    compProps.type = type;
    compProps.disabled = disabled;
  } else {
    if (BtnComponent !== 'a' || !href) {
      compProps.role = 'button';
    }
    // compProps['aria-disabled'] = disabled;
  }

  return (
    <BtnComponent
      className={className}
      ref={ref}
      css={baseStyles}
      {...compProps}
      {...rest}
    >
      {children}
    </BtnComponent>
  );
});

// const BaseBtn: StyledComponent<BaseBtnProps, {}, {}> = emoStyled(Btn)(
//   baseStyles
// );

// const BaseBtn: StyledComponent<
//   BaseBtnProps,
//   { cssStyles?: SerializedStyles },
//   {}
// > = emoStyled(Btn)`
//   ${baseStyles},
//   ${cssStyles => cssStyles}
// `;

export default BaseBtn;
