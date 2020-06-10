import React, { useEffect, useRef, ReactNode } from 'react'
import * as THREE from 'three'
import { useThree, ReactThreeFiber } from 'react-three-fiber'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { useSpring, useSprings, a } from 'react-spring'
import { useDrag, useHover } from 'react-use-gesture'

export type SinglePoint = {
    position?: [number, number, number]
    radius?: number
    color?: string
    opacity?: number
    visible?: boolean
    transparent?: boolean
    onClick?: ReactThreeFiber.Events['onClick']
    onPointerUp?: ReactThreeFiber.Events['onPointerUp']
    onPointerDown?: ReactThreeFiber.Events['onPointerDown']
    onPointerOver?: ReactThreeFiber.Events['onPointerOver']
    onPointerOut?: ReactThreeFiber.Events['onPointerOut']
    onPointerMove?: ReactThreeFiber.Events['onPointerMove']
    onWheel?: ReactThreeFiber.Events['onWheel']
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
    visible = true,
    transparent = true,
    children,
    ...events
}) => {
    return (
        <mesh position={position} visible={visible} {...events}>
            <sphereGeometry attach="geometry" args={[radius, 20, 20]} />
            <meshBasicMaterial
                attach="material"
                color={color}
                opacity={opacity}
                transparent={transparent}
            />
        </mesh>
    )
}

export const Aspoint = a(Point)

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
    'opacity' | 'position' | 'radius' | 'color' | 'visible'
>
export type SetPoint = SpringStartFn<PAnimatedProps>

export type APointProps = {
    from: PAnimatedProps
    setSpringRef: React.MutableRefObject<SetPoint>
    pause: boolean
}
// TODO: add setSrpringFunc to props
export const APoint: React.FC<APointProps> = ({
    from,
    setSpringRef,
    pause,
}) => {
    const spRef = useRef<SpringHandle<PAnimatedProps>>(null)
    const [sprops, setSprops] = useSpring<PAnimatedProps>(() => ({
        ref: spRef,
        from: from,
    }))

    useEffect(() => {
        setSpringRef.current = setSprops
    }, [])

    useEffect(() => {
        if (pause) {
            spRef.current.pause()
        }
    }, [pause])

    return (
        <Aspoint
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
            visible = true,
        } = points[idx]

        const from: PAnimatedProps = {
            position,
            color,
            opacity,
            radius,
            visible,
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
                return <Aspoint {...animProps} key={idx} transparent={true} />
            })}
        </>
    )
}
