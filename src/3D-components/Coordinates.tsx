import React, { useEffect, useRef } from 'react'
import { ScaleLinear } from 'd3-scale'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { useSpring, a } from 'react-spring'
import {
    Aaxes,
    calAxesVector,
    AnimatedTickProps,
    SetAxes,
    SetTick,
} from './Axes'

export type SetCoordinateAxis = {
    xAxes?: React.MutableRefObject<SetAxes>
    yAxes?: React.MutableRefObject<SetAxes>
    zAxes?: React.MutableRefObject<SetAxes>
}
export type SetCoordinateTicks = {
    xAxes?: React.MutableRefObject<SetTick>
    yAxes?: React.MutableRefObject<SetTick>
    zAxes?: React.MutableRefObject<SetTick>
}

type CoordinatesProps = {
    scale: ScaleLinear<number, number>
    tickValues?: number[]
    showTickValues?: { xAxes?: boolean; yAxes?: boolean; zAxes?: boolean }
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    renderAxis?: { xAxes?: boolean; yAxes?: boolean; zAxes?: boolean }
    axisVisiblity?: { xAxes?: boolean; yAxes?: boolean; zAxes?: boolean }
    lengths?: { xAxes?: number; yAxes?: number; zAxes?: number }
    opacity?: { xAxes?: number; yAxes?: number; zAxes?: number }
    colors?: {
        xAxes?: string
        yAxes?: string
        zAxes?: string
    }
    label_transforms?: {
        //TODO: change Axes component to use vector's build-in label
        xAxes?: string
        yAxes?: string
        zAxes?: string
    }
    pause: boolean
    axSetFnRefs: SetCoordinateAxis
    tickSetFnRefs: SetCoordinateTicks
    tickForms?: {
        xAxes?: AnimatedTickProps
        yAxes?: AnimatedTickProps
        zAxes?: AnimatedTickProps
    }
}

export const Coordinates: React.FC<CoordinatesProps> = ({
    scale,
    tickValues,
    format,
    renderAxis = { xAxes: true, yAxes: true, zAxes: true },
    label_transforms = {},
    showTickValues = {},
    lengths = {},
    colors = {},
    opacity = {},
    pause,
    axSetFnRefs = {},
    tickSetFnRefs = {},
    tickForms = {},
    axisVisiblity = {},
}) => {
    return (
        <>
            {renderAxis['xAxes'] && (
                <Aaxes
                    axes="xAxes"
                    scale={scale}
                    tickValues={tickValues}
                    format={format}
                    showTickValues={
                        'xAxes' in showTickValues
                            ? showTickValues['xAxes']
                            : false
                    }
                    axesFrom={{
                        thicknessFactor: 1,
                        vector:
                            'xAxes' in lengths
                                ? calAxesVector('xAxes', lengths['xAxes'])
                                : calAxesVector('xAxes', scale(3)),
                        color: 'xAxes' in colors ? colors['xAxes'] : null,
                        opacity: 'xAxes' in opacity ? opacity['xAxes'] : 1,
                        label_transform:
                            'xAxes' in label_transforms
                                ? label_transforms['xAxes']
                                : 'translate(0px,0px)',
                        visible:
                            'xAxes' in axisVisiblity
                                ? axisVisiblity['xAxes']
                                : true,
                    }}
                    tickFrom={'xAxes' in tickForms ? tickForms['xAxes'] : {}}
                    pause={pause}
                    setTickRef={
                        'xAxes' in tickSetFnRefs ? tickSetFnRefs['xAxes'] : null
                    }
                    setAxesRef={
                        'xAxes' in axSetFnRefs ? axSetFnRefs['xAxes'] : null
                    }
                />
            )}
            {renderAxis['yAxes'] && (
                <Aaxes
                    axes="yAxes"
                    scale={scale}
                    tickValues={tickValues}
                    format={format}
                    showTickValues={
                        'yAxes' in showTickValues
                            ? showTickValues['yAxes']
                            : false
                    }
                    axesFrom={{
                        thicknessFactor: 1,
                        vector:
                            'yAxes' in lengths
                                ? calAxesVector('yAxes', lengths['yAxes'])
                                : calAxesVector('yAxes', scale(3)),
                        color: 'yAxes' in colors ? colors['yAxes'] : null,
                        opacity: 'yAxes' in opacity ? opacity['yAxes'] : 1,
                        label_transform:
                            'yAxes' in label_transforms
                                ? label_transforms['yAxes']
                                : 'translate(0px,0px)',
                        visible:
                            'yAxes' in axisVisiblity
                                ? axisVisiblity['yAxes']
                                : true,
                    }}
                    tickFrom={'yAxes' in tickForms ? tickForms['yAxes'] : {}}
                    pause={pause}
                    setTickRef={
                        'yAxes' in tickSetFnRefs ? tickSetFnRefs['yAxes'] : null
                    }
                    setAxesRef={
                        'yAxes' in axSetFnRefs ? axSetFnRefs['yAxes'] : null
                    }
                />
            )}
            {renderAxis['zAxes'] && (
                <Aaxes
                    axes="zAxes"
                    scale={scale}
                    tickValues={tickValues}
                    format={format}
                    showTickValues={
                        'zAxes' in showTickValues
                            ? showTickValues['zAxes']
                            : false
                    }
                    axesFrom={{
                        thicknessFactor: 1,
                        vector:
                            'zAxes' in lengths
                                ? calAxesVector('zAxes', lengths['zAxes'])
                                : calAxesVector('zAxes', scale(3)),
                        color: 'zAxes' in colors ? colors['zAxes'] : null,
                        opacity: 'zAxes' in opacity ? opacity['zAxes'] : 1,
                        label_transform:
                            'zAxes' in label_transforms
                                ? label_transforms['zAxes']
                                : 'translate(0px,0px)',
                        visible:
                            'zAxes' in axisVisiblity
                                ? axisVisiblity['zAxes']
                                : true,
                    }}
                    tickFrom={'zAxes' in tickForms ? tickForms['zAxes'] : {}}
                    pause={pause}
                    setTickRef={
                        'zAxes' in tickSetFnRefs ? tickSetFnRefs['zAxes'] : null
                    }
                    setAxesRef={
                        'zAxes' in axSetFnRefs ? axSetFnRefs['zAxes'] : null
                    }
                />
            )}
        </>
    )
}

