import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ReactThreeFiber, extend, useFrame, useThree } from 'react-three-fiber';
import CameraControls from 'camera-controls';
import { PI } from './constants';
CameraControls.install({ THREE: THREE });

extend({ CameraControls });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      cameraControls: ReactThreeFiber.Object3DNode<
        CameraControls,
        typeof CameraControls
      >;
    }
  }
}

const CamControls: React.FC<any> = () => {
  const camControlRef = useRef<CameraControls>(null);
  const camHelperRef = useRef<any>(null);
  const { camera, gl, clock, scene } = useThree();
  let lastTime = 0;
  useEffect(() => {
    // camera.up.set(0, 0, 1);
    // camera.rotateZ(PI / 2);
  });
  useFrame(() => {
    if (camControlRef.current) {
      // const delta = clock.getDelta();
      // camControlRef.current.rotate(0, Math.PI / 1000, true);
      camHelperRef.current.update();
      const elapsed = clock.getElapsedTime();
      const delta = elapsed - lastTime;

      const hasControlsUpdated = camControlRef.current.update(delta);
      if (hasControlsUpdated) gl.render(scene, camera);
    }
  });
  return (
    <>
      <cameraControls ref={camControlRef} args={[camera, gl.domElement]} />
      <cameraHelper args={[camera]} ref={camHelperRef} />
    </>
  );
};

export default CamControls;
