import React, { useState, useMemo, useEffect } from 'react';
import { PI, ORIGIN, I, J, K } from './constants';
import { ReactThreeFiber, useUpdate, extend } from 'react-three-fiber';
import * as THREE from 'three';
// import { scaleLinear } from 'd3-scale';
// import { compTickValues } from './compute';
// import AxesTick from './AxesTick';
// import { Object3D, BufferGeometry } from 'three';
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';
import { useSpring, a } from 'react-spring/three';

extend({ CustomCylinderBufferGeometry });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      customCylinderBufferGeometry: ReactThreeFiber.Object3DNode<
        CustomCylinderBufferGeometry,
        typeof CustomCylinderBufferGeometry
      >;
    }
  }
}

const Shaft = ({ newH, onPointerDown }) => {
  return (
    <mesh onPointerDown={onPointerDown}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[
          {
            radiusTop: 1,
            radiusBottom: 1,
            height: 1,
            radialSegments: 30,
            heightSegments: 2
          }
        ]}
        height={newH}
      />
      <meshPhongMaterial attach='material' color='blue' />
    </mesh>
  );
};

const AShaft = a(Shaft);

const Head = ({ position }) => {
  return (
    <mesh position={position}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[
          {
            radiusTop: 0,
            radiusBottom: 1,
            height: 2.5,
            radialSegments: 30,
            heightSegments: 2,
            drawingMode: 'static'
          }
        ]}
      />
      <meshPhongMaterial attach='material' color='red' />
    </mesh>
  );
};

// const HHEIGHT = 0.2; // head width
// const HDIAM = 0.1; // head diameter

interface VectorProps {
  vector?: THREE.Vector3 | number[];
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  label?: string;
}

const Vector: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  VectorProps
> = React.forwardRef((props, ref) => {
  const [clicked, toggle] = useState<boolean>(false);
  const { height } = useSpring({
    height: !clicked ? 1 : 8
  });

  return (
    <group ref={ref}>
      {/* <Shaft newH={height} onPointerDown={() => toggle(cl => !cl)} /> */}
      {/* <AShaft newH={height} onPointerDown={() => toggle(cl => !cl)} /> */}
      <Head position={[0, 3, 0]} />
    </group>
  );
});

export default Vector;
