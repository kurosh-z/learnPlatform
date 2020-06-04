/* eslint-disable @typescript-eslint/no-namespace */
import React, { useMemo, useEffect, useRef } from 'react'
import { ScaleLinear } from 'd3-scale'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { ReactThreeFiber, useThree, extend, Camera } from 'react-three-fiber'
import { SpringHandle, SpringStartFn, SpringConfig } from '@react-spring/core'
import { useSpring, animated } from 'react-spring'
// import { Line } from './Meshline'
// extending the line2 to be used in react-fiber
extend({ LineMaterial, LineGeometry, Line2 })
declare global {
    namespace JSX {
        interface IntrinsicElements {
            line2: ReactThreeFiber.Object3DNode<Line2, typeof Line2>
            lineMaterial: ReactThreeFiber.Object3DNode<
                LineMaterial,
                typeof LineMaterial
            >
            lineGeometry: ReactThreeFiber.Object3DNode<
                LineGeometry,
                typeof LineGeometry
            >
        }
    }
}
const visibleAtZDepth = (depth: number, camera: Camera) => {
    // compensate for cameras not positioned at z=0
    const cameraOffset = camera.position.z
    if (depth < cameraOffset) depth -= cameraOffset
    else depth += cameraOffset

    // vertical fov in radians
    const vFOV = (camera.fov * Math.PI) / 180

    // Math.abs to ensure the result is always positive
    const visible_height = 2 * Math.tan(vFOV / 2) * Math.abs(depth)
    const visible_width = visible_height * camera.aspect
    return { w: visible_width, h: visible_height }
}

// const visibleWidthAtZDepth = (
//     depth: number,
//     camera: THREE.PerspectiveCamera
// ) => {
//     const height = visibleHeightAtZDepth(depth, camera)
//     return height * camera.aspect
// }

type LineSetProps = {
    pointsArray: number[][]
    size: { width: number; height: number }
    color: string
    opacity: number
    visibile?: boolean
}
export const LineSet: React.FC<LineSetProps> = ({
    pointsArray,
    size,
    opacity,
    color,
    visibile = true,
}) => {
    const { camera } = useThree()
    return (
        <>
            {pointsArray.map((linePoints, idx) => {
                // return (
                //     <Line
                //         key={idx}
                //         p1={linePoints.slice(0, 3) as [number, number, number]}
                //         p2={linePoints.slice(3, 6) as [number, number, number]}
                //         color={color}
                //         opacity={opacity}
                //         width={0.01}
                //     />
                // )

                return (
                    <line2 key={idx} visible={visibile}>
                        <lineGeometry
                            attach="geometry"
                            onUpdate={(self: LineGeometry) => {
                                self.setPositions(linePoints)
                            }}
                        />
                        <lineMaterial
                            attach="material"
                            args={[
                                {
                                    color: color,
                                    linewidth: 1,
                                    resolution: new THREE.Vector2(
                                        size.width,
                                        size.height
                                    ),
                                },
                            ]}
                        />
                    </line2>
                )
            })}
        </>
    )
}

type HVlines = {
    hstartPoint: number
    hendPoint: number
    vstartPoint: number
    vendPoint: number
    scale: ScaleLinear<number, number>
    size: { width: number; height: number }
    color?: ReactThreeFiber.Color
    opacity?: number
    visibile?: boolean
}

const Vlines: React.FC<HVlines> = ({
    hstartPoint,
    hendPoint,
    vstartPoint,
    vendPoint,
    scale,
    size,
    color = '#9d9e9e',
    opacity = 1,
    visibile,
}) => {
    const pointsArray: number[][] = []

    for (
        let i = hstartPoint + scale(1);
        i <= hendPoint - scale(1);
        i += scale(1)
    ) {
        const linePoints2: number[] = [
            i,
            vstartPoint,
            0.001,
            i,
            vendPoint,
            0.001,
        ]
        pointsArray.push(linePoints2)
    }

    return (
        <LineSet
            pointsArray={pointsArray}
            size={size}
            color={color}
            opacity={opacity}
            visibile={visibile}
        />
    )
}
const Hlines: React.FC<HVlines> = ({
    hstartPoint,
    hendPoint,
    vstartPoint,
    vendPoint,
    scale,
    size,
    color = '#9d9e9e',
    opacity = 1,
    visibile,
}) => {
    const pointsArray: number[][] = []

    for (
        let j = vendPoint + scale(1);
        j <= vstartPoint - scale(1);
        j += scale(1)
    ) {
        // prettier-ignore
        const linePoints2:number[] = [hstartPoint, j, 0.001,hendPoint, j, 0.001];
        pointsArray.push(linePoints2)
    }

    return (
        <LineSet
            pointsArray={pointsArray}
            size={size}
            color={color}
            opacity={opacity}
            visibile={visibile}
        />
    )
}

