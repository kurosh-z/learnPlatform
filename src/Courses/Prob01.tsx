import React, { useState, useEffect, useRef } from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import Calibrator from './math-components/Calibrator';
import Latex from './math-components/Latex';
import { useSpring } from 'react-spring';
import Button from '../components/Button/Button';
// import MathJaxNode from '../mathjax/MathJaxNode';

// const tex =
//   'f(x) = \\int_{-\\infty}^\\infty\\hat{f}(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi';


const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();

  const prob01 = emoCss({
    backgroundColor: theme.palette.gray.base,
    fill: theme.palette.white.dark,
    width: '600vw',
    height: '100vh',
    overflow: 'visible',
    svg: {
      position: 'absolute',
      top: 49,
    },
  });
  const mathsvg = emoCss({
    background: 'transparent',
  });

  const [{toggle1, toggle2}, toggler] = useState<{toggle1:boolean, toggle2:boolean}>({toggle1:false, toggle2:false});
  const ref1 =useRef<any>(null);
  const ref2 =useRef<any>(null);
  useEffect(()=>{
    if(ref1.current){
      const gEl: SVGGElement= ref1.current
      console.log(gEl.getBBox())
      
    }
  },[])
  const [animProps, set] = useSpring(() => ({
    transform: 'translate(0px,0px) scale(1)',
    opacity: 1,
    fill: 'white',
  }));
  set({
    transform: toggle1 ? 'translate(0px,-0px) scale(1.1)' : 'translate(0px,0px) scale(1)',
    opacity: toggle1 ? 1 : 1,
    fill: '#87D37C',
  });
  const [animProps2, set2] = useSpring(() => ({
    transform: 'translate(0px,0px) scale(1)',
    fill: 'red',
    opacity:1,
   
  }));
  set2({
    transform: toggle2 ? 'translate(100px,-200px) scale(1)' : 'translate(0px,0px) scale(1)',
    opacity: toggle2 ? 0.6 : 1,
    fill: toggle2 ? '#87D37C' : 'red',
    
  });
  return (
    <div css={prob01}>
      {/* <Calibrator /> */}
      <Button
        onClick={() => {
          toggler((curr)=>({...curr,toggle1:!toggle1}));
        }}
        
        size={'md'}>
        animate
      </Button>
      <svg
        css={mathsvg}
        className='katexfont'
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        width={'1000'}
        height={'1000'}>
        <Latex
          x={100}
          y={300}
          mathFormula=
        
          {String.raw`A\times\begin{bmatrix}
          a & 2 \pi & c\\
          1 & 2\times \anim<Aintegral>{\int_{-\infty}^{c_2}f(\xi) \anim<anim2>{d\xi} } & 3\\
          b_0 & b_2 & b_3
          \end{bmatrix}
         `}>
          <Latex.Anim id={'Aintegral'} style={animProps} ref={ref1}  />
          <Latex.Anim id={'anim2'} style={animProps2} ref={ref2}  />
        </Latex>
      </svg>

      {/*  c^{\begin{bmatrix}
          a & b  & c\\
          1 & 2 & 3\\
          b_0 & b_2 & b_3
          \end{bmatrix}}*/}

      {/* <MathJaxNode
        formula={tex}
        inline
        style={{ position: 'absolute', top: 400, left: 200 }}
      /> */}
    </div>
  );
};

export default Prob01;
