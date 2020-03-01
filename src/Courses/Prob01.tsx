import React, { Suspense, useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useTheme } from 'emotion-theming';
import { css as emoCSS } from '@emotion/core';
import { Theme } from '../theme/types';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import Plane from './courseComps/Plane';
import Axes from './courseComps/Axes';
import Controls from './courseComps/Controls';
import './style.css';

const setScissorForElement = (canvas, elem, renderer) => {
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
  console.log(left, positiveYUpBottom, width, height);
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);

  // return the aspect
  return width / height;
};

const Camera = props => {
  const camRef = useRef(null);
  const { setDefaultCamera, gl, scene } = useThree();
  // Make the camera known to the system
  useEffect(() => {
    camRef.current.up.set(0, 0, 1);
    void setDefaultCamera(camRef.current);
  }, []);
  const { view1El, view2El, canvas } = useMemo(() => {
    const view1El = document.getElementById('view1');
    const view2El = document.getElementById('view2');
    const canvas = document.querySelector('canvas');
    return { view1El, view2El, canvas };
  }, []);

  // Update it every frame
  useFrame(() => {
    gl.setScissorTest(true);

    // render the original view
    {
      const aspect = setScissorForElement(canvas, view1El, gl);

      // adjust the camera for this aspect
      camRef.current.aspect = aspect;
      camRef.current.updateProjectionMatrix();
      // cameraHelper.update();

      // don't draw the camera helper in the original view
      // cameraHelper.visible = false;

      // render
      // gl.render(scene, camRef.current);
    }
    camRef.current.updateMatrixWorld();
  });
  return (
    <perspectiveCamera
      ref={el => {
        camRef.current = el;
      }}
      // onUpdate={self => self.updateProjectionMatrix()}
      args={[50, 2.4, 0.1, 500]}
      position={[8, -1, 5]}
      {...props}
    />
  );
};

const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();

  useEffect(() => {
    const canv = document.querySelector('canvas');
    const split = document.createElement('div');
    split.className = 'split';
    const view1El = document.createElement('div');
    view1El.id = 'view1';
    const view2El = document.createElement('div');
    view2El.id = 'view2';
    split.appendChild(view1El);
    split.appendChild(view2El);
    canv.parentNode.insertBefore(split, canv.nextSibling);
  }, []);

  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.setClearColor(new THREE.Color(theme.palette.white.dark));
        }}>
        <Suspense fallback={null}>
          <Plane
            position={[0, 0, 0]}
            dimensions={{ width: 4, height: 4 }}
            showEdges
            edgeColor={'gray'}
          />
          <Camera />
          <Controls />
          <Axes axes='zAxes' range={[-3, 3]} domain={[-10, 10]} />
          <Axes axes='yAxes' range={[-3, 3]} domain={[-10, 10]} />
          <Axes axes='xAxes' range={[-3, 3]} domain={[-10, 10]} />
          <ambientLight castShadow intensity={0.5} position={[15, 15, 20]} />
          <spotLight position={[30, -10, 50]} intensity={0.3} />
        </Suspense>
      </Canvas>
    </>
  );
};
export default Prob01;
