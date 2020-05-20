/* eslint-disable @typescript-eslint/no-namespace */
import React from 'react'
import { animated } from 'react-spring'
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
}

const Meshline: React.FC<MeshlineProps> = ({
    vertices,
    width = 0.05,
    color = '#2a2c33',
    dashArray = 0,
    dashRatio = 0,
    opacity = 1,
    resolution = new Vector2(window.innerWidth, window.innerHeight),
    far = -10,
    near = 10,
}) => {
    const { camera } = useThree()

    return (
        <mesh raycast={MeshLineRaycast}>
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

export type AlineProps = {
    p1: [number, number, number]
    p2: [number, number, number]
} & Omit<MeshlineProps, 'vertices'>

const Line: React.FC<AlineProps> = ({ p1, p2, ...rest }) => {
    const vertices: Vector3[] = []
    vertices.push(new Vector3(...p1))
    vertices.push(new Vector3(...p2))
    console.log(vertices)
    return <Meshline vertices={vertices} {...rest} />
}

export const ALine = animated(Line)
export default Meshline
