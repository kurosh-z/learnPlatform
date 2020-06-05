/* eslint-disable @typescript-eslint/no-namespace */
import React, { useState, useMemo, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { HTML } from 'drei'
import { ReactThreeFiber, extend } from 'react-three-fiber'
import { useSpring, animated } from 'react-spring'
import { SpringHandle, SpringStartFn, SpringValues } from '@react-spring/core'
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry'
import { ORIGIN } from './constants'
import { Point } from './Point'
import { Latex } from '../math-components'
import { sMultiply, addVectors } from '../shared'

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
                if (hover) hover(true)
            }}
            onPointerOut={(e) => {
                // e.stopPropagation();
                if (hover) hover(false)
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
                if (hover) hover(true)
            }}
            onPointerOut={(e) => {
                // e.stopPropagation();
                if (hover) hover(false)
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

type VlableProps = {
    position: HeadProps['position']
    label: string
    labelID: string
    latexParser: boolean
    labelStyle: React.CSSProperties
    label2ndStyle: React.CSSProperties
    label_transform: string
    opacity: number
    visible: boolean
}
const Vlable: React.FC<VlableProps> = ({
    position,
    label,
    latexParser,
    labelStyle,
    label2ndStyle,
    label_transform,
    opacity,
    visible,
    labelID,
}) => {
    if (!label) return <HTML />
    if (latexParser && labelID && label) {
        return (
            <HTML position={position}>
                <Latex
                    math_formula={label}
                    font_size={1.4}
                    style={labelStyle}
                    svgTransform={label_transform}
                    // style={{
                    //     ...labelStyle,
                    //     visibility: visible ? 'visible' : 'hidden', // to make sure the label it's not goint to be visible if vector
                    //     // itself is not visible
                    // }}
                >
                    <Latex.Anim id={labelID} style={label2ndStyle} />
                </Latex>
            </HTML>
        )
    } else if (label && latexParser === false) {
        return (
            <HTML position={position}>
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
                                  visibility: visible ? 'visible' : 'hidden',
                              }
                    }
                >
                    {label}
                </span>
            </HTML>
        )
    }
}
// vector component:
export type VectorProps = {
    vector: THREE.Vector3 | [number, number, number]
    origin?: THREE.Vector3 | [number, number, number]
    thicknessFactor?: number
    color?: string
    opacity?: number
    label?: string
    labelID?: string
    latexParser?: boolean
    labelStyle?: React.CSSProperties
    label2ndStyle?: React.CSSProperties
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
        label2ndStyle,
        labelID,
        latexParser = false,
        onPointerDown,
        visible,
        transparent = false,
    },
    ref
) => {
    const { _mag, _dir } = useMemo(() => {
        const _vector =
            vector instanceof THREE.Vector3
                ? vector.clone()
                : new THREE.Vector3(vector[0], vector[1], vector[2])

        const _mag = _vector.length()
        const _dir = _vector.normalize().toArray() as [number, number, number]
        return { _mag, _dir }
    }, [vector])

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
    const vecLabel = useMemo(() => {
        if (label && latexParser) {
            return (
                <HTML
                    position={sMultiply(
                        (_mag - 3 * thicknessFactor * HHEIGHT) / 2,
                        _dir
                    )}
                >
                    <Latex
                        math_formula={label}
                        font_size={1.4}
                        svgTransform={labelStyle.transform}
                        style={{ ...labelStyle }}
                        // style={{
                        //     ...labelStyle,
                        //     visibility: visible ? 'visible' : 'hidden', // to make sure the label it's not goint to be visible if vector
                        //     // itself is not visible
                        // }}
                    >
                        <Latex.Anim id={labelID} style={label2ndStyle} />
                    </Latex>
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
    }, [label, labelID, labelStyle, label2ndStyle, opacity])
    return (
        <group ref={ref} position={origin}>
            <Head
                position={headPos}
                direction={_dir}
                color={color}
                opacity={opacity}
                thicknessFactor={thicknessFactor}
                onPointerDown={onPointerDown}
                hover={hover}
                visible={visible && _mag >= thicknessFactor * HHEIGHT}
                transparent={transparent}
            />
            <Shaft
                mag={_mag - thicknessFactor * HHEIGHT} // we have to change the lenght a little bit to make room for head!
                direction={_dir}
                color={color}
                opacity={opacity}
                onPointerDown={onPointerDown}
                thicknessFactor={thicknessFactor}
                hover={hover}
                visibile={visible && _mag >= thicknessFactor * HHEIGHT}
                transparent={transparent}
            />
            <Point
                color={color}
                position={[ORIGIN.x, ORIGIN.y, ORIGIN.z]}
                opacity={opacity}
                transparent={transparent}
                pkey={'zero_vector'}
                visible={visible && _mag < thicknessFactor * HHEIGHT}
            />
            {vecLabel}
            {/* {label && (
                <Vlable
                    position={
                        Math.abs(_mag - 0.01) > 0
                            ? sMultiply(_mag / 3, _dir)
                            : [0, 0, 0]
                    }
                    label={label}
                    labelID={labelID}
                    labelStyle={labelStyle}
                    label2ndStyle={label2ndStyle}
                    latexParser={latexParser}
                    visible={visible}
                    opacity={opacity}
                />
            )} */}
        </group>
    )
}

export const Vector = React.forwardRef(VectorI)

function calculateLabel(
    label: string,
    label_factor: number,
    labelID: string,
    format: (a: number) => string
): string {
    if (label === undefined || label === null) {
        return label
    }
    if (label_factor === undefined || label_factor === null)
        return String.raw`\vec{${label}}`
    else {
        const _label_factor = format(label_factor)
        return String.raw`\anim<${labelID}>{${_label_factor}}\vec{${label}}`
    }
}

export type VectorCompProps = Omit<
    VectorProps,
    'labelStyle' | 'latexParser' | 'label2ndStyle'
> & {
    label_transform?: string
    label2ndStylefn?: (
        args: Pick<
            VectorCompProps,
            'opacity' | 'label' | 'label_factor' | 'label_opacity'
        >
    ) => React.CSSProperties
    label_factor?: number //optional labling a scaler factor which a vector changes with
    factor_format?: (
        // optional formating fucntion for the factor
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    label_opacity?: number
    pointForZero?: boolean
}

export const VectorComp: React.FC<VectorCompProps> = ({
    label,
    vector,
    origin,
    color,
    opacity,
    thicknessFactor,
    label_transform,
    label_factor,
    factor_format,
    labelID,
    label2ndStylefn,
    label_opacity = 1,
    transparent = true,
    visible,
    pointForZero = true,
}) => {
    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        overflow: 'visible',
        // transform: label_transform,
        opacity: label_opacity,
        willChange: 'opacity, transform',
    }
    const _format = useMemo(() => {
        return factor_format ? factor_format : (n) => n
    }, [factor_format])

    const _label = calculateLabel(label, label_factor, labelID, _format)

    const label2ndStyle = label2ndStylefn
        ? label2ndStylefn({
              label,
              label_factor,
              label_opacity,
              opacity,
          })
        : null

    const { _mag, _dir } = useMemo(() => {
        const _vector =
            vector instanceof THREE.Vector3
                ? vector.clone()
                : new THREE.Vector3(vector[0], vector[1], vector[2])

        const _mag = _vector.length()
        const _dir = _vector.normalize().toArray() as [number, number, number]
        return { _mag, _dir }
    }, [vector])

    // calculate the proper location of head based on direction and magnitude
    const headPos = new THREE.Vector3()
        .fromArray(_dir)
        .normalize()
        .multiplyScalar(_mag - thicknessFactor * HHEIGHT)
        .toArray() as [number, number, number]
    return (
        <group
            //  ref={ref}
            position={origin}
        >
            <Head
                position={headPos}
                direction={_dir}
                color={color}
                opacity={opacity}
                thicknessFactor={thicknessFactor}
                // onPointerDown={onPointerDown}
                // hover={hover}
                visible={visible && _mag >= thicknessFactor * HHEIGHT}
                transparent={transparent}
            />
            <Shaft
                mag={_mag - thicknessFactor * HHEIGHT} // we have to change the lenght a little bit to make room for head!
                direction={_dir}
                color={color}
                opacity={opacity}
                // onPointerDown={onPointerDown}
                thicknessFactor={thicknessFactor}
                // hover={hover}
                visibile={visible && _mag >= thicknessFactor * HHEIGHT}
                transparent={transparent}
            />
            {pointForZero && (
                <Point
                    color={color}
                    position={[ORIGIN.x, ORIGIN.y, ORIGIN.z]}
                    opacity={opacity}
                    transparent={transparent}
                    pkey={'zero_vector'}
                    visible={visible && _mag < thicknessFactor * HHEIGHT}
                />
            )}

            <Vlable
                position={sMultiply(_mag / 3, _dir)}
                label={_label}
                labelID={labelID}
                labelStyle={labelStyle}
                label2ndStyle={label2ndStyle}
                latexParser={true}
                visible={visible}
                opacity={opacity}
                label_transform={label_transform}
            />
        </group>
        // <Vector
        //     vector={vector}
        //     origin={origin}
        //     color={color}
        //     opacity={opacity}
        //     thicknessFactor={thicknessFactor}
        //     label={_label}
        //     labelID={labelID}
        //     labelStyle={labelStyle}
        //     label2ndStyle={label2ndStyle}
        //     latexParser
        //     transparent={transparent}
        //     visible={visible}
        // />
    )
}

export const AVectorComp = animated(VectorComp)

export type AnimatedVecProps = Partial<
    Pick<
        VectorCompProps,
        | 'vector'
        | 'origin'
        | 'color'
        | 'label_factor'
        | 'thicknessFactor'
        | 'opacity'
        | 'label_transform'
        | 'label_opacity'
        | 'visible'
    >
>

export type SetVector = SpringStartFn<AnimatedVecProps>
export type AvectorProps = {
    from: AnimatedVecProps
    setSpringRef?: React.MutableRefObject<SpringStartFn<AnimatedVecProps>>
    pause: boolean
    springRef?: React.MutableRefObject<SpringValues<AnimatedVecProps>>
} & Omit<VectorCompProps, keyof AnimatedVecProps>

export const AVector: React.FC<AvectorProps> = ({
    pause,
    setSpringRef,
    springRef,
    from,
    ...rest
}) => {
    const spRef = useRef<SpringHandle<AnimatedVecProps>>(null)
    const [spring, setSpring] = useSpring<AnimatedVecProps>(() => ({
        ref: spRef,
        from: {
            vector: from.vector,
            origin: from['origin'] ? from.origin : ORIGIN.toArray(),
            opacity: 'opacity' in from ? from.opacity : 1,
            color: from['color'] ? from.color : 'blue',
            thicknessFactor: from['thicknessFactor'] ? from.thicknessFactor : 1,
            label_factor: from['label_factor'],
            label_transform: from['label_transform']
                ? from.label_transform
                : 'translate(0rem,0rem)',
            label_opacity: from.label_opacity,
            visible: from['visible'],
        },
    }))
    if (springRef) {
        springRef.current = spring
    }
    useEffect(() => {
        if (setSpringRef) {
            if (setSpringRef) {
                setSpringRef.current = setSpring
            }
        }
    }, [])

    useEffect(() => {
        if (pause && spRef.current) spRef.current.pause()
    }, [pause])

    return <AVectorComp {...spring} {...rest} />
}
