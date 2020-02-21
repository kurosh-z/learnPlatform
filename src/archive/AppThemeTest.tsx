import React from 'react';
import { useTheme } from 'emotion-theming';
import { css as emoCSS } from '@emotion/core';
import { useThemeToggler } from './theme/themeContext';
import { Theme } from './theme/types';

const Wrapper = ({ children }: { children: JSX.Element[] }) => {
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

const App = () => {
  const themeState = useThemeToggler();
  return (
    <Wrapper>
      <h1>Dark Mode example</h1>
      <div>
        <button
          onClick={() => {
            themeState.toggle();
          }}
        >
          {themeState.dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>
    </Wrapper>
  );
};

// const Test = ({ theme, ...po }) => {
//   return;
//   <div
//     css={theme => {
//       color: theme.intent.secondary.base;
//     }}
//   ></div>;
// };

// function App() {
//   const colorScale = defaultScales.gray;
//   console.log(defaultTheme('light'));
//   const listItems = colorScale.map((clr, idx) => (
//     <li
//       key={idx}
//       style={{
//         backgroundColor: clr,
//         fontSize: '1rem',
//         width: '300px',
//         height: '2rem',
//         padding: '1.5%'
//       }}
//     >
//       <p>
//         scale {idx}:{clr}
//       </p>
//     </li>
//   ));

//   return (
//     <div className='App' style={{ backgroundColor: 'white' }}>
//       <ul>{listItems}</ul>
//     </div>
//   );
// }

export default App;
