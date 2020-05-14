import React, { useMemo } from 'react'
import * as THREE from 'three'
import { ReactThreeFiber } from 'react-three-fiber'
import { HTML } from 'drei'
import { ScaleLinear } from 'd3-scale'
import Vector from './Vector'
import { ORIGIN, PI } from './constants'

// axes tick component
const calTicksRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes') =>
    ({
        xAxes: [0, 0, 0],
        yAxes: [0, 0, PI / 2],
        zAxes: [0, 0, PI / 2],
    }[axes])

const calTickPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', val: number) =>
    ({
        xAxes: [val, 0, 0],
        yAxes: [0, val, 0],
        zAxes: [0, 0, val],
    }[axes])

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
    axesThickness: number
    axesLength?: number
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    scale: ScaleLinear<number, number> // TODO: for now its okay, but probably you should make it more general than jsut numbers!
}
// TODO: I used cylincergeometry for ticks becuase fat lines are pretty hacky in threejs and Meshline disapears when it gets zoomed in!

const AxesTick: React.FC<TickProps> = ({
    axes,
    thickness = 0.003,
    length = 0.15,
    tickValues,
    axesThickness,
    color = 'black',
    scale,
    format,
}) => {
    const tickrotation = useMemo(() => calTicksRotation(axes), [axes])

    const ticks = tickValues.map((val, idx) => {
        return (
            <group key={idx}>
                <mesh
                    position={
                        calTickPosition(axes, scale(val)) as [
                            number,
                            number,
                            number
                        ]
                    }
                    rotation={tickrotation as [number, number, number]}
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
                    <meshBasicMaterial attach="material" color={color} />
                </mesh>
                {/* <Dom position={calTickPosition(axes, scale(val))}>
          <div className='tick'>{format(val)}</div>
        </Dom> */}
            </group>
        )
    })

    return <group>{ticks}</group>
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
