import React from 'react'
import './course.css'
// import * as THREE from 'three';
// import { Canvas } from 'react-three-fiber';
// import { useSpring } from 'react-spring';
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'
// import { alpha } from '../theme/colors';
// import { css as emoCSS } from '@emotion/core';
// import Plane from '../3D-components/Plane';
// import Coordinates from './Coordinates';
// import Grids from '../3D-components/Grids';
// import Vector from '../3D-components/Vector';
// import Controls from '../3D-components/Controls';
// import Latex from '../math-components/Latex'
// import Button from '../components/Button/Button';
// import ContentHeader from './ContentHeader';
// import Figure from './Figure';
import NavPanel from '../shared/NavPanel'
// import { useScrollPosition } from '../shared';

// import Effects from './Effects';
// import { useUiState, useUiDispatch } from '../app_states/stateContext';

// type State = {
//   scrolled: boolean;
//   navOpen: boolean;
//   currScrollPos: number;
//   prevScrollPos: number;
//   canvasHoverd: boolean;
//   canvasDown: boolean;
//   showCanvas: boolean;
// };
// const initialState: State = {
//   scrolled: false,
//   navOpen: false,
//   currScrollPos: 0,
//   prevScrollPos: 0,
//   canvasDown: false,
//   canvasHoverd: false,
//   showCanvas: false,
// };

// function useNavBackground({ scrolled, navOpen }) {
//   const theme = useTheme<Theme>();
//   const [{ navBackColor }, setNavBackColor] = useSpring(() => ({
//     navBackColor: alpha(theme.palette.white.light, 0),
//   }));

//   setNavBackColor({
//     navBackColor: scrolled
//       ? alpha(theme.palette.blue.lightest, 0.95)
//       : alpha(theme.palette.white.light, 0),
//   });

//   return navBackColor;
// }

const ExCourse: React.FC<{}> = () => {
    const theme = useTheme<Theme>()
    // const uiState = useUiState();
    // const uiDispatch = useUiDispatch();

    // const mouse = useRef([0, 0]);
    // const onMouseMove = useCallback(({ clientX: x, clientY: y }) => {
    //   mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2];
    // }, []);
    // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <>
            <NavPanel
                background_color={theme.palette.white.light}
                textColor_closed={theme.palette.aubergine.dark}
                textColor_opened={theme.palette.white.base}
            />
            <div
                style={{
                    backgroundColor: 'cyan',
                    height: '200vh',
                    width: '100vw',
                }}
            />
        </>
    )
}
export default ExCourse
