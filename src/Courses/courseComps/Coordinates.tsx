import React from 'react'
import { ScaleLinear } from 'd3-scale'
import Axes from '../../3D-components/Axes'
import { ReactThreeFiber } from 'react-three-fiber'

type CoordinatesProps = {
    scale: ScaleLinear<number, number>
    tickValues?: number[]
    showTickValues?: { xAxes: boolean; yAxes: boolean; zAxes: boolean }
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
    showAxis?: { xAxes: boolean; yAxes: boolean; zAxes: boolean }
    lengths?: { xAxes?: number; yAxes?: number; zAxes?: number }
    colors?: {
        xAxes?: ReactThreeFiber.Color
        yAxes?: ReactThreeFiber.Color
        zAxes?: ReactThreeFiber.Color
    }
}
const Coordinates: React.FC<CoordinatesProps> = ({
    scale,
    tickValues,
    format,
    showAxis = { xAxes: true, yAxes: true, zAxes: true },
    showTickValues = {},
    lengths = {},
    colors = {},
}) => {
    console.log('coordinates')
    return (
        <>
            {showAxis['zAxes'] && (
                <Axes
                    axes="zAxes"
                    scale={scale}
                    tickValues={tickValues}
                    format={format}
                    thicknessFactor={1}
                    length={'zAxes' in lengths ? lengths['zAxes'] : 1}
                    color={'zAxes' in colors ? colors['zAxes'] : null}
                    showTickValues={
                        'zAxes' in showTickValues
                            ? showTickValues['zAxes']
                            : false
                    }
                />
            )}
            {showAxis['yAxes'] && (
                <Axes
                    axes="yAxes"
                    scale={scale}
                    tickValues={tickValues}
                    thicknessFactor={1.1}
                    format={format}
                    length={'yAxes' in lengths ? lengths['yAxes'] : 1}
                    color={'yAxes' in colors ? colors['yAxes'] : null}
                    showTickValues={
                        'yAxes' in showTickValues
                            ? showTickValues['yAxes']
                            : false
                    }
                />
            )}
            {showAxis['xAxes'] && (
                <Axes
                    axes="xAxes"
                    scale={scale}
                    thicknessFactor={1.1}
                    tickValues={tickValues}
                    format={format}
                    length={'xAxes' in lengths ? lengths['xAxes'] : 1}
                    color={'xAxes' in colors ? colors['xAxes'] : null}
                    showTickValues={
                        'xAxes' in showTickValues
                            ? showTickValues['xAxes']
                            : false
                    }
                />
            )}
        </>
    )
}
export default Coordinates