const AnimCoor = a(Coordinates)

export type AnimCoordinatesProps = {
    tickValues: number[]
    showX: boolean
    showY: boolean
    showZ: boolean
    xLength: number
    yLength: number
    zLenght: number
    xColor: string
    yColor: string
    zColor: string
}
type AcoordinatesProps = { from: AnimCoordinatesProps } & Pick<
    CoordinatesProps,
    'scale' | 'format'
> & {
        pause: boolean
        setSpringRef: React.MutableRefObject<
            SpringStartFn<AnimCoordinatesProps>
        >
    }

type AnimCoorProps = AnimCoordinatesProps &
    Pick<CoordinatesProps, 'scale' | 'format'>

const Animwrapper: React.FC<AnimCoorProps> = (props) => {
    return (
        <AnimCoor
            scale={props.scale}
            format={props.format}
            tickValues={props.tickValues}
            lengths={{
                xAxes: props.xLength,
                yAxes: props.yLength,
                zAxes: props.zLenght,
            }}
            showAxis={{
                xAxes: props.showX,
                yAxes: props.showY,
                zAxes: props.showZ,
            }}
            colors={{
                xAxes: props.xColor,
                yAxes: props.yColor,
                zAxes: props.zColor,
            }}
        />
    )
}
const AnimCoordinates = a(Animwrapper)

export const Acoordinates: React.FC<AcoordinatesProps> = ({
    from,
    scale,
    format,
    pause,
    setSpringRef,
}) => {
    const spRef = useRef<SpringHandle<AnimCoordinatesProps>>(null)
    const [spring, setSpring] = useSpring<AnimCoordinatesProps>(() => ({
        ref: spRef,
        from,
    }))

    useEffect(() => {
        if (pause && spRef.current) {
            spRef.current.pause()
        }
    }, [pause])
    useEffect(() => {
        setSpringRef.current = setSpring
    }, [])

    return <AnimCoordinates {...spring} format={format} scale={scale} />
}
