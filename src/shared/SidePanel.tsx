import React, { useRef, useEffect, useState } from 'react';
import { TimelineMax, Quart } from 'gsap';
// import { useSprings, config, animated as a, useSpring } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
// import HomePage from '../homepage/HomePage';
// import Probability01 from '../Courses/Probability01';

// sidebar width:
const sWidth = 600;

interface DrawBgArgs {
  canv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nav: { x: number };
  navTop: { x: number };
}
const drawBg: ({ canv, ctx, nav, navTop }: DrawBgArgs) => void = ({
  canv,
  ctx,
  nav,
  navTop,
}) => {
  if (!canv || !ctx) {
    console.log('drawBG: something is wrong');
    return;
  }
  //   console.log('nav:', nav.x);
  //   console.log('navT:', navTop.x);

  let newH = window.innerHeight;
  canv.height = newH;
  ctx.fillStyle = '#2c142e'; //'#1a1c1a'; //'#bababa'; // '#2c142e';
  ctx.beginPath();
  ctx.moveTo(sWidth, 0);
  ctx.lineTo(navTop.x, 0);
  ctx.lineTo(nav.x, newH);
  ctx.lineTo(sWidth, newH);
  ctx.closePath();
  ctx.fill();
};

const SidePanel: React.FC<{ open?: boolean }> = ({ open = false }) => {
  // ref to canvas:
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<CanvasRenderingContext2D | null>(null);
  const [opened, setOpened] = useState<boolean>(false);
  useEffect(() => {
    if (canvas.current) {
      ctx.current = canvas.current.getContext('2d');
    }
    // console.log('ctx: ', ctx.current);
  }, [canvas.current, ctx.current]);
  //setting up a timeline
  const t1 = useRef<TimelineMax>();
  // init the timeline in callback
  useEffect(() => {
    t1.current = new TimelineMax();
  }, [t1]);

  const navTop = { x: sWidth };
  const nav = { x: sWidth };

  useEffect(() => {
    if (open && t1.current && canvas.current && ctx.current) {
      // console.log('test');
      t1.current
        .fromTo(
          nav,
          0.26,
          { x: sWidth },
          {
            x: sWidth - 380,
            ease: Quart.easeInOut,
            delay: 0,
          }
        )

        .fromTo(
          navTop,
          0.4,
          { x: sWidth },
          {
            x: sWidth - 600,
            ease: Quart.easeInOut,
            delay: 0,
            onUpdate: () => {
              drawBg({
                canv: canvas.current,
                ctx: ctx.current,
                nav: nav,
                navTop: navTop,
              });
            },
            onComplete: () => {
              setOpened((curr) => !curr);
            },
          }
        );
    }
    if (
      opened &&
      !open &&
      !t1.current.isActive() &&
      canvas.current &&
      ctx.current
    ) {
      // console.log('reverse');
      t1.current.reverse();
    }
    // return () => t1.current.kill();
  }, [canvas.current, open]);

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

    '.sidepanel__bg': {
      //   position: 'absolute',
      display: 'inline-block',
      width: '100%',
      height: '100%',
      background: 'transparent',
      //   border: '1px solid white',
      opacity: 1,
    },

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
      <div className='sidepanel' css={sidepanel}>
        <canvas
          id='sideBg'
          ref={(el) => {
            canvas.current = el;
          }}
          className='sidepanel__bg'
          width='550'
          height='1000'></canvas>
        <div className='sidepanel__up'>
          {/* upper list items:  */}
          <ul className='up__list'>
            {/* ------------------ */}
            <li className='up__list__item'>
              <Link to='/' className='home'>
                home
              </Link>
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
