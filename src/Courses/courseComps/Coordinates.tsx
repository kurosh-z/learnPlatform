import React from 'react'
import { ScaleLinear } from 'd3-scale'
import Axes from '../../3D-components/Axes'
import { ReactThreeFiber } from 'react-three-fiber'

type CoordinatesProps = {
    scale: ScaleLinear<number, number>
    tickValues?: number[]
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
    lengths = {},
    colors = {},
}) => {
    return (
        <>
            {showAxis['zAxes'] && (
                <Axes
                    axes="zAxes"
                    scale={scale}
                    tickValues={tickValues}
                    format={format}
                    thicknessFactor={0.9}
                    length={'zAxes' in lengths ? lengths['zAxes'] : 1}
                    color={'zAxes' in colors ? colors['zAxes'] : null}
                />
            )}
            {showAxis['yAxes'] && (
                <Axes
                    axes="yAxes"
                    scale={scale}
                    tickValues={tickValues}
                    thicknessFactor={0.9}
                    format={format}
                    length={'yAxes' in lengths ? lengths['yAxes'] : 1}
                    color={'yAxes' in colors ? colors['yAxes'] : null}
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
                />
            )}
        </>
    )
}
export default Coordinates
