import ReactDOM from 'react-dom'
import React from 'react'
import './index.css'
import App from './App'
import { ThemeProvider } from './theme/themeContext'
import { StateProvider } from './app_states/stateContext'
// import { LatexProvider } from './math-components/LatexContext';
// import { MathJaxProvider } from './mathjax/ MathJaxContext';
// import * as serviceWorker from './serviceWorker';

ReactDOM.render(
    <ThemeProvider>
        <StateProvider>
            <App />
        </StateProvider>
    </ThemeProvider>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
