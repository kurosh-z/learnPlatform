import React, { useState } from 'react';
import { useSpring, animated as a } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Button from '../components/Button/Button';
import BurgerBtn from '../components/Button/BurgerBtn';
import SidePanel from './SidePanel';

const ABurgerBtn = a(BurgerBtn);

interface NavPanelProps {
  background_color?: string;
  textColor_opened: string;
  textColor_closed: string;
  conceptVisibility?: boolean;
  navCB?: () => void;
}
// page panel:
const NavPanel: React.FC<NavPanelProps> = ({
  background_color = '#2c142e',
  textColor_opened,
  textColor_closed,
  conceptVisibility = true,
  navCB,
}) => {
  // getting theme from emotion
  const theme = useTheme<Theme>();

  const [sidepanelOn, sidepaneltoggle] = useState<boolean>(false);
  const [{ textColor }, setTextColor] = useSpring(() => ({
    textColor: textColor_closed,
  }));
  setTextColor({
    textColor: sidepanelOn ? textColor_opened : textColor_closed,
  });

  // header component
  const headerCss = emoCSS({
    position: 'fixed',
    display: 'flex',
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100vw',
    height: '80px',
    // borderBottom: `2px solid ${theme.seperator.default}`,
    zIndex: theme.zIndices.fixed,
  });

  const header__logoContainer = emoCSS({
    width: '200px',
    height: '100%',
    padding: '1%',
  });
  const header__logo = emoCSS({
    width: '100%',
    height: '100%',
  });

  const header__nav = emoCSS({
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',

    '.nav__concept': {
      color: theme.palette.white.base,
      fontSize: theme.typography.fontSizes[1],
      fontWeight: theme.typography.fontWeights.bold,
      textAlign: 'center',
      textTransform: 'uppercase',
      textDecoration: 'none',
      marginRight: '1em',
    },
  });
  const nav__btn = emoCSS({
    margin: '.7em 2em auto .5em',
  });

  return (
    <>
      <a.header
        className='headerpanel'
        css={headerCss}
        style={{
          backgroundColor: sidepanelOn ? 'transparent' : background_color,
        }}>
        <a href='#' css={header__logoContainer}>
          <img
            css={header__logo}
            src='https://drive.google.com/uc?id=18ghVt5qnGDcZ8srU6_RojYE2YQpt5SE4'
          />
        </a>

        <nav css={header__nav}>
          <a.a
            href='#'
            className='nav__concept'
            style={{
              color: textColor,
              visibility: conceptVisibility ? 'visible' : 'hidden',
            }}>
            concept
          </a.a>

          <ABurgerBtn
            text='navigation'
            burgerCB={() => {
              sidepaneltoggle((curr) => !curr);
              if (navCB) {
                navCB();
              }
            }}
            color={textColor}
          />
          <Button borderRad='xl' size='lg' css={nav__btn}>
            log in
          </Button>
        </nav>
      </a.header>
      <SidePanel open={sidepanelOn} />
    </>
  );
};

export default NavPanel;
