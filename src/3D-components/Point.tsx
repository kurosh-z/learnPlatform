import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useThree } from 'react-three-fiber'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { useSpring, useSprings, a } from 'react-spring'

export type SinglePoint = {
    position?: [number, number, number]
    radius?: number
    color?: string
    opacity?: number
    pkey: string
}
type CreatePointsArgs = { [keys: string]: SinglePoint }

function createSpheres(points: CreatePointsArgs): THREE.Mesh[] {
    const spheres: THREE.Mesh[] = []
    for (const point_key in points) {
        const point = points[point_key]
        const { position, color = 'blue', radius = 0.1, opacity = 0.5 } = point
        const sGeometry = new THREE.SphereGeometry(radius, 18, 18)
        const sMaterial = new THREE.MeshBasicMaterial({ color, opacity })
        const sphere = new THREE.Mesh(sGeometry, sMaterial)
        sphere.position.set(...position)
        sphere.name = point_key
        spheres.push(sphere)
    }
    return spheres
}

export const Point: React.FC<SinglePoint> = ({
    position,
    radius = 0.09,
    color = 'blue',
    opacity = 0.5,
    pkey,
}) => {
    return (
        <mesh position={position} name={pkey}>
            <sphereGeometry attach="geometry" args={[radius, 20, 20]} />
            <meshBasicMaterial
                attach="material"
                color={color}
                opacity={opacity}
            />
        </mesh>
    )
}
const Aspoint = a(Point)

export const Points: React.FC<{
    points?: CreatePointsArgs
    impPoints?: CreatePointsArgs
}> = ({ points, impPoints }) => {
    const { scene } = useThree()
    useEffect(() => {
        let spheres = []
        if (impPoints) {
            spheres = createSpheres(impPoints)
            for (const sphere of spheres) {
                scene.add(sphere)
            }
        }
    }, [impPoints])

    return (
        <>
            {points &&
                Object.keys(points).map((key, idx) => {
                    const point = points[key]
                    return (
                        <Point
                            key={idx}
                            pkey={point.pkey}
                            position={point.position}
                            color={point.color}
                            radius={point.radius}
                        />
                    )
                })}
        </>
    )
}

export type PAnimatedProps = Pick<
    SinglePoint,
    'opacity' | 'position' | 'radius' | 'color'
>

export type APointProps = {
    from: PAnimatedProps
    pause: boolean
    pkey: string
}
// TODO: add setSrpringFunc to props
export const APoint: React.FC<APointProps> = ({ from, pkey, pause }) => {
    const spRef = useRef<SpringHandle<PAnimatedProps>>(null)
    const [sprops, setSprops] = useSpring<PAnimatedProps>(() => ({
        ref: spRef,
        from: from,
    }))

    useEffect(() => {
        if (pause) {
            spRef.current.pause()
        }
    }, [pause])

    return (
        <Aspoint
            pkey={pkey}
            color={sprops.color}
            radius={sprops.radius}
            opacity={sprops.opacity}
            position={sprops.position}
        />
    )
}

export type PointsProps = {
    points: SinglePoint[]
    setSpringsRef: React.MutableRefObject<SpringStartFn<PAnimatedProps>>
    pause: boolean
}

export const APoints: React.FC<PointsProps> = ({
    points,
    setSpringsRef,
    pause,
}) => {
    const spRef = useRef<SpringHandle<SinglePoint>>(null)
    const [springs, setSprings] = useSprings(points.length, (idx) => {
        const {
            position = [0, 0, 0],
            color = 'blue',
            opacity = 0,
            radius = 0,
        } = points[idx]

        const from: PAnimatedProps = {
            position,
            color,
            opacity,
            radius,
        }

        if (idx === 0) return { from, ref: spRef }
        else return { from }
    })

    useEffect(() => {
        setSpringsRef.current = setSprings
    }, [])

    useEffect(() => {
        if (pause && spRef.current) {
            spRef.current.pause()
        }
    }, [pause])

    return (
        <>
            {springs.map((animProps, idx) => {
                return (
                    <Aspoint {...animProps} pkey={points[idx].pkey} key={idx} />
                )
            })}
        </>
    )
}
