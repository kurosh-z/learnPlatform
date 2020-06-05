/* eslint-disable @typescript-eslint/no-namespace */
import React, { useState, useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { HTML } from 'drei'
import { ReactThreeFiber, extend } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry'
import { ORIGIN } from './constants'
import { Point } from './Point'
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
type ShaftProps = {
    mag: number
    direction: THREE.Vector3 | number[]
    color?: ReactThreeFiber.Color
    opacity?: number
    thicknessFactor: number
    visibile?: boolean
    transparent?: boolean
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
    visibile = true,
    transparent = false,
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
            visible={visibile}
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
                transparent={transparent}
            />
        </mesh>
    )
}

// Head component:
type HeadProps = {
    position: [number, number, number]
    direction: THREE.Vector3 | [number, number, number]
    color?: ReactThreeFiber.Color
    opacity?: number
    thicknessFactor: number
    onPointerDown: (e) => void
    hover: (e) => void
    visible: boolean
    transparent: boolean
}
const Head: React.FC<HeadProps> = ({
    position,
    direction,
    color = '#3761fa',
    opacity = 1,
    thicknessFactor,
    onPointerDown,
    hover,
    visible = true,
    transparent = false,
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
            visible={visible}
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
                transparent={transparent}
            />
        </mesh>
    )
}

// vector component:
export type VectorProps = {
    vector: THREE.Vector3 | [number, number, number]
    origin?: THREE.Vector3 | [number, number, number]
    thicknessFactor?: number
    color?: string
    opacity?: number
    label?: string
    latexParser?: boolean
    labelStyle?: React.CSSProperties
    onPointerDown?: (e) => void
    visible?: boolean
    transparent?: boolean
}

const VectorI: React.RefForwardingComponent<
    JSX.IntrinsicElements,
    VectorProps
> = (
    {
        vector,
        color,
        origin = ORIGIN,
        opacity = 1,
        thicknessFactor = 0.12,
        label,
        labelStyle,
        latexParser = false,
        onPointerDown,
        visible,
        transparent = false,
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
        .multiplyScalar(_mag - thicknessFactor * HHEIGHT)
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
                    visible={visible}
                    position={sMultiply(
                        (_mag - 3 * thicknessFactor * HHEIGHT) / 2,
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
    }, [headPos, label, latexParser, labelStyle, opacity, visible])

    // if magnitude of the vector is less than the headsize just return a point at origin
    return (
        <group ref={ref} position={origin}>
            {_mag >= thicknessFactor * HHEIGHT ? (
                <>
                    <Shaft
                        mag={_mag - thicknessFactor * HHEIGHT} // we have to change the lenght a little bit to make room for head!
                        direction={_dir}
                        color={color}
                        opacity={opacity}
                        onPointerDown={onPointerDown}
                        thicknessFactor={thicknessFactor}
                        hover={hover}
                        visibile={visible}
                        transparent={transparent}
                    />
                    <Head
                        position={headPos}
                        direction={_dir}
                        color={color}
                        opacity={opacity}
                        thicknessFactor={thicknessFactor}
                        onPointerDown={onPointerDown}
                        hover={hover}
                        visible={visible}
                        transparent={transparent}
                    />
                </>
            ) : (
                <Point
                    color={color}
                    position={[ORIGIN.x, ORIGIN.y, ORIGIN.z]}
                    opacity={opacity}
                    transparent={transparent}
                    pkey={'zero_vector'}
                    visible={visible}
                />
            )}
            {labelComp}
        </group>
    )
}

export const Vector = React.forwardRef(VectorI)

type VectorCompProps = Omit<VectorProps, 'labelStyle' | 'latexParser'> & {
    label_transform?: string
}

const VectorComp: React.FC<VectorCompProps> = ({
    label,
    vector,
    origin,
    color,
    opacity,
    thicknessFactor,
    label_transform,
    transparent,
    visible,
}) => {
    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        transform: label_transform,
        opacity: opacity,
        willChange: 'opacity, transform',
    }

    return (
        <Vector
            vector={vector}
            origin={origin}
            color={color}
            opacity={opacity}
            thicknessFactor={thicknessFactor}
            label={label ? String.raw`\vec{${label}}` : null}
            labelStyle={labelStyle}
            latexParser
            transparent={transparent}
            visible={visible}
        />
    )
}

const AVectorComp = animated(VectorComp)

export type AnimatedVecProps = Partial<
    Pick<
        VectorCompProps,
        | 'vector'
        | 'origin'
        | 'color'
        | 'label'
        | 'thicknessFactor'
        | 'opacity'
        | 'label_transform'
        | 'visible'
    >
>
// & {
//     label_transform: string
// }
export type AvectorProps = {
    from: AnimatedVecProps
    setSpringRef?: React.MutableRefObject<SpringStartFn<AnimatedVecProps>>
    pause: boolean
} & Omit<VectorCompProps, keyof AnimatedVecProps>

export const AVector: React.FC<AvectorProps> = ({
    pause,
    setSpringRef,
    from,
    ...rest
}) => {
    const spRef = useRef<SpringHandle<AnimatedVecProps>>(null)
    const [spring, setSpring] = useSpring<AnimatedVecProps>(() => ({
        ref: spRef,
        from: {
            vector: from.vector,
            origin: from['origin'] ? from.origin : ORIGIN,
            opacity: 'opacity' in from ? from.opacity : 1,
            color: from['color'] ? from.color : 'blue',
            thicknessFactor: from['thicknessFactor'] ? from.thicknessFactor : 1,
            label: from['label'] ? from.label : '',
            label_transform: from['label_transform']
                ? from.label_transform
                : 'translate(0px,0px)',
            visible: from['visible'],
        },
    }))

    useEffect(() => {
        if (setSpringRef) {
            setSpringRef.current = setSpring
        }
    }, [])

    useEffect(() => {
        if (pause && spRef.current) spRef.current.pause()
    }, [pause])

    return <AVectorComp {...spring} {...rest} />
}
