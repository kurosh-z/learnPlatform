import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from 'react-three-fiber';
import { useSpring } from 'react-spring';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import { alpha } from '../theme/colors';
import { css as emoCSS } from '@emotion/core';
import Plane from '../3D-components/Plane';
import Coordinates from './Coordinates';
import Grids from '../3D-components/Grids';
import Vector from '../3D-components/Vector';
import Controls from '../3D-components/Controls';
import Latex from '../math-components/Latex';
import Button from '../components/Button/Button';
import ContentHeader from './ContentHeader';
import Figure from './Figure';
import NavPanel from '../shared/NavPanel';
import { useScrollPosition } from '../shared';
import Effects from './Effects';
import Text from './Text';
import lerp from 'lerp';

function Ellipse(props) {
  const geometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 10, 3, 0, 2 * Math.PI, false, 0);
    const points = curve.getPoints(50);
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);
  return (
    <line geometry={geometry} {...props}>
      <meshBasicMaterial attach='material' />
    </line>
  );
}

function ReactAtom(props) {
  return (
    <group {...props}>
      <Ellipse />
      <Ellipse rotation={[0, 0, Math.PI / 3]} />
      <Ellipse rotation={[0, 0, -Math.PI / 3]} />
      <mesh>
        <sphereBufferGeometry attach='geometry' args={[0.5, 32, 32]} />
        <meshBasicMaterial attach='material' color='red' />
      </mesh>
    </group>
  );
}

function Number({ mouse, hover }) {
  const ref = useRef();
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = lerp(
        ref.current.position.x,
        mouse.current[0] / aspect / 10,
        0.1
      );
      ref.current.rotation.x = lerp(
        ref.current.rotation.x,
        0 + mouse.current[1] / aspect / 50,
        0.1
      );
      ref.current.rotation.y = 0.8;
    }
  });
  return (
    <Suspense fallback={null}>
      <group ref={ref}>
        <Text
          size={2}
          onClick={(e) => {}}
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}>
          MATH
        </Text>
        <ReactAtom position={[35, -20, 0]} scale={[1, 0.5, 1]} />
      </group>
    </Suspense>
  );
}
const Camera = (props) => {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const { setDefaultCamera } = useThree();
  // Make the camera known to the system
  useEffect(() => {
    // gl.setScissorTest(true);
    if (camRef.current) {
      camRef.current.up.set(0, 0, 1);
      void setDefaultCamera(camRef.current);
    }
  }, []);

  const { size } = useThree();
  useEffect(() => {
    if (camRef.current) {
      camRef.current.aspect = size.width / size.height;
      camRef.current.lookAt(0, 0, 0);
    }
  }, [size]);
  useFrame(() => {
    // render the original view
    if (!camRef.current) throw new Error('camera is not defined!');
    {
      camRef.current.updateProjectionMatrix();
    }
  });
  return (
    <perspectiveCamera
      ref={camRef}
      args={[50, 2.4, 0.1, 500]}
      position={[8, 6, 5]}
      {...props}
    />
  );
};

const ExCourse: React.FC<{}> = () => {
  const theme = useTheme<Theme>();

  const [{ toggle1, toggle2 }, toggler] = useState<{
    toggle1: boolean;
    toggle2: boolean;
  }>({ toggle1: false, toggle2: false });

  const [animProps, set] = useSpring(() => ({
    transform: 'scale(1)',
    opacity: 0.7,
    fill: 'black',
  }));
  set({
    transform: toggle1 ? ' scale(1.6)' : 'scale(1)',
    opacity: toggle1 ? 1 : 1,
    fill: !toggle1 ? 'black' : 'red',
  });

  // const figRef = useRef(null);
  const [{ scrolled, navOpen }, setNavState] = useState({
    scrolled: false,
    navOpen: false,
  });
  const [{ navBackColor }, setNavBackColor] = useSpring(() => ({
    navBackColor: alpha(theme.palette.white.light, 0),
  }));

  setNavBackColor({
    navBackColor:
      scrolled && !navOpen
        ? alpha(theme.palette.white.lightest, 0.95)
        : alpha(theme.palette.white.light, 0),
  });

  useScrollPosition(
    ({ currPos }) => {
      setNavState((curr) => ({
        ...curr,
        scrolled: currPos.y < 35 ? true : false,
      }));
    },
    [],
    null,
    false,
    0
  );

  // test parts
  const [beignMath, setBeginMath] = useState(false);
  const [hovered, hover] = useState(false);
  const [down, setDown] = useState(false);
  const mouse = useRef([0, 0]);
  const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
    mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2];
    // window.setTimeout(() => {
    //   setBeginMath(true);
    // }, 7000);
  }, []);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    document.body.style.cursor = 'pointer';

    // hovered
    //   ? 'pointer'
    //   : "url('https://raw.githubusercontent.com/chenglou/react-motion/master/demos/demo8-draggable-list/cursor.png') 39 39, auto";
  }, [hovered]);

  return (
    <div
      className='course'
      style={{
        width: '80vw',
        height: '80vh',
        margin: '10vh 10vw auto 10vw',
        position: 'absolute',
      }}>
      <Canvas
        pixelRatio={Math.min(2, isMobile ? window.devicePixelRatio : 1)}
        camera={{ fov: 100, position: [0, 0, 10] }}
        onMouseMove={onMouseMove}
        onMouseUp={() => setDown(false)}
        onMouseDown={() => setDown(true)}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.Uncharted2ToneMapping;
          gl.setClearColor(new THREE.Color('#1d1d42'));
        }}>
        {/* <fog attach="fog" args={['white', 50, 190]} /> */}
        <pointLight
          distance={100}
          intensity={4}
          color={new THREE.Color('white')}
        />
        <Coordinates />
        <Controls />
        <Plane position={[0, 0, 0]} dimensions={{ width: 5, height: 4 }} />
        <ambientLight intensity={0.6} color={new THREE.Color('white')} />

        {/* <Particles count={isMobile ? 5000 : 10000} mouse={mouse} /> */}
        {/* <Sparks count={20} mouse={mouse} colors={['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue']} /> */}

        <Effects down={down} />
      </Canvas>
    </div>
  );
};
export default ExCourse;
