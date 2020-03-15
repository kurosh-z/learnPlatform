import React, { useMemo, useRef, ReactNode } from 'react';
import * as THREE from 'three';
import {
  useLoader,
  useThree,
  useFrame,
  ReactThreeFiber
} from 'react-three-fiber';
import LineAxisHelper from './archive/LineAxisHelper';
// @ts-ignore
import url from '../../img/matcap-porcelain-white.jpg';

import Vector from './Vector';

interface PlaneProps {
  rotation?: [number, number, number];
  position: [number, number, number];
  color?: THREE.Color | string;
  edgeColor?: THREE.Color | string;
  visible?: boolean;
  showEdges?: boolean;
  showSurface?: boolean;
  dimensions?: {
    width?: number;
    height?: number;
    widthSegments?: number;
    heightSegments?: number;
  };
  onClick?: (e: PointerEvent) => void;
  onWheel?: (e: PointerEvent) => void;
  onPointerUp?: (e: PointerEvent) => void;
  onPointerDown?: (e: PointerEvent) => void;
  onPointerOver?: (e: PointerEvent) => void;
  onPointerOut?: (e: PointerEvent) => void;
  onPointerEnter?: (e: PointerEvent) => void;
  onPointerLeave?: (e: PointerEvent) => void;
  onPointerMove?: (e: PointerEvent) => void;
  onUpdate?: (self: THREE.Group) => void;
  side?: THREE.Side;
  rest?: any;
}

const Plane: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  PlaneProps
> = React.forwardRef((props, ref: React.Ref<any>) => {
  const {
    position,
    rotation,
    color = 'gray',
    edgeColor = 'gray',
    dimensions = { width: 1, height: 1, widthSegments: 1, heightSegments: 1 },
    showEdges,
    showSurface = true,
    visible = true,
    side = THREE.DoubleSide,
    onPointerDown,
    onPointerEnter,
    onPointerLeave,
    onPointerMove,
    onPointerOut,
    onPointerOver,
    onPointerUp,
    onClick,
    onUpdate,
    onWheel,
    rest
  } = props;

  if (!showEdges && !showSurface) {
    throw new Error(
      'at least one of showEdges or showSurface should be true, otherwise use visible '
    );
  }
  //material texture:
  // const texture = useLoader(THREE.TextureLoader, url);
  // plane geometry and edge geometry
  const planeRef = useRef<THREE.Mesh>(null);
  const { planeGeo, edgesGeo } = useMemo<{
    planeGeo: THREE.Geometry | THREE.BufferGeometry;
    edgesGeo?: THREE.Geometry | THREE.BufferGeometry;
  }>(() => {
    const { width, height, widthSegments, heightSegments } = dimensions;

    const plane = new THREE.PlaneBufferGeometry(
      width,
      height,
      widthSegments,
      heightSegments
    );

    const edges = showEdges ? new THREE.EdgesGeometry(plane) : null;
    return { planeGeo: plane, edgesGeo: edges };
  }, []);

  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 1);
  const onUpdateHandler = (self: THREE.Mesh) => {
    self.lookAt(plane.normal);
    // self.rotateOnWorldAxis(plane.normal.normalize(), Math.PI / 6);
    // const posVec = plane.normal.multiplyScalar(-0.5);
    // self.position.set(posVec.x, posVec.y, posVec.z);
  };

  return (
    <group>
      {showSurface && (
        <mesh
          ref={el => {
            planeRef.current = el;
          }}
          geometry={planeGeo}
          onUpdate={onUpdateHandler}
          position={[0, 0, 0]}>
          <meshPhongMaterial attach='material' side={side} color={'#ed81e1'} />
        </mesh>
      )}
      {/* <Vector vector={plane.normal} color={'black'} origin={[0, 0, 0]} /> */}

      {/* <planeHelper args={[plane, 10, 0x729ff2]} /> */}
      {/* <Edges geometry={edgesGeo} /> */}
      {showEdges && (
        <lineSegments geometry={edgesGeo}>
          <lineBasicMaterial attach='material' color={edgeColor} />
        </lineSegments>
      )}
      {/* <gridHelper args={[10, 10]} rotation={[1.57, 0, 0]} /> */}
      {/* <gridHelper args={[10, 20]} /> */}

      {/* <LineAxisHelper length={3} /> */}
    </group>
  );
});

export default Plane;

// interface EdgesProps {
//     geometry: THREE.Geometry | THREE.BufferGeometry;
//   }
//   const Edges: React.FC<EdgesProps> = ({ geometry }) => {
//     return (
//       <lineSegments>
//         <edgesGeometry attach='geometry' args={[geometry, 240]} />
//         <lineBasicMaterial attach='material' color='red' />
//       </lineSegments>
//     );
//   };
