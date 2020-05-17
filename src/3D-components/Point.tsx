import React, { useMemo, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { ReactThreeFiber, useThree } from 'react-three-fiber'

export type SinglePoint = {
    position: [number, number, number]
    radius?: number
    color?: ReactThreeFiber.Color
    opacity?: number
}
type CreatePointsArgs = { [keys: string]: SinglePoint }

const Point: React.FC<SinglePoint> = ({
    position,
    radius = 0.09,
    color = 'blue',
    opacity = 0.5,
}) => {
    return (
        <mesh position={position}>
            <sphereGeometry attach="geometry" args={[radius, 20, 20]} />
            <meshBasicMaterial
                attach="material"
                color={color}
                opacity={opacity}
            />
        </mesh>
    )
}

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

const useRemovePoints = (point_keys: string[]) => {
    const { scene } = useThree()
    useEffect(() => {
        for (const key of point_keys) {
            const sphere = scene.getObjectByName(key)
            scene.remove(sphere)
        }
    }, [])
}

export const useImperativePoints = () => {
    const _add = useAddPoints
    const _remove = useRemovePoints

    return [_add, _remove]
}

type ImperativePointsProps = {
    points: CreatePointsArgs
    newPoints?: CreatePointsArgs
}
export const ImperativePoints: React.FC<ImperativePointsProps> = ({
    points,
    newPoints,
}) => {
    const spheres = useMemo(() => {
        const spheres = createSpheres(points)
        return spheres
    }, [points])

    const { scene } = useThree()
    useEffect(() => {
        for (const sphere of spheres) {
            scene.add(sphere)
        }

        return () => {
            for (const sphere of spheres) {
                scene.remove(sphere)
            }
        }
    }, [])
    useEffect(() => {
        console.log(newPoints)
        let spheres = []
        if (newPoints) {
            spheres = createSpheres(newPoints)
            for (const sphere of spheres) {
                scene.add(sphere)
            }
        }
    }, [newPoints])

    return <></>
}

export default Point
