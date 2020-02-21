import React from 'react';
// import { useSpring, animated as a } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import { alpha } from '../theme/colors';
import Button from '../components/Button/Button';
import BurgerBtn from '../components/Button/BurgerBtn';

interface HeaderPanelProps {
  opacity?: number;
  burgerCB: () => void; // callback function runs when burger button gets clicked
}
// page panel:
const HeaderPanel: React.FC<HeaderPanelProps> = ({ opacity = 0, burgerCB }) => {
  // getting theme from emotion
  const theme = useTheme<Theme>();

  // header component
  const headerCss = emoCSS({
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100vw',
    height: '80px',
    // borderBottom: `2px solid ${theme.seperator.default}`,
    zIndex: theme.zIndices.fixed
  });

  const header__logoContainer = emoCSS({
    width: '200px',
    height: '100%',
    padding: '1%'
  });
  const header__logo = emoCSS({
    width: '100%',
    height: '100%'
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
      marginRight: '1em'
    }
  });
  const nav__btn = emoCSS({
    margin: '.7em 2em auto .5em'
  });

  return (
    <header
      className='headerpanel'
      css={headerCss}
      style={{ backgroundColor: alpha(theme.palette.aubergine.dark, opacity) }}>
      <a href='#' css={header__logoContainer}>
        <img
          css={header__logo}
          src='https://drive.google.com/uc?id=18ghVt5qnGDcZ8srU6_RojYE2YQpt5SE4'
        />
      </a>

      <nav css={header__nav}>
        <a href='#' className='nav__concept'>
          concept
        </a>

        <BurgerBtn text='navigation' burgerCB={burgerCB} />
        <Button borderRad='xl' size='lg' css={nav__btn}>
          log in
        </Button>
      </nav>
    </header>
  );
};

export default HeaderPanel;
