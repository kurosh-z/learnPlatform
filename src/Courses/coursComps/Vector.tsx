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
    const geometry = useUpdate((geometry: CustomCylinderBufferGeometry) => {
      geometry.updateHeight(10);
      return geometry;
    }, []);

    return (
      <group ref={ref} rotation={rotation}>
        // shaft:
        <mesh>
          <customCylinderBufferGeometry
            attach='geometry'
            args={[1, 1, 3, 30, 8]}
            ref={geometry}
          />
          <meshPhongMaterial attach='material' color={'#385ae0'} />
        </mesh>
        {/* <lineSegments geometry={edges}>
          <lineBasicMaterial attach='material' color={'black'} />
        </lineSegments> */}
        <axesHelper />
        // head:
      </group>
    );
  }
);

export default Vector;
