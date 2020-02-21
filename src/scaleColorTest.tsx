import React from 'react';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { useThemeToggler } from './theme/themeContext';
import { Theme } from './theme/types';
import Button from './components/Button/Button';

// import BaseBtn from './components/baseBtn/BaseBtn';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme<Theme>();

  const css = emoCSS({
    width: '100vw',
    height: '100vh',
    color: theme.text.bright,
    backgroundColor: theme.background.primary
  });

  return (
    <div className='wrapper' css={css}>
      {children}
    </div>
  );
};

const App: React.StatelessComponent<{}> = () => {
  const themeState = useThemeToggler();
  const theme = useTheme<Theme>();
  const colorScale = theme.scales.orange;
  const listItems = colorScale.map((clr, idx) => (
    <li
      key={idx}
      style={{
        backgroundColor: clr,
        fontSize: '1rem',
        height: '2rem',
        padding: '1.5%',
        listStyle: 'none'
      }}
    >
      <p>
        scale {idx}:{clr}
      </p>
    </li>
  ));
  return (
    <ThemeWrapper>
      <div>
        <h1>Thats a test</h1>
        <ul>{listItems}</ul>
        <Button size='md' borderRad='' variant='outlined'>
          Login
        </Button>
      </div>
      <div>
        <button
          onClick={() => {
            themeState.toggle();
          }}
        >
          {themeState.dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </ThemeWrapper>
  );
};

export default App;
