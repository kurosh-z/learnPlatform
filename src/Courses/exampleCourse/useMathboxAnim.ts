import { useRef, useMemo } from 'react'
import { useSpring } from 'react-spring'
import { SpringHandle, SpringStartFn } from '@react-spring/core'
import { sMultiply as multiply, addVectors } from '../../shared'
import { VectorProps } from '../courseComps/LinearCombination'
import { GAnimProps } from '../../3D-components/Grids'
import {
    PointsProps,
    PAnimatedProps,
    AnimCoordinatesProps,
    SetAxes,
    SetTick,
} from '../../3D-components'
import { easeCubicInOut } from 'd3-ease'

const SLOW = { friction: 30, mass: 2, tension: 40 }
const VSLOW = { friction: 100, mass: 3, tension: 80 }
const GRID_CONF = {
    duration: 3000,
    easing: easeCubicInOut,
}

type LinearCombArgs = {
    alpha1?: number
    alpha2?: number
    vec1: VectorProps['vec']
    vec2: VectorProps['vec']
}
function linearComb({ alpha1 = 1, alpha2 = 1, vec1, vec2 }: LinearCombArgs) {
    const res = addVectors(multiply(alpha1, vec1), multiply(alpha2, vec2))
    return res.toArray() as [number, number, number]
}

type CalPointsArgs = {
    alpha1_range?: number[]
    alpha2_range?: number[]
    alpha1?: number
    alpha2?: number
    base1: [number, number, number]
    base2: [number, number, number]
}

function claculatePoints({
    alpha1_range,
    alpha2_range,
    alpha1 = 1,
    alpha2 = 2,
    base1,
    base2,
}: CalPointsArgs): PointsProps['points'] {
    const points: PointsProps['points'] = []
    if (alpha1_range) {
        let idx = 0
        const a = alpha1_range[0]
        const b = alpha1_range[1]

        for (let alpha = a; alpha <= b; alpha++) {
            const pos = linearComb({
                alpha1: alpha,
                alpha2: alpha2,
                vec1: base1,
                vec2: base2,
            })
            points.push({
                opacity: 0.78,
                radius: 0.001,
                position: pos,
                color: '#0fba12',
                pkey: 'p' + idx,
                visible: false,
            })
            idx++
        }
    } else if (alpha2_range) {
        let idx = 0
        for (let alpha = alpha2_range[0]; alpha <= alpha2_range[1]; alpha++) {
            const pos = linearComb({
                alpha1: alpha1,
                alpha2: alpha,
                vec1: base1,
                vec2: base2,
            })
            points.push({
                opacity: 1,
                radius: 0.1,
                position: pos,
                color: 'green',
                pkey: 'p' + idx,
            })
            idx++
        }
    }

    return points
}

