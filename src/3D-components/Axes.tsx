import React, { useMemo } from 'react'
import * as THREE from 'three'
import { ReactThreeFiber } from 'react-three-fiber'
import { HTML } from 'drei'
import { ScaleLinear } from 'd3-scale'
import Vector from './Vector'
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

const calAxesVector = (axes: 'xAxes' | 'yAxes' | 'zAxes', val: number) =>
    ({
        xAxes: [val, 0, 0],
        yAxes: [0, val, 0],
        zAxes: [0, 0, val],
    }[axes])

const defaultcolors = {
    xAxes: 'rgb(255, 127, 14)', // orange
    yAxes: 'rgb(23, 227, 57)', //green
    zAxes: 'rgb(0,128,255)', // blue
}

interface TickProps {
    axes: 'xAxes' | 'yAxes' | 'zAxes'
    thickness?: number
    length?: number
    color?: ReactThreeFiber.Color
    tickValues: number[]
    showTickValues: boolean
    axesThickness: number
    axesLength?: number
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    scale: ScaleLinear<number, number>
}
// TODO: find a way to calculates margins and position of tick values base on 2d plane (xy ...) and one for general 3d view

const AxesTick: React.FC<TickProps> = ({
    axes,
    thickness = 0.005,
    length = 0.15,
    tickValues,
    showTickValues,
    axesThickness,
    color = 'black',
    scale,
    format,
}) => {
    const tickrotation = useMemo(() => calTicksRotation(axes), [axes])

    return (
        <group>
            {tickValues.map((val, idx) => {
                return (
                    <group key={idx}>
                        <mesh
                            position={calTickPosition(axes, scale(val))}
                            rotation={tickrotation}
                        >
                            <cylinderBufferGeometry
                                attach="geometry"
                                args={[
                                    thickness,
                                    thickness,
                                    length * axesThickness,
                                    20,
                                ]}
                            />
                            <meshBasicMaterial
                                attach="material"
                                color={color}
                            />
                        </mesh>

                        {showTickValues && (
                            <HTML position={calTickPosition(axes, scale(val))}>
                                <span
                                    className="axes__tick"
                                    style={{
                                        fontFamily: 'KaTex_Main',
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

// Axes component:

interface AxesProps {
    axes: 'xAxes' | 'yAxes' | 'zAxes'
    length?: number
    color?: ReactThreeFiber.Color
    showlabel?: boolean
    origin?: THREE.Vector3
    thicknessFactor?: number
    scale: ScaleLinear<number, number>
    showTickValues?: boolean
    tickValues?: number[]
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
}

const Axes: React.FC<AxesProps> = ({
    axes,
    color,
    origin = ORIGIN,
    thicknessFactor = 0.8,
    scale,
    length,
    tickValues,
    showTickValues = false,
    showlabel = true,
    format,
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
                thicknessFacor={thicknessFactor}
            />
            {tickValues && (
                <AxesTick
                    tickValues={tickValues}
                    axes={axes}
                    scale={scale}
                    format={format}
                    axesThickness={thicknessFactor}
                    showTickValues={showTickValues}
                />
            )}
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

export default Axes