const Ahlines = animated(Hlines)
const Avlines = animated(Vlines)

export type GAnimProps = { hdraw: boolean; vdraw: boolean }

type SpringArgs = {
    horz_end_point: number
    vert_end_point: number
    visible: boolean
}
export type SetGridFn = (args: {
    to: GAnimProps
    config: SpringConfig
    delay: number
}) => void
// Grids
interface GridProps {
    type?: 'xy' | 'xz' | 'yz'
    width?: number
    height?: number
    visible: boolean
    scale: ScaleLinear<number, number>
    pause: boolean
    gFuncRef: React.MutableRefObject<SetGridFn>
}

const Grids: React.FC<GridProps> = ({
    type = 'xy',
    width = 890,
    height = 20,
    scale,
    pause = true,
    gFuncRef,
    visible = true,
}) => {
    const { size } = useThree()
    const {
        horz_start_point,
        horz_end_point,
        vert_start_point,
        vert_end_point,
    } = useMemo(() => {
        const _width = (width * window.innerWidth) / window.innerHeight / 1.7628
        const halfWidth = scale(_width / 2)
        const DIST = scale(1) // distance btw. ticks
        const MARGIN = 2 * scale(1)
        const num_horz_ticks = Math.round((halfWidth - MARGIN) / DIST)
        const horz_start_point = -DIST * num_horz_ticks - scale(1) // begin .5 to the margin!
        const horz_end_point = -1 * horz_start_point

        const halfHeight = scale(height / 2)
        const num_vert_ticks = Math.round((halfHeight - MARGIN) / DIST)
        const vert_start_point = DIST * num_vert_ticks + scale(1)
        const vert_end_point = -1 * vert_start_point

        return {
            horz_start_point,
            horz_end_point,
            vert_start_point,
            vert_end_point,
        }
    }, [width, height, window.innerHeight / window.innerWidth])

    const gSpringRef = useRef<SpringHandle<SpringArgs>>(null)
    const [gspring, setGspring] = useSpring<SpringArgs>(() => ({
        ref: gSpringRef,
        horz_end_point: horz_start_point,
        vert_end_point: vert_start_point,
        visible: visible,
    }))

    useEffect(() => {
        const setGridFn: SetGridFn = async ({ to, config, delay }) => {
            if (to.hdraw || to.vdraw) {
                await setGspring({
                    visible: true,
                    delay: delay / 2,
                    default: { immediate: true },
                })
                await setGspring({
                    to: {
                        horz_end_point: to.hdraw
                            ? horz_end_point
                            : horz_start_point,
                        vert_end_point: to.vdraw
                            ? vert_end_point
                            : vert_start_point,
                    },
                    config: config,
                    delay: delay / 2,
                })
            } else {
                await setGspring({
                    to: {
                        horz_end_point: horz_start_point,
                        vert_end_point: vert_start_point,
                    },
                    config: config,
                    delay: delay,
                })
                await setGspring({
                    visible: true,
                    default: { immediate: true },
                })
            }
        }
        gFuncRef.current = setGridFn

        // if the aspect ratio (windowWidth/windowHeight) changes camera updates scene but the aspect ratio of
        //  (length of horizontal girds / length of vertical girds ) should be changing accordingly
        if (gspring.visible.animation.to) {
            setGspring({
                horz_end_point: horz_end_point,
                vert_end_point: vert_end_point,
                default: { immediate: true },
            })
        }
    }, [horz_end_point, horz_start_point, vert_end_point, vert_start_point])
    useEffect(() => {
        if (pause) {
            gSpringRef.current.pause()
        }
    }, [pause])

    return (
        <>
            <Ahlines
                hstartPoint={horz_start_point}
                hendPoint={gspring.horz_end_point}
                vstartPoint={vert_start_point}
                vendPoint={vert_end_point}
                size={size}
                scale={scale}
                color={'#8a8a8a'}
                visibile={gspring.visible}
            />
            <Avlines
                hstartPoint={horz_start_point}
                hendPoint={horz_end_point}
                vstartPoint={vert_start_point}
                vendPoint={gspring.vert_end_point}
                size={size}
                scale={scale}
                color={'#9d9e9e'}
                visibile={gspring.visible}
            />
        </>
    )
}

export default Grids

// color: '#9d9e9e',
