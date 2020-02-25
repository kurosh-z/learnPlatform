import React, { useState, useMemo, useRef, ReactNode, useEffect } from 'react';
import * as THREE from 'three';
import { ReactThreeFiber, useFrame, extend } from 'react-three-fiber';
import { useSpring, a, interpolate } from 'react-spring/three';
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';
import { PI, ORIGIN, I, J, K } from './constants';

// extend the class to use it in react!
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

// size constants:
const HRADIUS = 0.05;
const HHEIGHT = 0.1;
const SRADIUS = 0.02;

// shaft component:
interface ShaftProps {
  mag: number;
  direction: THREE.Vector3 | number[];
  onPointerDown?: (e) => void;
}
const Shaft: React.FC<ShaftProps> = ({ mag, direction, onPointerDown }) => {
  // ref to objects:

  const onUpdate = (self: THREE.Mesh) => {
    var curDir = calCurrentDirection(self);
    const _dir =
      direction instanceof THREE.Vector3
        ? direction.clone().normalize()
        : new THREE.Vector3(
            direction[0],
            direction[1],
            direction[2]
          ).normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(curDir, _dir);
    self.applyQuaternion(quaternion);
    self.updateMatrixWorld();
    self.scale.set(1, mag, 1);
  };

  return (
    <mesh onPointerDown={onPointerDown} onUpdate={onUpdate}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[
          {
            radiusTop: SRADIUS,
            radiusBottom: SRADIUS,
            height: 1,
            radialSegments: 30,
            heightSegments: 2,
            drawingMode: 'static'
          }
        ]}
      />
      <meshPhongMaterial attach='material' color={'blue'} />
    </mesh>
  );
};

function calCurrentDirection(object3d) {
  var matrix = new THREE.Matrix4();
  matrix.extractRotation(object3d.matrix);
  var curDir = new THREE.Vector3(0, 1, 0);
  curDir = matrix.multiplyVector3(curDir).normalize();
  return curDir;
}

const AShaft = a(Shaft);

// head component:
const Head = ({ position, direction, onPointerDown }) => {
  const onUpdate = (self: THREE.Mesh) => {
    var curDir = calCurrentDirection(self);
    const _dir =
      direction instanceof THREE.Vector3
        ? direction.clone().normalize()
        : new THREE.Vector3(
            direction[0],
            direction[1],
            direction[2]
          ).normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(curDir, _dir);
    self.applyQuaternion(quaternion);
    self.updateMatrixWorld();
  };

  return (
    <mesh onUpdate={onUpdate} onPointerDown={onPointerDown} position={position}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[
          {
            radiusTop: 0,
            radiusBottom: HRADIUS,
            height: HHEIGHT,
            radialSegments: 30,
            heightSegments: 1,
            drawingMode: 'static'
          }
        ]}
      />
      <meshPhongMaterial attach='material' color='blue' />
    </mesh>
  );
};

const AHead = a(Head);

// vector component:
interface VectorProps {
  vector: THREE.Vector3 | number[];
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  label?: string;
}
const Vector: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  VectorProps
> = React.forwardRef(({ vector }, ref) => {
  // calculate the magnitude and direction of the vector
  // const mag = useMemo<number>(() => calMagnitude(vector), [vector]);

  const [clicked, toggle] = useState<boolean>(false);

  const { _vector, _mag, _dir } = useMemo(() => {
    const _vector =
      vector instanceof THREE.Vector3
        ? vector.clone()
        : new THREE.Vector3(vector[0], vector[1], vector[2]);

    const _mag = _vector.length();
    const _dir = _vector.normalize().toArray();
    return { _vector, _mag, _dir };
  }, [vector]);

  const [{ newDir, mag }, set] = useSpring(() => ({
    newDir: _dir,
    mag: _mag
  }));
  const headInterp = interpolate([mag, newDir], (m: number, d: []) =>
    new THREE.Vector3()
      .fromArray(d)
      .normalize()
      .multiplyScalar(m - HHEIGHT)
      .toArray()
  );
  const onPointerDownHandler = () => {
    toggle(cl => !cl);
    set(
      clicked ? { mag: 3, newDir: [1, -1, 0.8] } : { mag: _mag, newDir: _dir }
    );
  };

  return (
    <group ref={ref}>
      <AShaft
        mag={mag.interpolate(m => m - HHEIGHT)} // we have to change the lenght a little bit to make room for head!
        direction={newDir}
        onPointerDown={onPointerDownHandler}
      />
      <AHead
        position={headInterp}
        direction={newDir}
        onPointerDown={onPointerDownHandler}
      />

      <axesHelper args={[1.5]} />
    </group>
  );
});

export default Vector;
