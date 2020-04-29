import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TimelineMax, Quart } from 'gsap';
import { useSpring, config, animated as a, useTransition } from 'react-spring';
// import { useSprings, config, animated as a, useSpring } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
// import HomePage from '../homepage/HomePage';
// import Probability01 from '../Courses/Probability01';

// sidebar width:
const sWidth = 600;

const PanelCanvas: React.FC<{
  navTop: number;
  nav: number;
  visibility: boolean;
}> = ({ nav, navTop, visibility }) => {
  const canvRef = useRef<HTMLCanvasElement>(null);

  if (canvRef.current) {
    const canv = canvRef.current;
    const ctx = canv.getContext('2d');
    let newH = window.innerHeight;
    canv.height = newH;
    // ctx.clearRect(0, 0, 600, newH);
    ctx.fillStyle = '#2c142e'; //'#1a1c1a'; //'#bababa'; // '#2c142e';
    ctx.beginPath();
    ctx.moveTo(sWidth, 0);
    ctx.lineTo(navTop, 0);
    ctx.lineTo(nav, newH);
    ctx.lineTo(sWidth, newH);
    // ctx.lineTo(sWidth, 0);
    ctx.closePath();
    ctx.fill();
  }

  const theme = useTheme<Theme>();
  const sidepanel__canv = emoCSS({
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    minWidth: 500,
    opacity: 1,

    zIndex: theme.zIndices.sticky,
  });
  return (
    <canvas
      style={{ display: visibility ? 'block' : 'none' }}
      id='sideBg'
      css={sidepanel__canv}
      ref={(el) => {
        canvRef.current = el;
      }}
      className='sidepanel__bg'
      width='550'
      height='1000'></canvas>
  );
};

const ApanelCanvas = a(PanelCanvas);

const SidePanel: React.FC<{ open?: boolean }> = ({ open = false }) => {
  const [opened, setOpened] = useState<boolean>(true);

  const [{ nav }, setNav] = useSpring(() => ({
    nav: sWidth,
    config: { mass: 1, friction: 30, tension: 370, velocity: 100 },
  }));
  const [{ navTop }, setNavTop] = useSpring(() => ({
    navTop: sWidth,
    config: { mass: 1, friction: 40, tension: 400, delay: 1200 },
    onRest: () => {
      setOpened((curr) => !curr);
    },
  }));

  useEffect(() => {
    setNav({ nav: open ? sWidth - 380 : sWidth });
    setNavTop({ navTop: open ? sWidth - 600 : sWidth });
  }, [open]);

  const theme = useTheme<Theme>();

  const sidepanel = emoCSS({
    display: open ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    right: 0,
    height: '100vh',
    minWidth: 500,
    // backgroundColor: 'black',
    zIndex: theme.zIndices.sticky,
    backgroundColor: 'transparent',

    a: {
      color: theme.palette.white.light,
      fontFamily: 'open-sans,Helvetica,Arial,sans-serif',
      textTransform: 'uppercase',
      textDecoration: 'none',
    },
    '.sidepanel__up': {
      boreder: '1px solid red',
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      top: 150,
      right: 40,
      //   marginTop: 150,
      flexWrap: 'nowrap',
      whiteSpace: 'nowrap',
      textAlign: 'right',
      fontSize: theme.typography.fontSizes[4],
      letterSpacing: theme.spaces.sm, // TODO:consider changing the theme spacing
    },
    '.sidepanel__down': {
      display: 'flex',
      flexDirection: 'column',
      position: 'absolute',
      bottom: 100,
      right: 100,
      fontSize: theme.typography.fontSizes[0],
    },
  });
  return (
    <Router>
      <ApanelCanvas nav={nav} navTop={navTop} visibility={open || opened} />
      <div className='sidepanel' css={sidepanel}>
        <div className='sidepanel__up'>
          {/* upper list items:  */}
          <ul className='up__list'>
            {/* ------------------ */}
            <li className='up__list__item'>
              <a href='/' className='home'>
                home
              </a>
            </li>
            {/* ------------------ */}

            <li className='up__list__item'>
              <a href='/courses' className='Courses'>
                courses
              </a>
            </li>
            {/* ------------------ */}

            <li className='up__list__item'>
              <Link to={`/community`} className='community'>
                our community
              </Link>
            </li>
            {/* ------------------ */}
          </ul>
        </div>
        {/* upper list items:  */}
        <div className='sidepanel__down'>
          <ul className='down__list'>
            {/* ------------------ */}
            <li className='down__list__item'>
              <a href='#' className='faq'>
                FAQ
              </a>
            </li>
            {/* ------------------ */}
            <li className='down__list__item'>
              <Link to='/about' className='about'>
                About Us
              </Link>
            </li>
            {/* ------------------ */}
            <li className='down__list__item'>
              <a href='#' className='contact'>
                Contact us
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Router>
  );
};

export default SidePanel;
