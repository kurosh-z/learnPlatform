/* eslint-disable @typescript-eslint/no-namespace */
import React, { useRef, useEffect } from 'react'
import { animated, useSpring } from 'react-spring'
import { SpringStartFn, SpringHandle } from '@react-spring/core'

import { extend, ReactThreeFiber, useThree } from 'react-three-fiber'
import { Vector3, Vector2 } from 'three'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'threejs-meshline'

extend({ MeshLine, MeshLineMaterial })

declare global {
    namespace JSX {
        interface IntrinsicElements {
            meshLine: ReactThreeFiber.Object3DNode<MeshLine, typeof Meshline>
            meshLineMaterial: ReactThreeFiber.Object3DNode<
                MeshLineMaterial,
                typeof MeshLineMaterial
            >
        }
    }
}

type MeshlineProps = {
    vertices: Vector3[]
    width?: number
    color?: ReactThreeFiber.Color
    dashArray?: number
    dashRatio?: number
    opacity?: number
    resolution?: Vector2
    far?: number
    near?: number
    visible?: boolean
}

export const Meshline: React.FC<MeshlineProps> = ({
    vertices,
    width = 0.05,
    color = '#2a2c33',
    dashArray = 0,
    dashRatio = 0,
    opacity = 1,
    resolution = new Vector2(window.innerWidth, window.innerHeight),
    far,
    near,
    visible = true,
}) => {
    const { camera } = useThree()

    return (
        <mesh raycast={MeshLineRaycast} visible={visible && opacity > 0.001}>
            <meshLine attach="geometry" vertices={vertices} />
            <meshLineMaterial
                attach="material"
                useMap={false}
                transparent
                near={near ? near : camera.near}
                far={far ? far : camera.far}
                depthTest={false}
                lineWidth={width}
                resolution={resolution}
                color={color}
                opacity={opacity}
                dashArray={dashArray}
                dashRatio={dashRatio}
            />
        </mesh>
    )
}

export type LineProps = {
    p1: [number, number, number]
    p2: [number, number, number]
} & Omit<MeshlineProps, 'vertices'>

export const Line: React.FC<LineProps> = ({ p1, p2, ...rest }) => {
    const vertices: Vector3[] = []
    vertices.push(new Vector3(...p1))
    vertices.push(new Vector3(...p2))
    // console.log(vertices)
    return <Meshline vertices={vertices} {...rest} />
}

export const ALine = animated(Line)

export type AnimatedMlineProps = Partial<
    Pick<
        LineProps,
        | 'color'
        | 'dashArray'
        | 'dashRatio'
        | 'p1'
        | 'p2'
        | 'opacity'
        | 'visible'
        | 'width'
    >
>
export type SetMline = SpringStartFn<AnimatedMlineProps>
type MlineProps = Omit<LineProps, keyof AnimatedMlineProps> & {
    from: AnimatedMlineProps
    pause: boolean
    setSpringRef: React.MutableRefObject<SetMline>
}
export const Mline: React.FC<MlineProps> = ({
    from,
    pause,
    setSpringRef,
    ...rest
}) => {
    const {
        color = 'black',
        dashArray = 0,
        dashRatio = 0,
        p1,
        p2,
        opacity = 1,
        visible = true,
        width = 0.05,
    } = from

    const spRef = useRef<SpringHandle<AnimatedMlineProps>>(null)
    const [spring, setSpring] = useSpring<AnimatedMlineProps>(() => ({
        ref: spRef,
        from: {
            color,
            dashArray,
            dashRatio,
            p1,
            p2,
            opacity,
            visible,
            width,
        },
    }))

    useEffect(() => {
        if (pause && spRef.current) {
            spRef.current.pause()
        }
    }, [pause])
    useEffect(() => {
        setSpringRef.current = setSpring
    }, [])

    return <ALine {...spring} {...rest} />
}
