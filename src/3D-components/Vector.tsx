import React, { useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ReactThreeFiber, extend } from 'react-three-fiber';
import { useSpring, a, interpolate } from 'react-spring/three';
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';
import { ORIGIN } from './constants';

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
const HRADIUS = 0.06;
const HHEIGHT = 0.09;
const SRADIUS = 0.02;

// shaft component:
interface ShaftProps {
  mag: number;
  direction: THREE.Vector3 | number[];
  color?: ReactThreeFiber.Color;
  onPointerDown?: (e) => void;
  hover?: (hoverd: boolean) => void;
}
const Shaft: React.FC<ShaftProps> = ({
  mag,
  direction,
  color = '#3761fa',
  onPointerDown,
  hover
}) => {
  // ref to objects:

  const onUpdate = (self: THREE.Mesh) => {
    var curDir = calCurrentDirection(self);
    const _dir =
      direction instanceof THREE.Vector3
        ? direction.clone().normalize()
        : new THREE.Vector3().fromArray(direction).normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(curDir, _dir);
    self.applyQuaternion(quaternion);
    self.updateMatrixWorld();
    self.scale.set(1, mag, 1);
  };

  return (
    <mesh
      onPointerDown={onPointerDown}
      onPointerOver={e => {
        e.stopPropagation();
        hover(true);
      }}
      onPointerOut={e => {
        // e.stopPropagation();
        hover(false);
      }}
      onUpdate={onUpdate}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[
          {
            radiusTop: SRADIUS,
            radiusBottom: SRADIUS,
            height: 1,
            radialSegments: 25,
            heightSegments: 2,
            drawingMode: 'static'
          }
        ]}
      />
      <meshBasicMaterial attach='material' color={color} />
    </mesh>
  );
};

const AShaft = a(Shaft);

// Head component:
interface HeadProps {
  position: number[];
  direction: THREE.Vector3 | number[];
  color?: ReactThreeFiber.Color;
  onPointerDown: (e) => void;
  hover: (e) => void;
}
const Head: React.FC<HeadProps> = ({
  position,
  direction,
  color = '#3761fa',
  onPointerDown,
  hover
}) => {
  const onUpdate = (self: THREE.Mesh) => {
    var curDir = calCurrentDirection(self);
    const _dir =
      direction instanceof THREE.Vector3
        ? direction.clone().normalize()
        : new THREE.Vector3().fromArray(direction).normalize();
    var quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(curDir, _dir);
    self.applyQuaternion(quaternion);
    self.updateMatrixWorld();
  };

  return (
    <mesh
      onUpdate={onUpdate}
      onPointerDown={onPointerDown}
      onPointerOver={e => {
        e.stopPropagation();
        hover(true);
      }}
      onPointerOut={e => {
        // e.stopPropagation();
        hover(false);
      }}
      position={position}>
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
      <meshBasicMaterial attach='material' color={color} />
    </mesh>
  );
};

const AHead = a(Head);

// vector component:
interface VectorProps {
  vector: THREE.Vector3 | number[];
  origin?: THREE.Vector3 | number[];
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean; // TODO: implement this props or remove them!
  label?: string;
  onPointerDown?: (e) => void;
}
const Vector: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  VectorProps
> = React.forwardRef(
  ({ vector, color, origin = ORIGIN, onPointerDown }, ref) => {
    // NOTE: just for testing
    //   const [clicked, toggle] = useState<boolean>(false);

    const { _mag, _dir } = useMemo(() => {
      const _vector =
        vector instanceof THREE.Vector3
          ? vector.clone()
          : new THREE.Vector3(vector[0], vector[1], vector[2]);

      const _mag = _vector.length();
      const _dir = _vector.normalize().toArray();
      return { _mag, _dir };
    }, [vector]);

    const [{ newDir, mag }, set] = useSpring(() => ({
      newDir: _dir,
      mag: _mag
    }));
    // calculate the proper location of head based on direction and magnitude
    const headInterp = interpolate([mag, newDir], (m: number, d: []) =>
      new THREE.Vector3()
        .fromArray(d)
        .normalize()
        .multiplyScalar(m - HHEIGHT)
        .toArray()
    );
    // NOTE: just for testing
    //   const onPointerDownHandler = (e: PointerEvent) => {
    //     e.stopPropagation();
    //     toggle(cl => !cl);
    //     set(
    //       clicked ? { mag: 3, newDir: [0.6, -1, 0.8] } : { mag: _mag, newDir: _dir }
    //     );
    //   };

    const [hovered, hover] = useState<boolean>(false);
    useEffect(() => {
      document.body.style.cursor = hovered ? 'pointer' : 'auto';
    }, [hovered]);
    return (
      <group ref={ref} position={origin}>
        <AShaft
          mag={mag.interpolate(m => m - HHEIGHT)} // we have to change the lenght a little bit to make room for head!
          direction={newDir}
          color={color}
          onPointerDown={onPointerDown}
          hover={hover}
        />
        <AHead
          position={headInterp}
          direction={newDir}
          color={color}
          onPointerDown={onPointerDown}
          hover={hover}
        />
        {/* <axesHelper args={[1.5]} /> */}
      </group>
    );
  }
);

// utility functions:
var matrix = new THREE.Matrix4();
function calCurrentDirection(object3d: THREE.Object3D) {
  matrix.extractRotation(object3d.matrix);
  var curDir = new THREE.Vector3(0, 1, 0);
  curDir.applyMatrix4(matrix).normalize();
  return curDir;
}

// exports:
export default Vector;
