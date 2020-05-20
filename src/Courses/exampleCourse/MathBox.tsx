import React, { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useImmerReducer } from 'use-immer'
import { a } from 'react-spring'
import { Grids, Points as NPoints, ALine, Meshline } from '../../3D-components'
import {
    mathboxReducer,
    initMathBoxState,
    TOGGLE_PAUSE,
} from './mathBoxReducer'
import { Canvas, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls, PerspectiveCamera } from 'drei'
import { css as emoCss } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../../theme/types'
import { alpha } from '../../theme/colors'
import PlayButton from '../../components/Button/PlayButtton'
import Latex from '../../math-components/Latex'
import Coordinates from '../courseComps/Coordinates'
import LinearCombination from '../courseComps/LinearCombination'
import { useScaleLinear } from '../courseComps/useScaleLinear'
import { useMathboxAnim } from './useMathboxAnim'

const AplayButton = a(PlayButton)
const AlinearCombination = a(LinearCombination)
const Points = React.memo(NPoints)

const TestCamera: React.FC = () => {
    const camRef = useRef(null)

    const { scene } = useThree()
    useEffect(() => {
        if (camRef.current) {
            const cameraHelper = new THREE.CameraHelper(camRef.current)
            scene.add(cameraHelper)
        }
    }, [])
    useFrame(() => {
        camRef.current.lookAt(0, 0, 0)
    })
    return (
        <>
            <PerspectiveCamera
                ref={camRef}
                makeDefault={false}
                up={[0, 1, 0]}
                fov={60}
                position={[0, 0, -5]}
            ></PerspectiveCamera>
        </>
    )
}

const Camera: React.FC<{ children?: React.ReactChildren }> = ({ children }) => {
    const cam = useRef<THREE.PerspectiveCamera>()
    // useFrame((state) => {
    //     cam.current.lookAt(0, 0, 0)
    //     // cam.current.up.set(0, 0, 1)
    // })
    const mathboxCamera = useMemo(() => {
        return (
            <PerspectiveCamera
                makeDefault
                up={[0, 1, 0]}
                position={[0, 0, 10]}
                fov={60}
                ref={cam}
            >
                {children}
            </PerspectiveCamera>
        )
    }, [])

    return <> {mathboxCamera}</>
}

const useMathboxStyles = (theme: Theme) => {
    const mathbox = useMemo(
        () =>
            emoCss({
                border: `1px solid ${theme.palette.yellow.dark}`,
                borderRadius: theme.radii.md,
                width: '90vw',
                height: '70vh',
                margin: '2rem 5vw auto auto',
                position: 'relative',
                '.mathbox__canvaswrapper': {
                    backgroundColor: 'transparent',
                    width: '60vw',
                },
                '.mathbox__svg': {
                    backgroundColor: alpha(theme.palette.white.base, 0.5),
                },
                '.mathbox__playbtn': {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: theme.zIndices.tooltip,
                    willChange: 'top, left',
                },
                '.mathbox__overlay': {
                    position: 'absolute',
                    borderRadius: theme.radii.md,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    backgroundColor: alpha(theme.palette.white.base, 0.7),
                    zIndex: theme.zIndices.overlay,
                    willChange: 'background-color',
                },
            }),
        [theme]
    )

    return mathbox
}

