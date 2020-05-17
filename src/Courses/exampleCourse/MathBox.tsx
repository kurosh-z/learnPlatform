import React, { useMemo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useImmerReducer } from 'use-immer'
import { useSpring, a } from 'react-spring'
import {
    Vector,
    Grids,
    Point,
    ImperativePoints,
    VectorOp,
} from '../../3D-components'
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
import { useScaleLinear } from '../courseComps/useScaleLinear'

type VectorArg = [number, number, number]
const Avector = a(Vector)
const AvectorOp = a(VectorOp)
const AplayButton = a(PlayButton)

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

    // animation srpings:

    const [{ v_x1 }, setv_x1] = useSpring<{ v_x1: VectorArg }>(() => ({
        v_x1: [scale(4), scale(-2), 0],
        // config: { friction: 40, mass: 10, tension: 40 },
    }))

    const [{ v_x2 }, setv_x2] = useSpring<{ v_x2: VectorArg }>(() => ({
        v_x2: [scale(2), scale(3), 0],
        // config: { friction: 100, mass: 3, tension: 80 },
    }))

    // playButton:
    const [{ playSize, ...playStyles }, setPlay] = useSpring(() => ({
        playSize: 100,
        top: '50%',
        left: '50%',
    }))
    // overlay
    const [overlayStyle, setOverlay] = useSpring(() => ({
        opacity: 1,
        display: 'block',
    }))
    const [newPoints, addNewPoints] = useState(null)
    const animCallback = async () => {
        const delay = 150
        await setPlay({ top: '97%', left: '5%', playSize: 30 })
        await setv_x1({ v_x1: [scale(1.5), scale(-1), 0], delay: 0.2 * delay })
        await Promise.all([
            addNewPoints({
                p2: {
                    color: 'red',
                    radius: 0.08,
                    position: [scale(1.5), scale(-1), 0],
                },
            }),
        ])
        await setv_x2({ v_x2: [scale(0), scale(5), 0], delay })
        await Promise.all([
            addNewPoints({
                p3: {
                    color: 'blue',
                    radius: 0.08,
                    position: [scale(0), scale(5), 0],
                },
            }),
        ])
        await setv_x1({ v_x1: [scale(-1.5), scale(-6), 0], delay })
        await setv_x2({ v_x2: [scale(1.5), scale(-1), 0], delay })
    }
    useEffect(() => {
        // the pause state is always lag behind the actual pausing state of app
        // that's why we use it's oposite to manage other things like ovarlay
        setOverlay({
            display: mathBoxState.pause ? 'none' : 'block',
            default: { immediate: true },
        })
        setOverlay({
            opacity: mathBoxState.pause ? 0 : 1,
        })
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

    return (
        <div className="mathbox" css={mathboxStyles}>
            <a.div className="mathbox__overlay" style={overlayStyle} />
            <AplayButton
                className="mathbox__playbtn"
                size={playSize}
                style={playStyles}
                onClick={() => {
                    setv_x1({ default: { pause: mathBoxState.pause } })
                    setv_x2({ default: { pause: mathBoxState.pause } })
                    if (!mathBoxState.pause) {
                        animCallback()
                    }
                    mathBoxDispatch({ type: TOGGLE_PAUSE })
                }}
            />
            {mathBoxState.canvVisibility && (
                <Canvas
                    className="mathbox__canvaswrapper"
                    pixelRatio={window.devicePixelRatio}
                    // onCreated={(el) => {
                    //     setCanvSize({
                    //         width: el.size.width,
                    //         height: el.size.height,
                    //     })
                    // }}
                >
                    <Camera />
                    <OrbitControls dampingFactor={0.9} />
                    {/* <TestCamera /> */}
                    <Grids scale={scale} type="xy" length={22} />
                    {/* <Point position={[scale(3), scale(3), 0]} /> */}
                    {mathboxCoordinates}

                    <Avector
                        vector={v_x1}
                        color={theme.palette.lime.light}
                        thicknessFacor={1.7}
                        label={String.raw`\vec{x_1}`}
                        latexParser
                    />

                    <Avector
                        vector={v_x2}
                        color={theme.palette.orange.base}
                        thicknessFacor={1.5}
                        label={String.raw`\vec{x_2}`}
                        latexParser
                    />
                    <AvectorOp
                        vector1={v_x1}
                        vector2={v_x2}
                        op="add"
                        color={theme.palette.blue.light}
                        thicknessFacor={1.5}
                        label={String.raw`\vec{u}`}
                        latexParser
                    />
                    <ImperativePoints
                        points={{
                            p1: {
                                color: 'black',
                                position: [scale(-3), scale(3), 0],
                            },
                        }}
                        newPoints={newPoints}
                    />
                    <ambientLight
                        castShadow
                        intensity={1}
                        position={[10, 10, 10]}
                    />
                </Canvas>
            )}

            {true && (
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
            )}
            <div style={{ height: 200, width: '100vw' }} />
        </div>
    )
}

export default MathBox
