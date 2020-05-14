import { useMemo } from 'react'
import { format as d3format } from 'd3-format'
import { scaleLinear, ScaleLinear } from 'd3-scale'

type UseScaleLinear = ({
    numTicks,
    range,
    domain,
}: {
    numTicks: number
    range: [number, number]
    domain: [number, number]
    axLength?: number
    justPositive?: boolean
}) => {
    scale: ScaleLinear<number, number>
    tickValues: number[]
    format: (
        n:
            | number
            | {
                  valueOf(): number
              }
    ) => string
}

export const useScaleLinear: UseScaleLinear = ({
    domain,
    range,
    numTicks,
    axLength,
    justPositive = false,
}) => {
    let { tickValues, scale, format } = useMemo(() => {
        const scale = scaleLinear().domain(domain).range(range)
        const format = d3format('.0f')
        const tickValues = scale.ticks(numTicks)
        return { scale, tickValues, format }
    }, [])

    if (axLength) {
        tickValues = tickValues.filter((val) => {
            const con = justPositive
                ? val < axLength && val > 0
                : val < axLength

            return con
        })
    }

    return { scale, tickValues, format }
}
