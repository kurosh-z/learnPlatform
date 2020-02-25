import React, { useState, useMemo, useRef, ReactNode, useEffect } from 'react';
import { PI, ORIGIN, I, J, K } from './constants';
import { ReactThreeFiber, useFrame, extend } from 'react-three-fiber';
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

// size constants:
const HRADIUS = 0.05;
const HHEIGHT = 0.1;
const SRADIUS = 0.02;

// shaft component:
interface ShaftProps {
  mag: number;
  direction: THREE.Vector3 | number[];
  onPointerDown?: (e: PointerEvent) => void;
}
const Shaft: React.FC<ShaftProps> = ({ mag, direction, onPointerDown }) => {
  // shaft material
  const shaftMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({ color: new THREE.Color('blue') });
  }, []);
  // shaft geometry
  const shaftGeometry = useRef<CustomCylinderBufferGeometry>(
    new CustomCylinderBufferGeometry({
      radiusTop: SRADIUS,
      radiusBottom: SRADIUS,
      height: mag - HHEIGHT, // we draw it shorter in order to let room for the Head!
      radialSegments: 30,
      heightSegments: 2
    })
  );

  // const shaftGeometry = useRef<THREE.CylinderBufferGeometry>(
  //   new THREE.CylinderBufferGeometry(SRADIUS, SRADIUS, mag - HHEIGHT, 30, 2)
  // );
  //shaft mesh
  const { shaftObj, shaftMesh } = useMemo(() => {
    const shaftMesh = new THREE.Mesh(shaftGeometry.current, shaftMaterial);
    const helper = new THREE.AxesHelper(0.5);
    shaftMesh.add(helper);

    const shaftObj = new THREE.Object3D().add(shaftMesh);

    return { shaftObj, shaftMesh };
  }, []);

  const onUpdate = self => {
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
    // const { rotAngle, rotAxes } = calRotation(curDir, direction);
    // console.log('angle, axes', rotAngle, rotAxes);
    // self.rotateOnWorldAxis(rotAxes, rotAngle);

    shaftMesh.scale.set(1, mag, 1);
    // shaftGeometry.current.height = mag - HHEIGHT;
  };

  const onPointerDownHandler = e => {
    onPointerDown(e);
    var curDir = calCurrentDirection(shaftObj);
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
    shaftObj.applyQuaternion(quaternion);
    shaftObj.updateMatrixWorld();
    // const { rotAngle, rotAxes } = calRotation(curDir, direction);
    // console.log('angle, axes', rotAngle, rotAxes);
    // self.rotateOnWorldAxis(rotAxes, rotAngle);

    shaftMesh.scale.set(1, mag, 1);
    // shaftGeometry.current.height = mag - HHEIGHT;
  };

  return (
    <>
      <primitive
        onUpdate={onUpdate}
        object={shaftObj}
        onPointerDown={onPointerDownHandler}
      />
      <axesHelper args={[2]} />
      {/* // <mesh>
    //   <customCylinderBufferGeometry
    //     attach='geometry'
    //     args={[
    //       {
    //         radiusTop: SRADIUS,
    //         radiusBottom: SRADIUS,
    //         height: mag - HHEIGHT, // we draw it shorter in order to let room for the Head!
    //         radialSegments: 30,
    //         heightSegments: 2
    //       }
    //     ]}
    //     height={newH - HHEIGHT}
    //   />
    //   <meshPhongMaterial attach='material' color='blue' />
    // </mesh> */}
    </>
  );
};

const AShaft = a(Shaft);

// Head component
const Head = ({ position }) => {
  return (
    <mesh position={position}>
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
  // const [newDir, setNewDir] = useState<number[]>([0, 1, 0]);

  // const _vector =
  //   vector instanceof THREE.Vector3
  //     ? vector.clone()
  //     : new THREE.Vector3(vector[0], vector[1], vector[2]);

  const [{ newDir, mag }, set] = useSpring(() => ({
    newDir: [0, 1, 0],
    mag: 1
  }));

  const vecRef = useRef(null);

  const onPointerDownHandler = () => {
    // console.log('clicked');
    toggle(cl => !cl);
    set(
      clicked ? { mag: 2, newDir: [1, 0, 0] } : { mag: 1, newDir: [0, 1, 0] }
    );

    // console.log('clicked', clicked);
    //   set({ newDir: [0, 0, 1] });
  };

  return (
    <>
      <group
        ref={el => {
          vecRef.current = el;
        }}>
        <AShaft
          mag={mag}
          direction={newDir}
          onPointerDown={onPointerDownHandler}
        />

        {/* <Head position={[0, mag - HHEIGHT, 0]} /> */}
      </group>
      {/* <axesHelper /> */}
    </>
  );
});

// calculates the angle and axes of rotation required for vec0 to be in direction of dir
type Vec = THREE.Vector3 | number[];
function calRotation(
  vec: Vec,
  dir: Vec
): { rotAngle: number; rotAxes: THREE.Vector3 } {
  const _vec =
    vec instanceof THREE.Vector3
      ? vec.clone()
      : new THREE.Vector3(vec[0], vec[1], vec[2]);
  const _dir =
    dir instanceof THREE.Vector3
      ? dir.clone().normalize()
      : new THREE.Vector3(dir[0], dir[1], dir[2]).normalize();

  const rotAngle = _vec.angleTo(_dir);
  // calculate the axes of rotation
  const rotAxes = _vec.normalize().cross(_dir.normalize());
  console.log('rot');

  return { rotAngle, rotAxes };
}

function calMagnitude(vec: Vec): number {
  const _vec =
    vec instanceof THREE.Vector3
      ? vec
      : new THREE.Vector3(vec[0], vec[1], vec[2]);
  const mag = _vec.length();

  return mag;
}

function calCurrentDirection(object3d) {
  var matrix = new THREE.Matrix4();
  matrix.extractRotation(object3d.matrix);
  var curDir = new THREE.Vector3(0, 1, 0);
  curDir = matrix.multiplyVector3(curDir).normalize();
  return curDir;
}

export default Vector;
// onUpdate={self => self.rotateOnWorldAxis(rotAxes, rotAngle)}
