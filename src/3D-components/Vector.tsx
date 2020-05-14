/* eslint-disable @typescript-eslint/no-namespace */
import React, { useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { HTML } from 'drei'
import { ReactThreeFiber, extend } from 'react-three-fiber'
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry'
import { ORIGIN } from './constants'

// extend the class to use it in react!
extend({ CustomCylinderBufferGeometry })
declare global {
    namespace JSX {
        interface IntrinsicElements {
            customCylinderBufferGeometry: ReactThreeFiber.Object3DNode<
                CustomCylinderBufferGeometry,
                typeof CustomCylinderBufferGeometry
            >
        }
    }
}
// utility functions:
const matrix = new THREE.Matrix4()
function calCurrentDirection(object3d: THREE.Object3D) {
    matrix.extractRotation(object3d.matrix)
    const curDir = new THREE.Vector3(0, 1, 0)
    curDir.applyMatrix4(matrix).normalize()
    return curDir
}

// size constants:
const HRADIUS = 0.06
const HHEIGHT = 0.09
const SRADIUS = 0.02

// shaft component:
interface ShaftProps {
    mag: number
    direction: THREE.Vector3 | number[]
    color?: ReactThreeFiber.Color
    thicknessFactor: number
    onPointerDown?: (e) => void
    hover?: (hoverd: boolean) => void
}
const Shaft: React.FC<ShaftProps> = ({
    mag,
    direction,
    color = '#3761fa',
    thicknessFactor,
    onPointerDown,
    hover,
}) => {
    // ref to objects:

    const onUpdate = (self: THREE.Mesh) => {
        const curDir = calCurrentDirection(self)
        const _dir =
            direction instanceof THREE.Vector3
                ? direction.clone().normalize()
                : new THREE.Vector3().fromArray(direction).normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(curDir, _dir)
        self.applyQuaternion(quaternion)
        self.updateMatrixWorld()
        self.scale.set(1, mag, 1)
    }

    return (
        <mesh
            onPointerDown={onPointerDown}
            onPointerOver={(e) => {
                e.stopPropagation()
                hover(true)
            }}
            onPointerOut={(e) => {
                // e.stopPropagation();
                hover(false)
            }}
            onUpdate={onUpdate}
        >
            <customCylinderBufferGeometry
                attach="geometry"
                args={[
                    {
                        radiusTop: thicknessFactor * SRADIUS,
                        radiusBottom: thicknessFactor * SRADIUS,
                        height: 1,
                        radialSegments: 25,
                        heightSegments: 2,
                        drawingMode: 'static',
                    },
                ]}
            />
            <meshBasicMaterial attach="material" color={color} />
        </mesh>
    )
}

// Head component:
interface HeadProps {
    position: [number, number, number]
    direction: THREE.Vector3 | [number, number, number]
    color?: ReactThreeFiber.Color
    thicknessFactor: number
    onPointerDown: (e) => void
    hover: (e) => void
}
const Head: React.FC<HeadProps> = ({
    position,
    direction,
    color = '#3761fa',
    thicknessFactor,
    onPointerDown,
    hover,
}) => {
    const onUpdate = (self: THREE.Mesh) => {
        const curDir = calCurrentDirection(self)
        const _dir =
            direction instanceof THREE.Vector3
                ? direction.clone().normalize()
                : new THREE.Vector3().fromArray(direction).normalize()
        const quaternion = new THREE.Quaternion()
        quaternion.setFromUnitVectors(curDir, _dir)
        self.applyQuaternion(quaternion)
        self.updateMatrixWorld()
    }

    return (
        <mesh
            onUpdate={onUpdate}
            onPointerDown={onPointerDown}
            onPointerOver={(e) => {
                e.stopPropagation()
                hover(true)
            }}
            onPointerOut={(e) => {
                // e.stopPropagation();
                hover(false)
            }}
            position={position}
        >
            <customCylinderBufferGeometry
                attach="geometry"
                args={[
                    {
                        radiusTop: 0,
                        radiusBottom: thicknessFactor * HRADIUS,
                        height: thicknessFactor * HHEIGHT,
                        radialSegments: 30,
                        heightSegments: 1,
                        drawingMode: 'static',
                    },
                ]}
            />
            <meshBasicMaterial attach="material" color={color} />
        </mesh>
    )
}

// vector component:
interface VectorProps {
    vector: THREE.Vector3 | [number, number, number]
    origin?: THREE.Vector3 | [number, number, number]
    thicknessFacor?: number
    color?: ReactThreeFiber.Color
    label?: string
    onPointerDown?: (e) => void
}
const Vector: React.RefForwardingComponent<
    JSX.IntrinsicElements,
    VectorProps
> = (
    {
        vector,
        color,
        origin = ORIGIN,
        thicknessFacor = 0.12,
        label,
        onPointerDown,
    },
    ref
) => {
    // NOTE: just for testing
    //   const [clicked, toggle] = useState<boolean>(false);

    const { _mag, _dir } = useMemo(() => {
        const _vector =
            vector instanceof THREE.Vector3
                ? vector.clone()
                : new THREE.Vector3(vector[0], vector[1], vector[2])

        const _mag = _vector.length()
        const _dir = _vector.normalize().toArray() as [number, number, number]
        return { _mag, _dir }
    }, [vector])

    // const [{ newDir, mag }, set] = useSpring(() => ({
    //     newDir: _dir,
    //     mag: _mag,
    // }))
    // calculate the proper location of head based on direction and magnitude
    const headPos = new THREE.Vector3()
        .fromArray(_dir)
        .normalize()
        .multiplyScalar(_mag - thicknessFacor * HHEIGHT)
        .toArray() as [number, number, number]

    const [hovered, hover] = useState<boolean>(false)
    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto'
    }, [hovered])
    return (
        <group ref={ref} position={origin}>
            <Shaft
                mag={_mag - thicknessFacor * HHEIGHT} // we have to change the lenght a little bit to make room for head!
                direction={_dir}
                color={color}
                onPointerDown={onPointerDown}
                thicknessFactor={thicknessFacor}
                hover={hover}
            />
            <Head
                position={headPos}
                direction={_dir}
                color={color}
                thicknessFactor={thicknessFacor}
                onPointerDown={onPointerDown}
                hover={hover}
            />
            {label && (
                <HTML position={headPos}>
                    <p
                        style={{
                            padding: '0 .6rem 0 .6rem',
                            margin: '-1rem auto auto auto',
                            fontFamily: 'KaTex_Math',
                            fontSize: '1.3rem',
                            fontStyle: 'italic',
                        }}
                    >
                        {label}
                    </p>
                </HTML>
            )}
            {/* <axesHelper args={[1.5]} /> */}
        </group>
    )
}

export default React.forwardRef(Vector)
