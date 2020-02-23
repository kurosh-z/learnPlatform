import React, { useState, useMemo, useRef, ReactNode, useEffect } from 'react';
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

// size constants:
const HRADIUS = 0.05;
const HHEIGHT = 0.1;
const SRADIUS = 0.02;

// shaft component:
const Shaft = ({ mag, newH, rotAngle, rotAxes }) => {
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

  useEffect(() => {
    if (shaftGeometry.current) shaftGeometry.current.height = newH;
  }, [newH]);
  //shaft object
  const shaftMesh = useMemo(() => {
    const shaftMesh = new THREE.Mesh(shaftGeometry.current, shaftMaterial);
    shaftMesh.rotateOnWorldAxis(rotAxes, rotAngle);

    return shaftMesh;
  }, []);

  return (
    <primitive object={shaftMesh} />
    // <mesh>
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
    // </mesh>
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
  const { mag, rotAngle, rotAxes } = useMemo(() => {
    const _vector =
      vector instanceof THREE.Vector3
        ? vector
        : new THREE.Vector3(vector[0], vector[1], vector[2]);
    const mag = _vector.length();
    // calculate the angle between cylinder geometry's default direction (J) with the actual vector
    const rotAngle = J.angleTo(_vector);
    // calculate the axes of rotation
    const rotAxes = J.cross(_vector.clone().normalize());

    return { mag, rotAngle, rotAxes };
  }, []);

  const [clicked, toggle] = useState<boolean>(false);
  const [{ newMag, headPos }, set] = useSpring(() => ({
    newMag: mag,
    headPos: [0, mag - HHEIGHT, 0]
    // config: { mass: 3, friction: 40, tension: 800 }
  }));

  const vecRef = useRef(null);

  const onPointerDownHandler = () => {
    toggle(cl => !cl);
    set(
      clicked
        ? { newMag: 3, headPos: [0, 3 - HHEIGHT, 0] }
        : { newMag: mag, headPos: [0, mag - HHEIGHT, 0] }
    );
  };

  return (
    <>
      <group
        onPointerDown={onPointerDownHandler}
        ref={el => {
          vecRef.current = el;
        }}>
        <AShaft newH={newMag} mag={mag} rotAngle={rotAngle} rotAxes={rotAxes} />

        {/* <Head position={[0, mag - HHEIGHT, 0]} /> */}
      </group>
      <axesHelper />
    </>
  );
});

export default Vector;
// onUpdate={self => self.rotateOnWorldAxis(rotAxes, rotAngle)}