export function useMathboxAnim({
    scale,
    tickValues,
}: {
    tickValues: number[]
    scale: any
}) {
    const gridStartRef = useRef<SpringStartFn<GAnimProps>>(null)
    const setPointsStringsRef = useRef<SpringStartFn<PAnimatedProps>>(null)
    const setCoordStringsRef = useRef<SpringStartFn<AnimCoordinatesProps>>(null)
    const setxTicksRef = useRef<SetTick>(null)
    const setyTicksRef = useRef<SetTick>(null)
    const setxAxesRef = useRef<SetAxes>(null)
    const setyAxesRef = useRef<SetAxes>(null)

    const x1_base: VectorProps['vec'] = [scale(2), scale(-2), 0]
    const x2_base: VectorProps['vec'] = [scale(2), scale(3), 0]

    const points = useMemo(
        () =>
            claculatePoints({
                alpha1_range: [-5, 5],
                alpha2: 1,
                base1: x1_base,
                base2: x2_base,
            }),
        []
    )
    //mathbox State

    // animation srpings:
    const x2Ref = useRef<SpringHandle<VectorProps>>(null)
    const [_x2, setv_x2] = useSpring<VectorProps>(() => ({
        ref: x2Ref,
        from: {
            base: x2_base,
            base_opacity: 1,
            showBase: true,
            vec: x2_base,
            origin: [0, 0, 0],
            color: '#d14a2c',
            opacity: 1,
            factor: 1,
            label_transform: 'translate(-1.8rem, -3rem)',
        },
    }))

    // vector u
    const [_u, set_u] = useSpring<
        Pick<VectorProps, 'color' | 'opacity' | 'thickness' | 'label_transform'>
    >(() => ({
        from: {
            color: '#18c41b',
            opacity: 0,
            thickness: 1.7,
            label_transform: 'translate(-.4rem, .2rem)',
        },
    }))
    const lineRef = useRef<
        SpringHandle<{
            opacity: number
            p1: VectorProps['vec']
            p2: VectorProps['vec']
            visible: boolean
        }>
    >(null)
    const [line, setLine] = useSpring<{
        opacity: number
        p1: VectorProps['vec']
        p2: VectorProps['vec']
        visible: boolean
    }>(() => ({
        ref: lineRef,
        from: {
            p1: linearComb({
                alpha1: 6,
                vec1: x1_base,
                vec2: x2_base,
            }),
            p2: linearComb({
                alpha1: 6,
                vec1: x1_base,
                vec2: x2_base,
            }),
            opacity: 0,
            visible: false,
        },
    }))

    const x1Ref = useRef<SpringHandle<VectorProps>>(null)
    const [_x1, setv_x1] = useSpring<VectorProps>(() => ({
        ref: x1Ref,
        from: {
            base: x1_base,
            showBase: true,
            vec: x1_base,
            origin: [0, 0, 0],
            color: '#4287f5',
            opacity: 1,
            base_opacity: 1,
            factor: 1,
            label_transform: 'translate(.2rem, -1.4rem)',
        },
        // config: { friction: 12, mass: 1, tension: 30 },
        to: async (animX1) => {
            //start functions
            const gridStartFn = gridStartRef.current
            const pointStartFn = setPointsStringsRef.current
            const axisStart = {
                xAxes: setxAxesRef.current,
                yAxes: setyAxesRef.current,
            }
            const ticksStart = {
                xAxes: setxTicksRef.current,
                yAxes: setyTicksRef.current,
            }

            const delay = 200

            await axisStart['xAxes']({ vector: [scale(10), 0, 0] })
            await axisStart['yAxes']({ vector: [0, scale(10), 0] })
            // await ticksStart['yAxes']((i) => ({
            //     opacity: 1,
            //     length: 1,
            //     config: SLOW,
            //     delay: delay * i,
            // }))

            // await Promise.all([
            //     gridStartFn({
            //         _endPoint1: 32 / 2,
            //         visible: true,
            //         config: GRID_CONF,
            //         delay,
            //     }),

            //     gridStartFn({
            //         _endPoint2: -22 / 2,
            //         delay: 400,
            //         config: GRID_CONF,
            //     }),
            // ])

            // await animX1({
            //     to: { origin: x2_base, base_opacity: 0 },
            //     delay: 3 * delay,
            //     // config: SLOW,
            // })
            // await Promise.all([
            //     animX1({
            //         vec: multiply(6, x1_base),
            //         factor: 6,
            //         delay: delay,
            //         config: SLOW,
            //     }),
            //     set_u({
            //         opacity: 1,
            //         config: SLOW,
            //     }),
            // ])
            // let idx = points.length - 1
            // for (let alpha = 5; alpha > -5; alpha += -1) {
            //     await animX1({
            //         vec: multiply(alpha, x1_base),
            //         factor: alpha,
            //         delay: delay,
            //     })
            //     await pointStartFn((i) => {
            //         if (i === idx) {
            //             return {
            //                 radius: 0.09,
            //                 visible: true,
            //             }
            //         } else return {}
            //     })
            //     idx--
            // }

            // await Promise.all([
            //     animX1({ opacity: 0, visible: false }),
            //     setv_x2({
            //         to: { opacity: 0, base_opacity: 0, visible: false },
            //     }),
            //     set_u({ to: { opacity: 0.5 } }),
            //     setLine({
            //         to: {
            //             visible: true,
            //             opacity: 1,
            //             p2: linearComb({
            //                 alpha1: -4.3,
            //                 vec1: x1_base,
            //                 vec2: x2_base,
            //             }),
            //         },
            //         config: SLOW,
            //         delay: delay * 3,
            //     }),
            // ])
        },
    }))
    // playButton:
    const [playBtn, setPlay] = useSpring(() => ({
        // playSize: 100,
        // top: '50%',
        // left: '50%',
        top: '97%',
        left: '5%',
        playSize: 30,
    }))
    // overlay
    const [overlayStyle, setOverlay] = useSpring(() => ({
        // opacity: 1,
        // display: 'block',
        display: 'none',
    }))

    return {
        x1: _x1,
        x2: _x2,
        setv_x1,
        setv_x2,
        x1Ref,
        x2Ref,
        u: _u,
        set_u,
        line,
        lineRef,
        playBtn: playBtn,
        overlayStyle: overlayStyle,
        setOverlay: setOverlay,
        gridStartRef,
        setPointsStringsRef,
        points,
        setCoordStringsRef,
        setCoordTicks: {
            xAxes: setxTicksRef,
            yAxes: setyTicksRef,
        },
        setCoordinateAxis: { xAxes: setxAxesRef, yAxes: setyAxesRef },
    }
}
