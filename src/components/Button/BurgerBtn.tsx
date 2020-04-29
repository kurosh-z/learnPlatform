import React, { useRef } from 'react';
// import { useSpring, config, animated as a } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../../theme/types';

/* 
TODO: add some animations to text as it gets clicked (scaled it for example!)
*/

interface BurgerProps {
  color?: string;
  text?: string;
  burgerCB?: () => void; // callback function runs when burger button gets clicked
}

const BurgerBtn: React.FC<BurgerProps> = ({ color, text, burgerCB }) => {
  // ref to the burger:
  const burgerRef = useRef<HTMLAnchorElement>(null);

  // emotion theme:
  const theme = useTheme<Theme>();

  // styles:
  const burger = emoCSS({
    maxWidth: 200,
    height: 100,
    // border: '1px solid red',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '.5em',
    marginRight: '1em',
    cursor: 'pointer',
  });
  const burger__btn = emoCSS({
    marginLeft: '0.5em',
    marginRight: '.5em',

    // border: '1px solid red'

    // transition:
    //   'transform .5s cubic-bezier(.23,1,.32,1),background-color .5s cubic-bezier(.23,1,.32,1)'
  });

  const burger__buns = emoCSS({
    position: 'absolute',
    height: '2px',
    width: '15px',
    // transform: 'translate(50%, -50%)',
    // top: '50%',
    // right: '50%',
    borderRadius: '5px',
    backgroundColor: color ? color : theme.palette.white.light,
    transitionDuration: '.01s',

    // transform: 'translateX(-5px)',
    ':before, &:after': {
      content: '" "',
      display: 'block',
      position: 'absolute',
      height: '2px',
      width: '25px',
      right: 0,
      borderRadius: '5px',
      backgroundColor: color ? color : theme.palette.white.light,
      transition: 'transform 0.1s ease-in-out, top 0.3s ease-in-out 0.3s ',
      willChange: 'transform top background-color',
    },
    ':before': {
      top: '-6px',
    },
    '&:after': {
      top: '6px',
    },

    // .open & ==> selects current element within the parent element with class open ==> .open >
    // ref: https://emotion.sh/docs/nested
    '.open &': {
      transitionDuration: '.4s',
      transitionDelay: '.2s',
      backgroundColor: 'transparent',

      ':before': {
        transition: 'top 0.3s ease-in-out, transform .3s ease-in-out .2s ',
        top: '0px',
        transform: 'rotateZ(-45deg)',
      },
      ':after': {
        transition: 'top 0.3s ease-in-out, transform .3s ease-in-out .2s',
        top: '0px',
        transform: 'rotateZ(45deg)',
      },
    },
  });
  const burger__text = emoCSS({
    display: 'block',
    maxWidth: '150px',
    overflow: 'hidden',
    color: color ? color : theme.palette.white.base,
    fontSize: theme.typography.fontSizes[1],
    fontWeight: theme.typography.fontWeights.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
    textDecoration: 'none',
    marginRight: '1em',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  });
  const textseperator = emoCSS({
    borderLeft: `1.7px solid ${theme.palette.orange.base}`,
    // borderLeft: `2px solid ${theme.seperator.default}`,
    opacity: 0.4,
    height: '60%',
    padding: '.1em',
    margin: 'auto 1em auto 2em',
  });

  // toggle open class when clicked:
  const onClickHandler = () => {
    // console.log(burgerRef);
    burgerRef.current.classList.toggle('open');
    if (burgerCB) burgerCB();
  };
  return (
    <div className='burger' onClick={onClickHandler} css={burger}>
      {text && <div className='seperator' css={textseperator}></div>}
      {text && <a css={burger__text}> {text} </a>}

      <a
        css={burger__btn}
        ref={(el) => {
          burgerRef.current = el;
        }}>
        <div css={burger__buns} />
      </a>
    </div>
  );
};

export default BurgerBtn;
