import React, { useMemo } from 'react'
import { animated, SpringValue } from 'react-spring'
import { Vector, VectorOp, ImperativePoints } from '../../3D-components'
import { format as d3format } from 'd3-format'

export type VectorProps = {
    name: string
    vec: [number, number, number]
    base?: [number, number, number]
    base_opacity?: number
    origin?: [number, number, number]
    showBase: boolean
    color: string
    opacity: number
    thickness: number
    factor: number
    label_transform: string
}

const VectorComp: React.FC<VectorProps> = ({
    name,
    vec,
    base,
    base_opacity = 1,
    origin,
    showBase,
    factor,
    color,
    opacity,
    thickness,
    label_transform,
}) => {
    const format = useMemo(() => {
        return d3format('.2f')
    }, [])
    const _factor = format(factor)
    const labelStyle: React.CSSProperties = {
        position: 'absolute',
        transform: label_transform,
        opacity: opacity,
    }
    return (
        <>
            <Vector
                vector={vec}
                origin={origin}
                color={color}
                opacity={opacity}
                thicknessFacor={thickness}
                label={
                    factor === 1
                        ? String.raw`\vec{${name}}`
                        : String.raw`${_factor}\vec{${name}}`
                }
                labelStyle={labelStyle}
                latexParser
            />
            {showBase && (
                <Vector
                    vector={base}
                    color={color}
                    opacity={base_opacity}
                    thicknessFacor={1.2 * thickness}
                />
            )}
        </>
    )
}
const Avector = animated(VectorComp)
const AvectorOp = animated(VectorOp)

type LinearCombinationProps = {
    x1: VectorProps
    x2?: VectorProps
    u?: Pick<VectorProps, 'color' | 'opacity' | 'thickness' | 'label_transform'>
}

const LinearCombination: React.FC<LinearCombinationProps> = ({ x1, x2, u }) => {
    return (
        <>
            <Avector
                name={'x_1'}
                vec={x1.vec}
                color={x1.color}
                opacity={x1.opacity}
                thickness={'thickness' in x1 ? x1['thickness'] : 1.5}
                label_transform={x1.label_transform}
                showBase={x1.showBase}
                factor={x1.factor}
                base={x1.base}
                base_opacity={x1.base_opacity}
                origin={x1.origin}
            />
            <Avector
                name={'x_2'}
                vec={x2.vec}
                color={x2.color}
                opacity={x2.opacity}
                base_opacity={x2.base_opacity}
                thickness={'thickness' in x2 ? x2['thickness'] : 1.5}
                label_transform={x2.label_transform}
                showBase={x2.showBase}
                factor={x2.factor}
                base={x2.base}
            />

            <AvectorOp
                vector1={x1.vec}
                vector2={x2.vec}
                op="add"
                color={u.color}
                opacity={u.opacity}
                thicknessFacor={u.thickness}
                label={String.raw`\vec{u}`}
                label_transform={u.label_transform}
                latexParser
            />
        </>
    )
}

export default LinearCombination
