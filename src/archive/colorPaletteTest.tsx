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
  const orange = theme.palette.orange;

  return (
    <ThemeWrapper>
      <div>
        <h1>Thats a test</h1>
        <ul>
          <li
            key={1}
            style={{
              backgroundColor: orange.dark,
              fontSize: '1rem',
              height: '2rem',
              padding: '1.5%',
              listStyle: 'none',
              color: 'white'
            }}
          >
            <p>scale dark</p>
          </li>
          <li
            key={2}
            style={{
              backgroundColor: orange.base,
              fontSize: '1rem',
              height: '2rem',
              padding: '1.5%',
              listStyle: 'none',
              color: 'white'
            }}
          >
            <p>scale base</p>
          </li>
          <li
            key={3}
            style={{
              backgroundColor: orange.light,
              fontSize: '1rem',
              height: '2rem',
              padding: '1.5%',
              listStyle: 'none',
              color: 'white'
            }}
          >
            <p>scale light</p>
          </li>
          <li
            key={1}
            style={{
              backgroundColor: orange.lightest,
              fontSize: '1rem',
              height: '2rem',
              padding: '1.5%',
              listStyle: 'none',
              color: 'white'
            }}
          >
            <p>scale lightest</p>
          </li>
        </ul>
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
