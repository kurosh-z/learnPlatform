import React, { Suspense } from 'react';
import * as THREE from 'three';
import { useTheme } from 'emotion-theming';
import { css as emoCSS } from '@emotion/core';
import { Theme } from '../theme/types';
import { Canvas, useFrame, useThree } from 'react-three-fiber';
import Controls from './courseComps/Controls';
import Plane from './courseComps/Plane';
import Vector from './courseComps/Vector';
import Axes from './courseComps/Axes';
import Meshline from './courseComps/Meshline';

// const Plane = props => {
//   const { planeGeo, edgesGeo } = useMemo<{
//     planeGeo: THREE.Geometry | THREE.BufferGeometry;
//     edgesGeo: THREE.Geometry | THREE.BufferGeometry;
//   }>(() => {
//     const plane = new THREE.PlaneGeometry(5, 7, 10);
//     const edges = new THREE.EdgesGeometry(plane);
//     return { planeGeo: plane, edgesGeo: edges };
//   }, []);
//   return (
//     <group {...props}>
//       <mesh geometry={planeGeo}>
//         <meshBasicMaterial
//           attach='material'
//           side={THREE.DoubleSide}
//           color='gray'
//         />
//       </mesh>

//       {/* <Edges geometry={edgesGeo} /> */}
//       <lineSegments geometry={edgesGeo}>
//         <lineBasicMaterial attach='material' color='red' />
//       </lineSegments>
//     </group>
//   );
// };

const Box: React.FC<any> = props => {
  return (
    <mesh>
      <boxBufferGeometry attach='geometry' />
      <meshBasicMaterial attach='material' color='blue' />
    </mesh>
  );
};

const Prob01: React.FC<{}> = () => {
  const theme = useTheme<Theme>();

  const prob01__container = emoCSS({
    width: '100vw',
    height: '100vh'
  });
  return (
    <div className='prob01__container' css={prob01__container}>
      <Canvas
        // invalidateFrameloop
        // orthographic
        pixelRatio={window.devicePixelRatio}
        camera={{
          fov: 1000,
          position: [6, -4, 8],
          near: 0.01,
          far: 100
        }}
        style={{ width: '100%', height: '100%' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.setClearColor(new THREE.Color(theme.palette.white.dark));
        }}>
        <Suspense fallback={null}>
          <Controls />
          {/* <Plane
            position={[0, 0, 0]}
            dimensions={{ width: 3, height: 4 }}
            onPointerDown={e => console.log('down')}
            showEdges
            edgeColor={'gray'}
          /> */}
          {/* <Vector vector={[1.5, 0, 0]} /> */}
          <Axes axes='zAxes' range={[-3, 3]} domain={[-10, 10]} />
          <Axes axes='yAxes' range={[-3, 3]} domain={[-10, 10]} />
          <Axes axes='xAxes' range={[-3, 3]} domain={[-10, 10]} />

          {/* <axesHelper args={[3]} /> */}

          <ambientLight castShadow intensity={0.5} position={[15, 15, 20]} />
          <spotLight position={[30, -10, 50]} intensity={0.3} />
        </Suspense>
      </Canvas>
    </div>
  );
};
export default Prob01;
