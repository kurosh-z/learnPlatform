import React, { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { HTML } from 'drei'
import { ScaleLinear } from 'd3-scale'
import { useSprings, animated } from 'react-spring'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { Vector, AVector, AnimatedVecProps } from './Vector'
import { ORIGIN, PI } from './constants'

// axes tick component
const calTicksRotation: (
    axes: 'xAxes' | 'yAxes' | 'zAxes'
) => [number, number, number] = (axes) =>
    ({
        xAxes: [0, 0, 0],
        yAxes: [0, 0, PI / 2],
        zAxes: [0, 0, PI / 2],
    }[axes] as [number, number, number])

const calTickPosition: (
    axes: 'xAxes' | 'yAxes' | 'zAxes',
    val: number
) => [number, number, number] = (axes, val) =>
    ({
        xAxes: [val, 0, 0],
        yAxes: [0, val, 0],
        zAxes: [0, 0, val],
    }[axes] as [number, number, number])

export const calAxesVector = (axes: 'xAxes' | 'yAxes' | 'zAxes', val: number) =>
    ({
        xAxes: [val, 0, 0],
        yAxes: [0, val, 0],
        zAxes: [0, 0, val],
    }[axes] as [number, number, number])

const defaultcolors = {
    xAxes: 'rgb(255, 127, 14)', // orange
    yAxes: 'rgb(23, 227, 57)', //green
    zAxes: 'rgb(0,128,255)', // blue
}

type TickProps = {
    axes: 'xAxes' | 'yAxes' | 'zAxes'
    thickness?: number
    length?: number
    opacity?: number
    transparent?: boolean
    color?: string
    tickValues: number[]
    showTickValues: boolean
    axesThickness?: number // asexThickness to change tick's length accordingly!
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    scale: ScaleLinear<number, number>
    visible?: boolean
}
// TODO: find a way to calculates margins and position of tick values base on 2d plane (xy ...) and one for general 3d view

const AxesTick: React.FC<TickProps> = ({
    axes,
    thickness = 0.005,
    length = 0.15,
    tickValues,
    showTickValues,
    axesThickness = 1,
    color = 'black',
    opacity = 1,
    transparent = false,
    scale,
    format,
    visible = true,
}) => {
    const tickrotation = useMemo(() => calTicksRotation(axes), [axes])
    // it just a trick to make length of zero value possible!
    const _length = length === 0 ? 0.001 : length
    const _visible = length === 0 ? false : visible
    return (
        <group>
            {tickValues.map((val, idx) => {
                return (
                    <group key={idx}>
                        <mesh
                            position={calTickPosition(axes, scale(val))}
                            rotation={tickrotation}
                            visible={_visible}
                        >
                            <cylinderBufferGeometry
                                attach="geometry"
                                args={[
                                    thickness,
                                    thickness,
                                    _length * axesThickness,
                                    20,
                                ]}
                            />
                            <meshBasicMaterial
                                attach="material"
                                color={color}
                                opacity={opacity}
                                transparent={transparent}
                            />
                        </mesh>

                        {showTickValues && (
                            <HTML position={calTickPosition(axes, scale(val))}>
                                <span
                                    className="axes__tick"
                                    style={{
                                        fontFamily: 'KaTex_Main',
                                        opacity: opacity,
                                        fontSize: '.8rem',
                                        margin: '.4rem .1rem auto .1rem',
                                        position: 'absolute',
                                        left:
                                            axes === 'xAxes'
                                                ? '-.3rem'
                                                : '-1.2rem',
                                        top: axes === 'yAxes' ? '-1rem' : 0,
                                    }}
                                >
                                    {format(val)}
                                </span>
                            </HTML>
                        )}
                    </group>
                )
            })}
        </group>
    )
}

const AnimTicks = animated(AxesTick)
// Animated AxesTick
export type AnimatedTickProps = Partial<
    Pick<
        TickProps,
        | 'color'
        | 'thickness'
        | 'length'
        | 'opacity'
        | 'axesThickness'
        | 'visible'
    >
>
type AaxesTickProps = {
    from: AnimatedTickProps
    pause: boolean
    setSpringsRef?: React.MutableRefObject<SpringStartFn<AnimatedTickProps>>
} & Omit<TickProps, keyof AnimatedTickProps>

export const AaxesTick: React.FC<AaxesTickProps> = ({
    from,
    pause,
    tickValues,
    setSpringsRef,
    children,
    ...rest
}) => {
    if (children) {
        throw new Error('AxesTick Component accepts no children')
    }
    const spRf = useRef<SpringHandle<AnimatedTickProps>>(null)
    const {
        color = 'black',
        thickness = 0.005,
        opacity = 1,
        length = 0.15,
        axesThickness = 1,
        visible = true,
    } = from

    const [springs, setSprings] = useSprings(tickValues.length, (i) => ({
        ref: spRf,
        length: 0.1,
        opacity: 1,

        // from: {
        //     color,
        //     opacity,
        //     thickness,
        //     length,
        //     axesThickness,
        //     visible,
        // },
    }))
    useEffect(() => {
        setSpringsRef.current = setSprings
        setSprings((i) => ({
            length: 1,
            delay: 240 * i,
            config: { friction: 30, mass: 2, tension: 40 },
        }))
    }, [pause])

    useEffect(() => {
        if (pause && spRf.current) {
            spRf.current.pause()
        }
    }, [pause])

    return (
        <>
            {springs.map((animprops, idx: number) => {
                return (
                    <AnimTicks
                        key={idx}
                        tickValues={tickValues}
                        {...animprops}
                        {...rest}
                    />
                )
            })}
        </>
    )
}

// Axes component:

interface AxesProps {
    axes: 'xAxes' | 'yAxes' | 'zAxes'
    length?: number
    color?: string
    opacity?: number
    showlabel?: boolean
    origin?: THREE.Vector3
    transparent?: boolean
    thicknessFactor?: number
    scale: ScaleLinear<number, number>
    showTickValues?: boolean
    visible?: boolean
    tickValues?: number[]
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
}

export const Axes: React.FC<AxesProps> = ({
    axes,
    color,
    opacity = 1,
    transparent = false, //TODO: impleement transparancy in all subcomponents!
    origin = ORIGIN,
    thicknessFactor = 0.8,
    scale,
    length,
    tickValues,
    showTickValues = false,
    showlabel = true,
    format,
    visible = true,
}) => {
    return (
        <group>
            <Vector
                vector={calAxesVector(
                    axes,
                    length ? length : scale(tickValues.slice(-1)[0])
                )}
                color={color ? color : defaultcolors[axes]}
                origin={origin}
                thicknessFactor={thicknessFactor}
                opacity={opacity}
                visible={visible}
            />
            {tickValues && (
                <AxesTick
                    tickValues={tickValues}
                    axes={axes}
                    scale={scale}
                    format={format}
                    axesThickness={thicknessFactor}
                    showTickValues={showTickValues}
                    opacity={opacity}
                    visible={visible}
                />
            )}
            {showlabel && (
                <HTML
                    position={calAxesVector(
                        axes,
                        length ? length : scale(tickValues.slice(-1)[0])
                    )}
                    visible={visible}
                >
                    <div
                        style={{
                            padding: '0 .2rem 0 .3rem',
                            margin: '-1rem auto auto auto',
                            fontFamily: 'KaTex_Math',
                            fontSize: '1.3rem',
                            fontStyle: 'italic',
                            position: 'absolute',
                            opacity: opacity,
                            // backgroundColor: 'yellow',
                        }}
                    >
                        {axes.charAt(0)}
                    </div>
                </HTML>
            )}
        </group>
    )
}

export type SetAxes = SpringStartFn<Partial<AnimatedVecProps>>
export type SetTick = SpringStartFn<Partial<AnimatedTickProps>>
type AaxesProps = {
    tickFrom: AnimatedTickProps
    axesFrom: AnimatedVecProps
    pause: boolean
    setAxesRef?: React.MutableRefObject<SetAxes>
    setTickRef?: React.MutableRefObject<SetTick>
    tickValues: number[]
    axes: AxesProps['axes']
    scale: AxesProps['scale']
    format: AxesProps['format']
    showTickValues: AxesProps['showTickValues']
    showlabel?: AxesProps['showlabel']
}

export const Aaxes: React.FC<AaxesProps> = ({
    axesFrom,
    tickFrom,
    pause,
    setAxesRef,
    setTickRef,
    tickValues,
    axes,
    scale,
    format,
    showTickValues,
    showlabel,
}) => {
    const vecStarFnRef = useRef<SpringStartFn<AnimatedVecProps>>(null)
    const tickStarFnRef = useRef<SpringStartFn<AnimatedTickProps>>(null)

    useEffect(() => {
        if (setAxesRef) {
            setAxesRef.current = vecStarFnRef.current
        }
        if (setTickRef) {
            setTickRef.current = tickStarFnRef.current
        }
    }, [])

    return (
        <group>
            <AVector
                from={{
                    vector: axesFrom['vector']
                        ? axesFrom.vector
                        : calAxesVector(axes, 3),
                    color: axesFrom['color']
                        ? axesFrom.color
                        : defaultcolors[axes],
                    origin: axesFrom.origin,
                    thicknessFactor: axesFrom.thicknessFactor,
                    opacity: axesFrom.opacity,
                    visible: axesFrom['visible'],
                }}
                pause={pause}
                setSpringRef={vecStarFnRef}
            />

            {tickValues && (
                <AaxesTick
                    from={{
                        color: tickFrom['color'] ? tickFrom.color : 'black',
                        opacity: 'opacity' in tickFrom ? tickFrom.opacity : 1,
                        thickness:
                            'thickness' in tickFrom
                                ? tickFrom.thickness
                                : 0.005,
                        axesThickness:
                            'thicknessFactor' in axesFrom
                                ? axesFrom.thicknessFactor
                                : 1,
                        length: tickFrom['length'],
                        visible: tickFrom.visible,
                    }}
                    tickValues={tickValues}
                    axes={axes}
                    scale={scale}
                    format={format}
                    showTickValues={showTickValues}
                    pause={pause}
                    setSpringsRef={tickStarFnRef}
                />
            )}
            {/* TODO: create Animated version of HTML component! */}
            {showlabel && (
                <HTML
                    position={calAxesVector(
                        axes,
                        length ? length : scale(tickValues.slice(-1)[0])
                    )}
                >
                    <div
                        style={{
                            padding: '0 .2rem 0 .3rem',
                            margin: '-1rem auto auto auto',
                            fontFamily: 'KaTex_Math',
                            fontSize: '1.3rem',
                            fontStyle: 'italic',
                            position: 'absolute',
                            // backgroundColor: 'yellow',
                        }}
                    >
                        {axes.charAt(0)}
                    </div>
                </HTML>
            )}
        </group>
    )
}
