import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useMathJaxContext } from './ MathJaxContext';
import process from './process';

type MathJaxNodeProps = {
  formula: string;
  inline?: boolean;
  onRender?: () => {};
  style?: React.CSSProperties;
};
const MathJaxNode: React.FC<MathJaxNodeProps> = ({
  formula,
  inline = false,
  onRender = () => {},
  style,
  ...rest
}) => {
  const { MathJax, registerNode } = useMathJaxContext();
  const [script, setScript] = useState<HTMLScriptElement>(
    document.createElement('script')
  );

  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerNode();
    if (!MathJax) {
      console.log('MathJax is not defined!');
    } else {
      typeset(false);
    }
    return () => clear();
  }, [MathJax]);
  const setScriptText: (text: string) => void = text => {
    if (!script.type) {
      setScript(() => document.createElement('script'));
      script.type = `math/tex; ${inline ? '' : 'mode=display'}`;
      if (container.current) container.current.appendChild(script);
    }

    if ('text' in script) {
      // IE8, etc
      script.text = text;
    }
    if ('textContent' in script) {
      script.textContent = text;
    }
  };
  const clear = () => {
    if (script && MathJax) {
      const jax = MathJax.Hub.getJaxFor(script);
      if (jax) {
        jax.Remove();
      }
    }
  };
  const typeset: (forceUpdate: boolean) => void = forceUpdate => {
    if (!MathJax) {
      return;
    }

    if (forceUpdate) {
      clear();
    }

    if (!forceUpdate && script) {
      MathJax.Hub.Queue(() => {
        const jax = MathJax.Hub.getJaxFor(script);

        if (jax) jax.Text(formula, onRender);
        else {
          setScriptText(formula);
          process(MathJax, script, onRender);
        }
      });
    } else {
      setScriptText(formula);
      process(MathJax, script, onRender);
    }
  };

  return (
    <>
      {inline && <span ref={container} style={style} {...rest} />}
      {!inline && <div ref={container} style={style} {...rest} />}
    </>
  );
};

export default MathJaxNode;
