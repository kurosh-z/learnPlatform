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

const Cylinder = ({ newH, onPointerDown }) => {
  return (
    <mesh onPointerDown={onPointerDown}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[1, 1, 0.4, 30, 4]}
        height={newH}
      />
      <meshPhongMaterial attach='material' color='blue' opacity={0.5} />
    </mesh>
  );
};

const ACylinder = a(Cylinder);

const HHEIGHT = 0.2; // head width
const HDIAM = 0.1; // head diameter

interface VectorProps {
  vector: THREE.Vector3 | number[];
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  label?: string;
  origin?: THREE.Vector3;
  rotation?: number[];
  scaleMag?: number;
}

const Vector: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  VectorProps
> = React.forwardRef(
  (
    {
      vector,
      thickness = 0.02,
      color = 'black',
      origin = ORIGIN,
      rotation,
      scaleMag = 1
    },
    ref
  ) => {
    const [clicked, toggle] = useState<boolean>(false);
    const { height } = useSpring({
      height: !clicked ? 1 : 8
    });

    return (
      <group ref={ref}>
        // shaft:
        {/* <ACylinder newH={height} onPointerDown={() => toggle(cl => !cl)} /> */}
        {/* <lineSegments geometry={edges}>
          <lineBasicMaterial attach='material' color={'black'} />
        </lineSegments> */}
        <mesh onPointerDown={() => toggle(cl => !cl)}>
          <a.customCylinderBufferGeometry
            args={[1, 1, 1, 30, 2]}
            attach='geometry'
            height={height}
          />
          <meshBasicMaterial attach='material' color='blue' />
        </mesh>
        <axesHelper />
        // head:
      </group>
    );
  }
);

export default Vector;
