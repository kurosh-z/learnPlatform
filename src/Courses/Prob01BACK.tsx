import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from 'emotion-theming';
import { css as emoCSS } from '@emotion/core';
import { Theme } from '../theme/types';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { format as d3format } from 'd3-format';
import Plane from './course-components/Plane';
import Axes from './course-components/Axes';
import Grids from './course-components/Grids';
import Controls from './course-components/Controls';
import './style.css';

const setScissorForElement = (
  canvas: HTMLCanvasElement,
  elem: HTMLElement,
  renderer: THREE.WebGLRenderer
) => {
  const canvasRect = canvas.getBoundingClientRect();

  const elemRect = elem.getBoundingClientRect();
  // compute a canvas relative rectangle
  const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
  const left = Math.max(0, elemRect.left - canvasRect.left);
  const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
  const top = Math.max(0, elemRect.top - canvasRect.top);

  const width = Math.min(canvasRect.width, right - left);
  const height = Math.min(canvasRect.height, bottom - top);

  // setup the scissor to only render to that part of the canvas
  const positiveYUpBottom = canvasRect.height - bottom;

  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // return the aspect
  return width / height;
};

const Camera = props => {
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
  // const { view1El, view2El, canvas } = useMemo(() => {
  //   const view1El = document.getElementById('view1');
  //   const view2El = document.getElementById('view2');
  //   const canvas = document.querySelector('canvas');
  //   return { view1El, view2El, canvas };
  // }, []);
  // const aspect = setScissorForElement(canvas, view1El, gl);
  // console.log(aspect);
  // Update it every frame
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
      // const aspect = setScissorForElement(canvas, view1El, gl);
      // adjust the camera for this aspect
      // camRef.current.aspect = aspect;

      camRef.current.updateProjectionMatrix();
    }
    // camRef.current.updateMatrixWorld();
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

const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();
  const prob01_Container = emoCSS({
    width: '100vw',
    height: '100vh',
    background: theme.palette.aubergine.base
  });
  // useEffect(() => {
  //   const canv = document.querySelector('canvas');
  //   const split = document.createElement('div');
  //   split.className = 'split';
  //   const view1El = document.createElement('div');
  //   view1El.id = 'view1';
  //   const view2El = document.createElement('div');
  //   view2El.id = 'view2';
  //   split.appendChild(view1El);
  //   split.appendChild(view2El);
  //   canv.parentNode.insertBefore(split, canv.nextSibling);
  // }, []);

  const n = 10;
  const range = [-3, 3];
  const domain = [-10, 10];
  const { tickValues, scale, format } = useMemo(() => {
    const scale = scaleLinear()
      .domain(domain)
      .range(range);

    const format = d3format('.0f');
    const tickValues = scale.ticks(n);

    return { scale, tickValues, format };
  }, []);

  return (
    <div css={prob01_Container}>
      <Canvas
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.setClearColor(new THREE.Color(theme.palette.white.dark));
        }}>
        <Camera />
        <Controls />
        <Suspense fallback={null}>
          <Plane
            position={[0, 0, 0]}
            dimensions={{ width: 4, height: 4 }}
            showEdges
            edgeColor={'gray'}
          />

          {/* <Vector vector={[1, 1, 1]} /> */}
          <Axes
            axes='zAxes'
            scale={scale}
            tickValues={tickValues}
            format={format}
          />
          <Axes
            axes='yAxes'
            scale={scale}
            tickValues={tickValues}
            format={format}
          />
          <Axes
            axes='xAxes'
            scale={scale}
            tickValues={tickValues}
            format={format}
          />
          <Grids scale={scale} />
          <ambientLight castShadow intensity={0.5} position={[15, 15, 20]} />
          <spotLight position={[30, -10, 50]} intensity={0.3} />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default Prob01;
