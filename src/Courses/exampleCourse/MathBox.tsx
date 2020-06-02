import React, { useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useImmerReducer } from 'use-immer'
import { a } from 'react-spring'
import { Grids, ALine, APoints, Coordinates } from '../../3D-components'
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
import Latex from '../../math-components/Latex'
import { Progressbar } from './Progressbar'
import LinearCombination from '../courseComps/LinearCombination'
import { useScaleLinear } from '../courseComps/useScaleLinear'
import { useMathboxAnim } from './useMathboxAnim'

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
                // display: 'flex',
                // flexDirection: 'column',
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
    // const [canvSize, setCanvSize] = useState({ width: 17, height: 10 })
    const { scale, format, tickValues } = useScaleLinear({
        domain: [-10, 10],
        // range: [-canvSize.height / 140, canvSize.height / 140],
        range: [-5, 5],
        numTicks: 16,
        axLength: 10,
        justPositive: true,
    })
    const anim = useMathboxAnim({
        scale,
        tickValues,
        pause: mathBoxState.pause,
    })

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

    // useEffect(() => {
    //     if (mathBoxState.pause) {
    //         // x1Ref.current.pause()
    //         // x2Ref.current.pause()

    //         lineRef.current.pause()
    //     } else {
    //         // x1Ref.current.start()
    //         // x2Ref.current.start()
    //         x1_startRef.current({ vector: [scale(4), scale(-6), 0] })

    //         lineRef.current.start()
    //     }
    // }, [mathBoxState.pause])

    const mathboxLatex = useMemo(() => {
        return <></>
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
                        transition: ' all .5s ease-in-out',
                        '&:hover': {
                            fill: 'red',
                            scale: '1.2',
                            cursor: 'pointer',
                            transition: ' all .5s ease-in-out',
                        },
                    })}
                />
            </Latex>
        )
    }, [])

    return (
        <div className="mathbox" css={mathboxStyles}>
            <a.div className="mathbox__overlay" style={anim.overlayStyle} />

            {mathBoxState.canvVisibility && (
                <Canvas
                    className="mathbox__canvaswrapper"
                    pixelRatio={window.devicePixelRatio}
                    onCreated={(ev) => {
                        console.log(ev)
                    }}
                >
                    <Camera />
                    <OrbitControls dampingFactor={0.9} />

                    <LinearCombination
                        x1={anim.x1.x1_from}
                        x2={anim.x2.x2_from}
                        x1_base={anim.x1.x1b_from}
                        x2_base={anim.x2.x2b_from}
                        u={anim.u.u_from}
                        setX1Ref={anim.x1.x1_startRef}
                        setX2Ref={anim.x2.x2_startRef}
                        setURef={anim.u.u_startRef}
                        setX1_baseRef={anim.x1.x1base_startRef}
                        setX2_baseRef={anim.x2.x2base_startRef}
                        pause={mathBoxState.pause}
                    />
                    <Coordinates
                        scale={scale}
                        format={format}
                        pause={mathBoxState.pause}
                        axSetFnRefs={anim.setCoordinateAxis}
                        opacity={{ xAxes: 1, yAxes: 1 }}
                        axisVisiblity={{ xAxes: false, yAxes: false }}
                        tickSetFnRefs={anim.setCoordTicks}
                        renderAxis={{ xAxes: true, yAxes: true }}
                        colors={{
                            xAxes: theme.palette.gray.light,
                            yAxes: theme.palette.gray.light,
                        }}
                        lengths={{ xAxes: scale(0), yAxes: scale(0) }}
                        tickValues={tickValues}
                        tickForms={{
                            xAxes: {
                                opacity: 0,
                                length: 0,
                                visible: true,
                            },
                            yAxes: {
                                opacity: 0,
                                length: 0,
                                visible: true,
                            },
                        }}
                    />

                    <Grids
                        scale={scale}
                        type="xy"
                        len1={32}
                        len2={22}
                        pause={mathBoxState.pause}
                        gFuncRef={anim.gridStartRef}
                        visible={false}
                    />

                    <APoints
                        pause={mathBoxState.pause}
                        points={anim.points}
                        setSpringsRef={anim.setPointsStringsRef}
                    />

                    {/* <ALine
                        p1={line.p1}
                        p2={line.p2}
                        opacity={line.opacity}
                        color={'gray'}
                        visible={line.visible}
                    /> */}
                    <ambientLight
                        castShadow
                        intensity={1}
                        position={[10, 10, 10]}
                    />
                </Canvas>
            )}

            {true && mathboxLatex}
            <Progressbar
                sections={[
                    { title: '2D Span' },
                    { title: 'Practice' },
                    { title: '3D Span' },
                    { title: 'Pracitce' },
                ]}
                mathboxDispatch={mathBoxDispatch}
                mathboxState={mathBoxState}
                setSpringsRef={anim.setProgressbarRef}
            />
        </div>
    )
}

export default MathBox
