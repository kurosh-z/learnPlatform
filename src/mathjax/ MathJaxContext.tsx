import * as React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';

// import loadScript from "./loadScript";

declare var MathJax: any;
export type MathJaxContextValue = {
  MathJax?: any;
  registerNode: () => void;
};

const MathJaxContext = createContext({
  MathJax: null,
  registerNode: () => {}
});

export const useMathJaxContext = () => useContext(MathJaxContext);
// const defaultProps = {
//   script:
//     'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML',
//   options: {
//     tex2jax: {
//       inlineMath: []
//     },
//     showMathMenu: false,
//     showMathMenuMSIE: false
//   }
// };

type PropsTypes = {
  url?: string;
  options?: Object;
  Children?: React.ReactNode;
};
// TODO: set options and url
export const MathJaxProvider: React.FC<PropsTypes> = ({
  url,
  options,
  children
}) => {
  const [{ MathJax2, hasNode }, setMathJaxState] = useState({
    MathJax2: null,
    hasNode: false
  });
  const registerNode = () => {
    setMathJaxState(curr => ({ ...curr, hasNode: true }));
  };
  const [loaded, setloaded] = useState<boolean>(false);
  const onLoad = (err?: Error) => {
    MathJax2.Hub.config(options);
    setMathJaxState(curr => ({ ...curr, MathJax2: MathJax }));
  };
  useEffect(() => {
    if (!loaded && !hasNode) {
      setloaded(true);
      // loadScript(script, onLoad);
      (function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=default';

        var config =
          'MathJax.Hub.Config({' +
          'extensions: ["tex2jax.js"],' +
          'jax: ["input/TeX","output/SVG"]' +
          '});' +
          'MathJax.Hub.Startup.onload();';
        //@ts-ignore
        if (window.opera) {
          script.innerHTML = config;
        } else {
          script.text = config;
        }

        script.addEventListener('load', function() {
          if (MathJax) {
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
          }

          setMathJaxState(curr => ({ ...curr, MathJax2: MathJax }));
        });

        document.getElementsByTagName('head')[0].appendChild(script);
      })();
    }
  }, []);

  const value = { MathJax: MathJax2, registerNode: registerNode };
  return (
    <MathJaxContext.Provider value={value}>{children}</MathJaxContext.Provider>
  );
};
