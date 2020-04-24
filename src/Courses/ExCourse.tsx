import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { useSpring } from 'react-spring';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import { css as emoCSS } from '@emotion/core';
import Plane from '../3D-components/Plane';
import Coordinates from '../3D-components/Coordinates';
import Grids from '../3D-components/Grids';
import Controls from '../3D-components/Controls';
import Latex from '../math-components/Latex';
import { useLatexBBox } from '../math-components/LatexContext';
import Button from '../components/Button/Button';

const Camera = (props) => {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const { setDefaultCamera } = useThree();
  // Make the camera known to the system
  useEffect(() => {
    // gl.setScissorTest(true);
    if (camRef.current) {
      camRef.current.up.set(0, 0, 1);
      void setDefaultCamera(camRef.current);
    }
  }, []);

  const { size } = useThree();
  useEffect(() => {
    if (camRef.current) {
      camRef.current.aspect = size.width / size.height;
      camRef.current.lookAt(0, 0, 0);
    }
  }, [size]);
  useFrame(() => {
    // render the original view
    if (!camRef.current) throw new Error('camera is not defined!');
    {
      camRef.current.updateProjectionMatrix();
    }
  });
  return (
    <perspectiveCamera
      ref={camRef}
      args={[50, 2.4, 0.1, 500]}
      position={[8, 6, 5]}
      {...props}
    />
  );
};

const ExCourse: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  const prob01_Container = emoCSS({
    width: '100vw',
    height: '100vh',

    display: 'relative',
    '.course_svg': {
      position: 'absolute',

      zIndex: theme.zIndices.fixed,
      backgroundColor: 'rgba(154, 156, 151,.1)',
      overflow: 'hidden',
      willChange: 'transform',
      transition: 'transform .3s ease-in-out',
      // pointerEvents: 'none',
      '&:hover': {
        transformOrigin: '50% 50%',
        transition: 'transform .3s ease-in-out',
      },
    },
    '.course_canv': {
      position: 'absolute',
      backgroundColor: 'transparent',
      top: 0,
      zIndex: theme.zIndices.popover,
    },
    '.anim_btn': {
      position: 'absolute',
      bottom: 60,
      left: 20,
      zIndex: theme.zIndices.tooltip,
    },
  });

  const [{ swidth, sheight }, setSvgSize] = useState<{
    swidth: number;
    sheight: number;
  }>({ swidth: 0, sheight: 0 });
  const [latexBBox] = useLatexBBox();

  useEffect(() => {
    // console.log('effect', latexBBox.current[prob01_Container.name]);
    // const { height, width } = latexBBox.current[prob01_Container.name];
    // setSvgSize(() => ({ sheight: height + 20, swidth: width + 20 }));

    setSvgSize(() => ({
      sheight: window.innerHeight,
      swidth: window.innerWidth,
    }));
  }, [window.innerHeight, window.innerWidth]);

  const [{ toggle1, toggle2 }, toggler] = useState<{
    toggle1: boolean;
    toggle2: boolean;
  }>({ toggle1: false, toggle2: false });

  const [animProps, set] = useSpring(() => ({
    transform: 'translate(0px,0px) scale(1)',
    opacity: 0.7,
    fill: 'black',
  }));
  set({
    transform: toggle1
      ? 'translate(0px,-0px) scale(1.6)'
      : 'translate(0px,0px) scale(1)',
    opacity: toggle1 ? 1 : 1,
    fill: !toggle1 ? 'black' : 'red',
  });

  return (
    <div css={prob01_Container}>
      <svg
        className='course_svg katexfont '
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        // viewBox={`0 0 ${'100%'} ${'100%'}`}
        width={'100%'}
        height={'100%'}
        // preserveAspectRatio={'xMinYmin slice'}
      >
        <Latex
          x={10}
          y={300}
          fontFactor={1.3}
          latexId={prob01_Container.name}
          mathFormula={String.raw`
          \begin{bmatrix}
          \anim<anim1>{e^{\lambda_1}} & 0& \cdots & 0 \\
          0 & e^{\lambda_2} & \cdots & 0 \\
          \vdots & \vdots & \ddots & \vdots \\ 
          0 & 0 & \cdots & e^{\lambda_n}
          \end{bmatrix}
           `}>
          <Latex.Anim id={'anim1'} style={animProps} />
        </Latex>
      </svg>

      <Canvas
        className='course_canv'
        // onCreated={({ gl }) => {
        //   gl.toneMapping = THREE.Uncharted2ToneMapping;
        //   gl.setClearColor(new THREE.Color(theme.palette.white.dark));
        // }}
      >
        <Camera />
        <Controls />
        <Suspense fallback={null}>
          <Plane
            position={[0, 0, 0]}
            dimensions={{ width: 4, height: 4 }}
            showEdges
            edgeColor={'gray'}
          />
          <Coordinates />
          <ambientLight castShadow intensity={0.5} position={[15, 15, 20]} />
          <spotLight position={[30, -10, 50]} intensity={0.3} />
        </Suspense>
      </Canvas>
      <Button
        onClick={() => {
          toggler((curr) => ({ ...curr, toggle1: !toggle1 }));
        }}
        size={'md'}
        className={'anim_btn'}>
        animate
      </Button>
    </div>
  );
};
export default ExCourse;
