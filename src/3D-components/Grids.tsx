/* eslint-disable @typescript-eslint/no-namespace */
import React, { useMemo, useEffect, useRef } from 'react'
import { ScaleLinear } from 'd3-scale'
import * as THREE from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { ReactThreeFiber, useThree, extend } from 'react-three-fiber'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
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
    startPoint: number
    endPoint: number
    gwidth: number
    scale: ScaleLinear<number, number>
    size: { width: number; height: number }
    color?: ReactThreeFiber.Color
    opacity?: number
    visibile?: boolean
}

const Vlines: React.FC<HVlines> = ({
    gwidth, // width of the grid (not lines)
    startPoint, // starting point of the line
    endPoint,
    scale,
    size,
    color = '#9d9e9e',
    opacity = 1,
    visibile,
}) => {
    const pointsArray: number[][] = []
    const dist = 1
    const halfWidth = gwidth / 2
    for (
        let i = scale(-halfWidth + dist);
        i < scale(halfWidth);
        i += scale(dist)
    ) {
        // prettier-ignore
        const linePoints2:number[] = [i, scale(startPoint), 0.001, i, scale(endPoint), 0.001];
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
    startPoint, // starting point on prependicular axes to draw lines
    endPoint,
    gwidth, // width of the grid width
    scale,
    size,
    color = 'gray',
    opacity = 1,
    visibile,
}) => {
    const pointsArray: number[][] = []
    const dist = 1
    const halfWidth = gwidth / 2
    for (
        let j = scale(-halfWidth + dist);
        j < scale(halfWidth);
        j += scale(dist)
    ) {
        // prettier-ignore
        const linePoints2:number[] = [scale(startPoint), j, 0.001,scale(endPoint), j, 0.001];
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

// Grids
interface GridProps {
    type?: 'xy' | 'xz' | 'yz'
    len1?: number
    len2?: number
    visible: boolean
    scale: ScaleLinear<number, number>
    pause: boolean
    gFuncRef: React.MutableRefObject<
        SpringStartFn<{
            _endPoint1: number
            _endPoint2: number
            visible: boolean
        }>
    >
}

export type GAnimProps = {
    _endPoint1: number
    _endPoint2: number
    visible: boolean
}
const Grids: React.FC<GridProps> = ({
    type = 'xy',
    len1 = 20,
    len2 = 20,
    scale,
    pause = true,
    gFuncRef,
    visible = true,
}) => {
    const { size } = useThree()

    const gSpringRef = useRef<SpringHandle<GAnimProps>>(null)
    const [gprops, setGrid] = useSpring<GAnimProps>(() => ({
        ref: gSpringRef,
        _endPoint1: -len1 / 2,
        _endPoint2: len2 / 2,
        visible: visible,
    }))
    useEffect(() => {
        gFuncRef.current = setGrid
    }, [])
    useEffect(() => {
        if (pause) {
            gSpringRef.current.pause()
        }
    }, [pause])

    return (
        <>
            <Ahlines
                startPoint={-len1 / 2}
                endPoint={gprops._endPoint1}
                gwidth={len2}
                size={size}
                scale={scale}
                color={'#8a8a8a'}
                visibile={gprops.visible}
            />
            <Avlines
                startPoint={len2 / 2}
                endPoint={gprops._endPoint2}
                gwidth={len1}
                size={size}
                scale={scale}
                color={'#9d9e9e'}
                visibile={gprops.visible}
            />
        </>
    )
}

export default Grids

// color: '#9d9e9e',
