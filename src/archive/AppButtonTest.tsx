import React from 'react';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { useThemeToggler } from './theme/themeContext';
import { Theme } from './theme/types';
import Button from './components/Button/Button';

const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme<Theme>();

  const css = emoCSS({
    width: '100vw',
    height: '100vh',
    color: theme.text.secondary,
    backgroundColor: theme.background.secondary
  });

  return (
    <div className='wrapper' css={css}>
      {children}
    </div>
  );
};

const App: React.FunctionComponent<{}> = () => {
  const themeState = useThemeToggler();

  return (
    <ThemeWrapper>
      <div>
        <h1>Thats a test</h1>

        <Button size='md' color='secondary' variant='outlined'>
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
