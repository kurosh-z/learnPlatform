import React, { useMemo, useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useImmerReducer } from 'use-immer'
import { useSpring, a, animated, config } from 'react-spring'
import { mathboxReducer, initMathBoxState } from './mathBoxReducer'
import { Canvas, useThree, useFrame } from 'react-three-fiber'
import { OrbitControls, PerspectiveCamera } from 'drei'
import { css as emoCss } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../../theme/types'
import { alpha } from '../../theme/colors'
import PlayButton from '../../components/Button/PlayButtton'
import Latex from '../../math-components/Latex'
import Plane from '../../3D-components/Plane'
import Vector from '../../3D-components/Vector'
import Coordinates from '../courseComps/Coordinates'
import { useScaleLinear } from '../courseComps/useScaleLinear'

const Avector = a(Vector)
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
            >
                {}
            </PerspectiveCamera>
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
                '.mathbox__canvas': {
                    backgroundColor: 'transparent',
                },
                '.mathbox__svg': {
                    backgroundColor: alpha(theme.palette.white.base, 0.4),
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
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '99%',
                    height: '99%',
                    backgroundColor: alpha(theme.palette.white.light, 0.7),
                    zIndex: theme.zIndices.overlay,
                    willChange: 'background-color',
                },
            }),
        [theme]
    )

    return mathbox
}

const MathBox: React.FC<{}> = () => {
    const theme = useTheme<Theme>()
    const mathboxStyles = useMathboxStyles(theme)

    const [mathBoxState, mathBoxDispatch] = useImmerReducer(
        mathboxReducer,
        initMathBoxState
    )

    const { scale, format, tickValues } = useScaleLinear({
        domain: [-100, 100],
        range: [-10, 10],
        numTicks: 30,
        axLength: 30,
        justPositive: true,
    })

    // animation srpings:
    const vec1Ref = useRef(null)
    const [{ vec1 }, setVec1] = useSpring(() => ({
        ref: vec1Ref,
        vec1: [0, 0, 0],
    }))
    const vec2Ref = useRef(null)
    const [{ vec2 }, setVec2] = useSpring(() => ({
        ref: vec2Ref,
        vec2: [0, 0, 0],
        config: config.molasses,
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
    const [tplay, setTplay] = useState(false)

    const animCallback = async () => {
        await setPlay({ top: '97%', left: '5%', playSize: 30 })
        await setOverlay({ opacity: 0 })
        await setOverlay({ display: 'none' })
        await setVec2({
            vec2: [scale(-38), scale(26), 0],
            config: config.molasses,
        })
        await setVec1({
            vec1: [scale(88), scale(16), 0],
            config: { duration: 5000 },
        })
    }
    useEffect(() => {
        if (!mathBoxState.play) {
            vec1Ref.current.pause()
            vec2Ref.current.pause()
        }
    }, [tplay])

    return (
        <div className="mathbox" css={mathboxStyles}>
            <a.div className="mathbox__overlay" style={overlayStyle} />
            <AplayButton
                className="mathbox__playbtn"
                size={playSize}
                style={playStyles}
                onClick={() => {
                    mathBoxDispatch({ type: '[mathbox toggle ' })
                    setTplay(!tplay)
                    animCallback()
                }}
            />
            {mathBoxState.canvVisibility && (
                <Canvas
                    className="mathbox__canvas"
                    id={'mathCanvas'}
                    pixelRatio={window.devicePixelRatio}
                >
                    <Camera />
                    <OrbitControls dampingFactor={0.9} />
                    {/* <TestCamera /> */}
                    <Coordinates
                        scale={scale}
                        format={format}
                        tickValues={tickValues}
                        lengths={{
                            xAxes: scale(30),
                            yAxes: scale(30),
                            zAxes: scale(30),
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
                    {/* <Plane
                        position={[0, 0, 0]}
                        dimensions={{
                            width: 2 * scale(20),
                            height: 2 * scale(20),
                        }}
                        showEdges={false}
                    /> */}
                    <Avector
                        vector={vec1}
                        color={theme.palette.lime.light}
                        thicknessFacor={1.5}
                        label={'w'}
                    />
                    <Avector
                        vector={vec2}
                        color={theme.palette.orange.base}
                        thicknessFacor={1.5}
                        label={'u'}
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
        </div>
    )
}

export default MathBox
