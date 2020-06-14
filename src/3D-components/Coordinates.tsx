import React from 'react'
import { ScaleLinear } from 'd3-scale'
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
    ticksFrom?: {
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
    ticksFrom = {},
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
                    tickFrom={'xAxes' in ticksFrom ? ticksFrom['xAxes'] : {}}
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
                    tickFrom={'yAxes' in ticksFrom ? ticksFrom['yAxes'] : {}}
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
                    tickFrom={'zAxes' in ticksFrom ? ticksFrom['zAxes'] : {}}
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
