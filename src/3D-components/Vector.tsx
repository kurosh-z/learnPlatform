/* eslint-disable @typescript-eslint/no-namespace */
import React, { useState, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { HTML } from 'drei'
import { ReactThreeFiber, extend } from 'react-three-fiber'
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry'
import { ORIGIN } from './constants'
import Point from './Point'
import { Latex } from '../math-components'
import { sMultiply } from '../shared'

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
const HRADIUS = 0.07
const HHEIGHT = 0.1
const SRADIUS = 0.02

// shaft component:
interface ShaftProps {
    mag: number
    direction: THREE.Vector3 | number[]
    color?: ReactThreeFiber.Color
    opacity?: number
    thicknessFactor: number
    onPointerDown?: (e) => void
    hover?: (hoverd: boolean) => void
}
const Shaft: React.FC<ShaftProps> = ({
    mag,
    direction,
    color = '#3761fa',
    opacity = 1,
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
            <meshStandardMaterial
                attach="material"
                color={color}
                opacity={opacity}
                transparent
            />
        </mesh>
    )
}

// Head component:
interface HeadProps {
    position: [number, number, number]
    direction: THREE.Vector3 | [number, number, number]
    color?: ReactThreeFiber.Color
    opacity?: number
    thicknessFactor: number
    onPointerDown: (e) => void
    hover: (e) => void
}
const Head: React.FC<HeadProps> = ({
    position,
    direction,
    color = '#3761fa',
    opacity = 1,
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
            <meshStandardMaterial
                attach="material"
                color={color}
                opacity={opacity}
                transparent
            />
        </mesh>
    )
}

// vector component:
export interface VectorProps {
    vector: THREE.Vector3 | [number, number, number]
    origin?: THREE.Vector3 | [number, number, number]
    thicknessFacor?: number
    color?: ReactThreeFiber.Color
    opacity?: number
    label?: string
    latexParser?: boolean
    labelStyle?: React.CSSProperties
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
        opacity = 1,
        thicknessFacor = 0.12,
        label,
        labelStyle,
        latexParser = false,
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

    // console.log('vector')
    const labelComp = useMemo(() => {
        if (label && latexParser) {
            return (
                <HTML
                    position={sMultiply(
                        (_mag - 3 * thicknessFacor * HHEIGHT) / 2,
                        _dir
                    )}
                >
                    <Latex
                        math_formula={label}
                        font_size={1.4}
                        style={labelStyle}
                        // style={{
                        //     position: 'absolute',
                        //     // transform: 'translate(-2.5rem, 2.5rem)',
                        //     opacity: opacity,
                        // }}
                    />
                </HTML>
            )
        } else if (label && latexParser === false) {
            return (
                <HTML position={sMultiply(0.5, headPos)}>
                    <span
                        style={
                            labelStyle
                                ? labelStyle
                                : {
                                      padding: '0 .6rem 0 .6rem',
                                      margin: '-1rem auto auto auto',
                                      fontFamily: 'KaTex_Math',
                                      fontSize: '1.4rem',
                                      fontStyle: 'italic',
                                      opacity: opacity,
                                  }
                        }
                    >
                        {label}
                    </span>
                </HTML>
            )
        }
    }, [headPos, label, latexParser, labelStyle, opacity])

    // if magnitude of the vector is less than the headsize just return a point at origin
    return (
        <group ref={ref} position={origin}>
            {_mag > thicknessFacor * HHEIGHT ? (
                <>
                    <Shaft
                        mag={_mag - thicknessFacor * HHEIGHT} // we have to change the lenght a little bit to make room for head!
                        direction={_dir}
                        color={color}
                        opacity={opacity}
                        onPointerDown={onPointerDown}
                        thicknessFactor={thicknessFacor}
                        hover={hover}
                    />
                    <Head
                        position={headPos}
                        direction={_dir}
                        color={color}
                        opacity={opacity}
                        thicknessFactor={thicknessFacor}
                        onPointerDown={onPointerDown}
                        hover={hover}
                    />
                </>
            ) : (
                <Point
                    color={color}
                    position={[ORIGIN.x, ORIGIN.y, ORIGIN.z]}
                    opacity={opacity}
                />
            )}
            {labelComp}
        </group>
    )
}

export default React.forwardRef(Vector)
