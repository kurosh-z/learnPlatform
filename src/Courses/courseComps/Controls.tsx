import React, { useRef } from 'react';
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

const Controls = (props: any) => {
  const orbitRef = useRef<any>(null);
  const { camera, gl } = useThree();
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
