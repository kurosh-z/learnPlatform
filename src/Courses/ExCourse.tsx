import React, {
  Suspense,
  useRef,
  useState,
  useEffect,
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

function Number({ mouse, hover }) {
  const ref = useRef();
  const { size, viewport } = useThree();
  const aspect = size.width / viewport.width;
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = lerp(
        ref.current.position.x,
        mouse.current[0] / 10,
        0.1
      );
      ref.current.rotation.x = lerp(
        ref.current.rotation.x,
        0 + mouse.current[1] / 50,
        0.1
      );
      ref.current.rotation.y = 0.8;
    }
  });
  return (
    <Suspense fallback={null}>
      <group ref={ref}>
        <Text
          size={10}
          onClick={(e) =>
            window.open(
              'https://github.com/react-spring/react-three-fiber/blob/master/whatsnew.md',
              '_blank'
            )
          }
          onPointerOver={() => hover(true)}
          onPointerOut={() => hover(false)}>
          4sdfjkd
        </Text>
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

  const coursepage = emoCSS({
    '*': { quotes: `'“''”' "‘" "’"` },
    'q::before': { content: 'open-quote' },
    'q::after': { content: 'close-quote' },
    '.course__header': {
      width: '100%',
      height: '80px',
      backgroundColor: theme.palette.aubergine.base,
    },
    '.coursepage': {},
    '.main': {
      // backgroundColor: 'rgba(220, 224, 221, .1)',
      maxWidth: '1000px',
      margin: '80px auto auto auto',
      display: 'block',
    },
    '.mathcontent': {
      '*': { fontFamily: 'KaTeX_SansSerif' },
    },
    '.introduction': {
      '*': { fontFamily: 'LatinModernRoman10Regular' },
      textAlign: 'justify',
      fontSize: theme.typography.h6.fontSize,
      margin: '2rem 1rem 1rem 1rem ',
    },
    '.italic': {
      fontStyle: 'italic',
    },
    '.bold': {
      fontWeight: theme.typography.fontWeights.bold,
    },
    '.katex_math': {
      fontFamily: 'KaTex_Math',
      fontStyle: 'italic',
    },
    '.math_interactive': {
      width: '100%',
      height: '100vh',
      margin: '3rem auto auto auto',
      backgroundColor: alpha(theme.palette.gray.base, 0.8),
      // position: 'absolute',
      left: '5%',
    },
    '.mathbox__title': {
      fontFamily: 'KaTeX_SansSerif',
      fontSize: theme.typography.fontSizes[4],
      fontWeight: theme.typography.fontWeights.bold,
      margin: '3rem auto auto auto',
    },
    '.btn__wrapper': {
      display: 'inline-block',
      marginLeft: '1rem',
      marginBottom: '2rem',
    },
    '.course_canv': {
      backgroundColor: 'transparent',
    },
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
    window.setTimeout(() => {
      setBeginMath(true);
    }, 7000);
  }, []);
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    document.body.style.cursor = hovered
      ? 'pointer'
      : "url('https://raw.githubusercontent.com/chenglou/react-motion/master/demos/demo8-draggable-list/cursor.png') 39 39, auto";
  }, [hovered]);

  return (
    <div className='coursepage' css={coursepage}>
      <NavPanel
        background_color={navBackColor}
        textColor_closed={theme.palette.aubergine.base}
        textColor_opened={theme.palette.white.base}
        conceptVisibility={false}
        navCB={() => {
          setNavState((curr) => ({ ...curr, navOpen: !navOpen }));
        }}
      />
      <main className='main mathcontent'>
        <ContentHeader
          title_number='1.1'
          title='Introduction to full state feedback control'>
          <ContentHeader.Objective>
            Motivating full state feedback
          </ContentHeader.Objective>
          <ContentHeader.Objective>
            Understanding Similiarity Transfromation in
            <Latex inline math_formula={String.raw`R^n`} font_size={1.3} />
          </ContentHeader.Objective>
        </ContentHeader>
        <section className='introduction'>
          <p>
            The goal of the controller is to drive the outputs to some desired
            value. A way you might be familliar with this to compare the output
            with imput signal to get the error signal.Then you can develope a
            controller that uses that error to generate the signals into the
            plant with the goal of driving error to zero. This is the structure
            of the control system that you would see if you were let say
            devloping a PID contorller.
          </p>
          <Figure
            data_src='https://drive.google.com/uc?id=1m9R3EKaXFZ_m5M6AgetWAHn4gABnVu-6'
            caption_number='1.1'
            caption_text='Block diagram of a feedback control system'
            show
          />
          <p>
            The idea behind the <q> Full State Feedback </q> is to feedback the
            states of the system rather than the output{' '}
            <span className='katex_math'>y</span>.
          </p>
          <Figure
            data_src='https://drive.google.com/uc?id=1fwl5baRsG0B3peYucU06jrI3JQ3Y07S2'
            caption_number='1.2'
            caption_text='Block diagram of full feedback state Controller'
            show
          />
        </section>
        <h1 className='mathbox__title'>
          Example of Latex Rendering with Animation
        </h1>
        <div className='btn__wrapper'>
          <Button
            onClick={() => {
              toggler((curr) => ({ ...curr, toggle1: !toggle1 }));
            }}
            size={'md'}
            className={'anim_btn'}>
            animate
          </Button>
        </div>
        <div style={{ margin: '.5rem auto auto 3rem' }}>
          <Latex
            font_size={2}
            math_formula={String.raw`
          \begin{bmatrix}
         e^{\lambda_1} & 0& \cdots & 0 \\
          0 & \anim<test>{e^{\lambda_2}} & \cdots & 0 \\
          \vdots & \vdots & \ddots & \vdots \\ 
          0 & \int_0^5 f(\xi) & \cdots & e^{\lambda_n}
          \end{bmatrix} `}>
            <Latex.Anim id='test' style={animProps} />
          </Latex>
        </div>
        <h1 className='mathbox__title'>Example of Interactive Math Box</h1>
        <div className='math_interactive'>
          {!beignMath && (
            <Canvas
              camera={{ fov: 60, position: [0, 0, 10] }}
              className='course_canv'
              onMouseMove={onMouseMove}
              onMouseUp={() => {
                setDown(false);
              }}
              onMouseDown={() => setDown(true)}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.Uncharted2ToneMapping;
                gl.setClearColor(new THREE.Color('#020207'));
              }}>
              {/* <Camera /> */}

              <Controls />
              {/* <Number mouse={mouse} hover={hover} /> */}
              <Suspense fallback={null}>
                {down && (
                  <>
                    <Plane
                      position={[0, 0, 0]}
                      dimensions={{ width: 5.5, height: 5.5 }}
                      showEdges
                      edgeColor={'gray'}
                    />
                    <Coordinates />
                  </>
                )}

                <pointLight distance={100} sintensity={4} color='white' />
                <ambientLight
                  castShadow
                  intensity={1.5}
                  position={[15, 15, 20]}
                />
                <spotLight position={[30, -10, 50]} intensity={0.3} />
                <Effects down={hovered} />
              </Suspense>
            </Canvas>
          )}

          {beignMath && (
            <Canvas
              className='course_canv'
              onMouseMove={onMouseMove}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.Uncharted2ToneMapping;
                gl.setClearColor(new THREE.Color('white'));
              }}>
              <Camera />

              <Controls />
              {/* <Number mouse={mouse} hover={hover} /> */}
              <Suspense fallback={null}>
                <Plane
                  position={[0, 0, 0]}
                  dimensions={{ width: 5.5, height: 5.5 }}
                  showEdges
                  edgeColor={'gray'}
                />
                <Coordinates />

                {/* <pointLight distance={100} sintensity={4} color='white' /> */}
                <ambientLight
                  castShadow
                  intensity={0.5}
                  position={[15, 15, 20]}
                />
                <spotLight position={[30, -10, 50]} intensity={0.3} />
                {/* <Effects down={hovered} /> */}
              </Suspense>
            </Canvas>
          )}
        </div>
      </main>
    </div>
  );
};
export default ExCourse;