const MathBox: React.FC = () => {
    const theme = useTheme<Theme>()
    const mathboxStyles = useMathboxStyles(theme)

    const [mathBoxState, mathBoxDispatch] = useImmerReducer(
        mathboxReducer,
        initMathBoxState
    )

    // canvas size
    // const [canvSize, setCanvSize] = useState({ width: 900, height: 800 })
    const { scale, format, tickValues } = useScaleLinear({
        domain: [-10, 10],
        // range: [-canvSize.height / 140, canvSize.height / 140],
        range: [-5, 5],
        numTicks: 16,
        axLength: 11,
        justPositive: true,
    })
    const {
        x1,
        x1Ref,
        x2,
        x2Ref,
        u,
        line,
        lineRef,
        overlayStyle,
        newPoints,
        playBtn,
    } = useMathboxAnim({
        scale,
    })
    const { playSize, ...playStyles } = playBtn

    // useEffect(() => {
    //     // the pause state is always lag behind the actual pausing state of app
    //     // that's why we use it's oposite to manage other things like ovarlay
    //     setOverlay({
    //         display: mathBoxState.pause ? 'none' : 'block',
    //         default: { immediate: true },
    //     })
    //     setOverlay({
    //         opacity: mathBoxState.pause ? 0 : 1,
    //     })
    // }, [mathBoxState.pause])

    useEffect(() => {
        if (mathBoxState.pause) {
            x1Ref.current.pause()
            x2Ref.current.pause()
            lineRef.current.pause()
        } else {
            x1Ref.current.start()
            x2Ref.current.start()
            lineRef.current.start()
        }
    }, [mathBoxState.pause])

    const mathboxCoordinates = useMemo(() => {
        return (
            <Coordinates
                scale={scale}
                format={format}
                tickValues={tickValues}
                lengths={{
                    xAxes: scale(11),
                    yAxes: scale(11),
                    zAxes: scale(11),
                }}
                showAxis={{
                    xAxes: true,
                    yAxes: true,
                    zAxes: false,
                }}
                colors={{
                    xAxes: theme.palette.gray.light,
                    yAxes: theme.palette.gray.light,
                    zAxes: theme.palette.gray.light,
                }}
            />
        )
    }, [])
    const mathboxGrids = useMemo(() => {
        return <Grids scale={scale} type="xy" length={22} />
    }, [scale])

    const mathboxLatex = useMemo(() => {
        return (
            <Latex
                style={{
                    fill: 'black',
                    position: 'absolute',
                    top: 30,
                    left: 10,
                    zIndex: 1,
                }}
                font_size={1.7}
                className={'mathbox__svg'}
                math_formula={String.raw`
                            \begin{bmatrix}
                            e^{\lambda_1} & 0& \cdots & 0 \\
                            0 & \anim<test>{e^{\lambda_2}} & \cdots & 0 \\
                            \vdots & \vdots & \ddots & \vdots \\ 
                            0 & 0 & \cdots & e^{\lambda_n}
                            \end{bmatrix} `}
            >
                <Latex.Anim
                    id="test"
                    css={emoCss({
                        '&:hover': {
                            fill: 'red',
                            scale: '1.2',
                            cursor: 'pointer',
                        },
                    })}
                />
            </Latex>
        )
    }, [])

    return (
        <div className="mathbox" css={mathboxStyles}>
            <a.div className="mathbox__overlay" style={overlayStyle} />
            <AplayButton
                className="mathbox__playbtn"
                size={playSize}
                style={playStyles}
                onClick={() => {
                    // setv_x1({ default: { pause: mathBoxState.pause } })
                    // setv_x2({ default: { pause: mathBoxState.pause } })
                    // if (!mathBoxState.pause) {
                    //     animCallback()
                    // }
                    mathBoxDispatch({ type: TOGGLE_PAUSE })
                }}
            />

            {mathBoxState.canvVisibility && (
                <Canvas
                    className="mathbox__canvaswrapper"
                    pixelRatio={window.devicePixelRatio}
                >
                    <Camera />
                    {/* <ALine p1={p1} p2={p2} /> */}
                    {/* <ALine
                        p1={[0, 0, 0]}
                        p2={[scale(2), scale(3), 0]}
                        width={0.04}
                        color={'#32a852'} */}
                    />
                    {/* <OrbitControls dampingFactor={0.9} /> */}
                    {/* <TestCamera /> */}
                    {mathboxGrids}
                    {mathboxCoordinates}
                    <LinearCombination x1={x1} x2={x2} u={u} />
                    <NPoints impPoints={newPoints} />
                    <ALine
                        p1={line.p1}
                        p2={line.p2}
                        opacity={line.opacity}
                        color={'gray'}
                    />
                    <ambientLight
                        castShadow
                        intensity={1}
                        position={[10, 10, 10]}
                    />
                </Canvas>
            )}

            {false && mathboxLatex}
            <div style={{ height: 200, width: '100vw' }} />
        </div>
    )
}

export default MathBox