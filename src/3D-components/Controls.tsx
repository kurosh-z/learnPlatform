import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ReactThreeFiber, extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

extend({ OrbitControls });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      orbitControls: ReactThreeFiber.Object3DNode<
        OrbitControls,
        typeof OrbitControls
      >;
    }
  }
}

const Controls = props => {
  const orbitRef = useRef<OrbitControls>(null);
  const { camera, gl } = useThree();
  // const camHelperRef = useRef<THREE.CameraHelper>(null);
  // const view1El = document.getElementById('view1');
  useEffect(() => {
    orbitRef.current.target.set(0, 0, 0);
  }, []);
  useFrame(() => {
    if (orbitRef && orbitRef.current) {
      orbitRef.current.update();
    }
  });
  return (
    <orbitControls ref={orbitRef} args={[camera, gl.domElement]} {...props} />
  );
};

export default Controls;