{
  /* <svg
        className='course_svg katexfont '
        xmlns='http://www.w3.org/2000/svg'
        xmlnsXlink='http://www.w3.org/1999/xlink'
        // viewBox={`0 0 ${'100%'} ${'100%'}`}
        width={'500'}
        height={'700'}
        // preserveAspectRatio={'xMinYmin slice'}
      >
        <Latex
          x={100}
          y={200}
          font_size={1.3}
          latexId={prob01_Container.name}
          math_formula={String.raw`
         
       a_2^2
           `}>
          <Latex.Anim id={'anim1'} style={animProps} />
        </Latex>
      </svg> */
}

{
  /* <Canvas
          className='course_canv'
          // onCreated={({ gl }) => {
          //   gl.toneMapping = THREE.Uncharted2ToneMapping;
          //   gl.setClearColor(new THREE.Color(theme.palette.white.dark));
          // }}
        >
          <Camera />
          <Controls />
          <Suspense fallback={null}>
            <Plane
              position={[0, 0, 0]}
              dimensions={{ width: 4, height: 4 }}
              showEdges
              edgeColor={'gray'}
            />
            <Coordinates />
            <ambientLight castShadow intensity={0.5} position={[15, 15, 20]} />
            <spotLight position={[30, -10, 50]} intensity={0.3} />
          </Suspense>
        </Canvas> */
}
{
  /* <Button
          onClick={() => {
            toggler((curr) => ({ ...curr, toggle1: !toggle1 }));
          }}
          size={'md'}
          className={'anim_btn'}>
          animate
        </Button> */
}
