import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useSpring } from 'react-spring'
import { SpringStartFn, SpringConfig } from '@react-spring/core'
import { sMultiply, addVectors } from '../../shared'
import { SetGridFn } from '../../3D-components/Grids'
import { SetProgressbar } from './Progressbar'
import {
    PointsProps,
    PAnimatedProps,
    AnimCoordinatesProps,
    AnimatedAxesProps,
    SetAxes,
    SetTick,
    SetVector,
    AnimatedVecProps,
    SetMline,
} from '../../3D-components'
import { easeCubicInOut } from 'd3-ease'

const FAST = { friction: 20, mass: 2, tension: 40 }
const SLOW = { friction: 30, mass: 2, tension: 40 }
const VSLOW = { friction: 100, mass: 3, tension: 80 }
const PROG_CONF = {
    duration: 300,
    easing: easeCubicInOut,
}
const GRID_CONF = {
    duration: 3000,
    easing: easeCubicInOut,
}
const U_CONFIG = {
    duration: 3000,
    easing: easeCubicInOut,
}

type FnToFrom<T> = (args?: object | number | string) => T

type SingleAnim<T extends object = object> = {
    // set: ({ from, to }: { from: T; to: T }) => void
    set: SpringStartFn<T | Function>
    to: T | FnToFrom<T>
    from: T | FnToFrom<T>
    settings?: { config?: SpringConfig; delay?: number }
    meta?: string
}
type ConcurrentAnims = SingleAnim[]
type AnimQueue = ConcurrentAnims[]

const flush = async (queue: AnimQueue, reverse = false) => {
    if (reverse) {
        for (const concurrent of queue.reverse()) {
            await Promise.all(
                concurrent.map(({ set, from, to, settings }) => {
                    return typeof from === 'function'
                        ? set(from)
                        : set({ from: to, to: from, ...settings })
                })
            )
        }
    } else {
        for (const concurrent of queue) {
            await Promise.all(
                concurrent.map(({ set, from, to, settings }) => {
                    return typeof to === 'function'
                        ? set(to)
                        : set({ from, to, ...settings })
                })
            )
        }
    }
}

type Subsection = {
    title: string
    meta?: string
    number: number
    queue: AnimQueue
}
type Section = {
    title: string
    number: number
    meta?: string
    subs: Subsection[]
}
const mplayer = async (sections: Section[], setProgress: SetProgressbar) => {
    for (const section of sections) {
        // console.log('...playing section', section.number, section.title)
        const subs = section.subs
        const num_subs = subs.length
        for (const sub of subs) {
            // console.log('...playing sub', sub.number, sub.title)
            await flush(sub.queue)
            setProgress((i) => {
                if (i === section.number - 1) {
                    return sub.number === num_subs
                        ? { width: '100%', titleColor: '#12b530' }
                        : { width: (sub.number / num_subs) * 100 + '%' }
                } else return {}
            })
        }
    }
}

type LinearCombArgs = {
    alpha1?: number
    alpha2?: number
    vec1: [number, number, number]
    vec2: [number, number, number]
}
function linearComb({ alpha1 = 1, alpha2 = 1, vec1, vec2 }: LinearCombArgs) {
    const res = addVectors(sMultiply(alpha1, vec1), sMultiply(alpha2, vec2))
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
                visible: true,
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
    pause,
}: {
    tickValues: number[]
    scale: any
    pause: boolean
}) {
    const x1_startRef = useRef<SetVector>(null)
    const x2_startRef = useRef<SetVector>(null)
    const x1base_startRef = useRef<SetVector>(null)
    const x2base_startRef = useRef<SetVector>(null)
    const u_startRef = useRef<SetVector>(null)
    const gridStartRef = useRef<SetGridFn>(null)
    const setPointsStringsRef = useRef<SpringStartFn<PAnimatedProps>>(null)
    const setCoordStringsRef = useRef<SpringStartFn<AnimCoordinatesProps>>(null)
    const setxTicksRef = useRef<SetTick>(null)
    const setyTicksRef = useRef<SetTick>(null)
    const setxAxesRef = useRef<SetAxes>(null)
    const setyAxesRef = useRef<SetAxes>(null)
    const setProgressbarRef = useRef<SetProgressbar>(null)
    const setMlineRef = useRef<SetMline>(null)

    const x1_base: [number, number, number] = [scale(2), scale(-3), 0]
    const x2_base: [number, number, number] = [scale(3), scale(2), 0]

    const points = useMemo(
        () =>
            claculatePoints({
                alpha1_range: [-4, 4],
                alpha2: 1,
                base1: x1_base,
                base2: x2_base,
            }),
        []
    )

    const x1_from: AnimatedVecProps = {
        label_factor: 0,
        label_opacity: 0,
        vector: [0, 0, 0],
        color: '#4287f5',
        opacity: 1,
        thicknessFactor: 1.4,
        label_transform: 'translate(-60px, 0px)',
    }
    const x1b_from = { ...x1_from, vector: x1_base, opacity: 0 }
    const x2_from: AnimatedVecProps = {
        vector: [0, 0, 0],
        label_factor: 0,
        color: '#d14a2c',
        opacity: 1,
        label_opacity: 0,
        thicknessFactor: 1.4,
        label_transform: 'translate(-30px, -65px)',
    }
    const x2b_from = { ...x2_from, vector: x2_base, opacity: 0 }

    const u_from: AnimatedVecProps = {
        vector: [0, 0, 0],
        color: '#18c41b',
        label_opacity: 0,
        opacity: 1,
        thicknessFactor: 1.4,
        label_transform: 'translate(0px, -2px)',
    }

    const mline_from = {
        color: 'gray',
        dashArray: 0,
        dashRatio: 0,
        p1: linearComb({ vec1: x1_base, vec2: x2_base, alpha1: 4.2 }),
        p2: linearComb({ vec1: x1_base, vec2: x2_base, alpha1: 4.2 }),
        opacity: 1,
        visible: false,
        width: 0.05,
    }

    const animate = useCallback(async () => {
        const delay = 200 * 0
        const gridStartFn = gridStartRef.current
        const axisStart = {
            xAxes: setxAxesRef.current,
            yAxes: setyAxesRef.current,
        }
        const ticksStart = {
            xAxes: setxTicksRef.current,
            yAxes: setyTicksRef.current,
        }
        const x1Start = x1_startRef.current
        const x2Start = x2_startRef.current
        const x1bStart = x1base_startRef.current
        const uStart = u_startRef.current
        const pointsStart = setPointsStringsRef.current
        const lineStart = setMlineRef.current

        const sub01_coordinates: Subsection = {
            title: 'coordinates',
            number: 0o1,
            meta: 'starting a 2d coordinates system',
            queue: [
                [
                    {
                        set: axisStart['xAxes'],
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'set x axes visibility',
                    } as SingleAnim<AnimatedAxesProps>,
                    {
                        set: axisStart['yAxes'],
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'set y axes visibility',
                    } as SingleAnim<AnimatedAxesProps>,
                ],

                [
                    {
                        set: axisStart['xAxes'],
                        from: { vector: [0, 0, 0] },
                        to: { vector: [scale(10), 0, 0] },
                        settings: { config: { friction: 60, mass: 4 } },
                        meta: 'starting off x axis',
                    } as SingleAnim<AnimatedAxesProps>,

                    {
                        set: axisStart['yAxes'],
                        from: { vector: [0, 0, 0] },
                        to: { vector: [0, scale(10), 0] },
                        settings: { config: { friction: 60, mass: 4 } },
                        meta: 'starting off y axis',
                    } as SingleAnim<AnimatedAxesProps>,
                    {
                        set: ticksStart['xAxes'],
                        from: (i) => ({
                            opacity: 0,
                            length: 0,
                            config: FAST,
                            delay: (delay / 4) * i,
                        }),
                        to: (i) => ({
                            opacity: 1,
                            length: 0.2,
                            config: SLOW,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'set x axes ticks',
                    },
                    {
                        set: ticksStart['yAxes'],
                        from: (i) => ({
                            opacity: 0,
                            length: 0,
                            config: FAST,
                            delay: (delay / 4) * i,
                        }),
                        to: (i) => ({
                            opacity: 1,
                            length: 0.2,
                            config: FAST,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'set y axes ticks',
                    },
                    {
                        set: gridStartFn as SpringStartFn<object>,
                        from: {
                            hdraw: false,
                            vdraw: false,
                        },
                        to: {
                            hdraw: true,
                            vdraw: false,
                        },
                        settings: { config: GRID_CONF, delay: 3 * delay },
                        meta: 'set horizontal grids',
                    },
                    {
                        set: gridStartFn as SpringStartFn<object>,
                        from: { vdraw: false, hdraw: true },
                        to: { vdraw: true, hdraw: true },
                        settings: { config: GRID_CONF, delay: 4 * delay },
                        meta: 'set vertical grids',
                    },
                ],
            ],
        }

        const sub02_startLineSpan: Subsection = {
            title: '2D span',
            number: 0o2,
            meta: 'starting off a 2D span',
            queue: [
                [
                    {
                        set: x1Start,
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'setting x1 visible',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x1Start,
                        from: { vector: [0, 0, 0], label_factor: 0 },
                        to: { vector: x1_base, label_factor: 1 },
                        // settings: { config: FAST },
                        meta: 'setting x1=x1base',
                    } as SingleAnim<AnimatedVecProps>,
                    {
                        set: x1Start,
                        from: { label_opacity: 0 },
                        to: { label_opacity: 1 },
                        // settings: { delay: 3000 },
                        meta: 'setting label_opacity of x1',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x2Start,
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'setting x2 visible',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x2Start,
                        from: { vector: [0, 0, 0], label_factor: 0 },
                        to: { vector: x2_base, label_factor: 1 },
                        // settings: { config: FAST },
                        meta: 'setting x2=x2base',
                    } as SingleAnim<AnimatedVecProps>,
                    {
                        set: x2Start,
                        from: { label_opacity: 0 },
                        to: { label_opacity: 1 },
                        // settings: { delay: 2000 },
                        meta: 'setting label_opacity of x2',
                    } as SingleAnim<AnimatedVecProps>,
                ],
            ],
        }

        const sub03_startU: Subsection = {
            title: 'adding two basis',
            meta: 'add base1 & base2',
            number: 3,
            queue: [
                [
                    {
                        set: x1bStart,
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'setting  x1b visible ',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x1bStart,
                        from: { opacity: 0 },
                        to: { opacity: 0.7 },
                        meta: 'setting opacity of x1b ',
                    } as SingleAnim<AnimatedVecProps>,
                    {
                        set: x1Start,
                        from: {
                            origin: [0, 0, 0],
                            label_transform: x1_from.label_transform,
                        },
                        to: {
                            origin: x2_base,
                            label_transform: 'translate(10px, -20px)',
                        },
                        settings: { config: FAST },
                        meta: 'moving origin of x1 to x2_base ',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x1bStart,
                        from: { opacity: 0.7 },
                        to: { opacity: 0 },
                        meta: 'setting opacity of x1b .7 => 0',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: x1bStart,
                        from: { visible: true },
                        to: { visible: false },
                        meta: 'setting visibility of x1b to false ',
                    } as SingleAnim<AnimatedVecProps>,
                ],
                [
                    {
                        set: uStart,
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'setting u visible',
                    },
                ],
                [
                    {
                        set: uStart,
                        from: {
                            vector: u_from.vector,
                            label_opacity: u_from.label_opacity,
                        },
                        to: {
                            vector: linearComb({
                                vec1: x1_base,
                                vec2: x2_base,
                            }),
                            label_opacity: 1,
                        },
                        meta: 'setting u to x1 + x2',
                    } as SingleAnim<AnimatedVecProps>,
                ],
            ],
        }
        const section1: Section = {
            title: '2D Span',
            number: 0o1,
            meta: 'staring of by showing a 2d span',
            subs: [sub01_coordinates, sub02_startLineSpan, sub03_startU],
        }

        const ulabeltrans = [
            '(-8px, 25px)',
            '(-10px, 10px)',
            '(-15px, 0px)',
            '(0px, 0px)',
            '(0px, -16px)',
            '(-35px, -45px)',
            '(-45px, -60px)',
            '(-55px, -70px)',
        ]
        const x1labeltrans = [
            '(25px, 12px)',
            '(20px, 10px)',
            '(15px, 0px)',
            '(-5px, -30px)',
            '(-10px, -35px)',
            '(-20px, -50px)',
            '(-25px, -70px)',
            '(-30px, -80px)',
        ]
        let idx = points.length - 1
        let i = 0
        let currv1 = x1_base
        let currx1factor = 1
        let curruv = linearComb({ vec1: x1_base, vec2: x2_base })

        for (let alpha = 4; alpha > -4; alpha += -1) {
            const v1 = sMultiply(alpha, x1_base)
            const uv = linearComb({ vec1: x2_base, vec2: v1 })

            const setVecs: ConcurrentAnims = [
                {
                    set: x1Start,
                    from: {
                        vector: currv1,
                        label_transform:
                            i === 0
                                ? 'translate(10px, -20px)'
                                : `translate${x1labeltrans[i - 1]}`,
                        label_factor: currx1factor,
                    },
                    to: {
                        vector: v1,
                        label_factor: alpha,
                        label_transform: `translate${x1labeltrans[i]}`,
                    },
                    settings: { config: FAST },
                } as SingleAnim<AnimatedVecProps>,
                {
                    set: uStart,
                    from: {
                        vector: curruv,
                        label_transform:
                            i === 0
                                ? u_from.label_transform
                                : `translate${ulabeltrans[i - 1]}`,
                    },
                    to: {
                        vector: uv,
                        label_transform: `translate${ulabeltrans[i]}`,
                    },
                    settings: { config: FAST, delay: 30 },
                } as SingleAnim<AnimatedVecProps>,
            ]
            const setPoint: ConcurrentAnims = [
                {
                    set: pointsStart,
                    to: ((idx) => (i) => {
                        if (i === idx) {
                            return {
                                radius: 0.09,
                            }
                        } else return {}
                    })(idx),
                    from: ((idx) => (i) => {
                        if (i === idx) {
                            return {
                                radius: 0,
                            }
                        } else return {}
                    })(idx),
                },
            ]

            const subanim: Subsection = {
                title: `line point ${uv}`,
                meta: `setting line piont alpha:${alpha}`,
                number: i + 4,
                queue: [setVecs, setPoint],
            }
            section1.subs.push(subanim)
            currv1 = v1
            currx1factor = alpha
            curruv = uv
            idx--
            i++
        }

        const sub12_setLine: Subsection = {
            title: 'line throught points',
            number: 12,
            meta: 'drawing a line throught points generate in lc',
            queue: [
                [
                    {
                        set: lineStart,
                        from: { visible: false },
                        to: { visible: true },
                        meta: 'setting mline visible',
                    },
                    {
                        set: x2Start,
                        from: { opacity: 1, label_opacity: 1 },
                        to: { opacity: 0, label_opacity: 0 },
                        settings: { config: FAST },
                        meta: 'set x2 opacity to zero',
                    },
                    {
                        set: x1Start,
                        from: { opacity: 1, label_opacity: 1 },
                        to: { opacity: 0, label_opacity: 0 },
                        settings: { config: FAST, delay: 200 },
                        meta: 'set x1 opacity to zero',
                    },
                    {
                        set: uStart,
                        from: { opacity: 1, label_opacity: 1 },
                        to: { opacity: 0, label_opacity: 0 },
                        settings: { config: FAST, delay: 400 },
                        meta: 'set u opacity to zero',
                    },
                ],
                [
                    {
                        set: x2Start,
                        from: { visible: true },
                        to: { visible: false },
                        meta: 'hide x2',
                    },
                    {
                        set: x1Start,
                        from: { visible: true },
                        to: { visible: false },
                        meta: 'hide x1',
                    },
                    {
                        set: uStart,
                        from: { visible: true },
                        to: { visible: false },
                        meta: 'hide u',
                    },
                ],
                [
                    {
                        set: lineStart,
                        from: { p2: mline_from.p2 },
                        to: {
                            p2: linearComb({
                                vec1: x1_base,
                                vec2: x2_base,
                                alpha1: -3.1,
                            }),
                        },
                        settings: { config: SLOW },
                        meta: 'drawing a mline thorought lc points',
                    },
                ],
            ],
        }

        section1.subs.push(sub12_setLine)
        mplayer([section1], setProgressbarRef.current)
    }, [])

    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (!started && x1_startRef.current) {
            animate()
            setStarted(true)
        }
    }, [pause])

    // overlay
    const [overlayStyle, setOverlay] = useSpring(() => ({
        opacity: 1,
        display: 'block',
    }))
    useEffect(() => {
        setOverlay({
            display: started ? 'none' : 'block',
            default: { immediate: true },
        })
        setOverlay({
            opacity: started ? 0 : 1,
        })
    }, [started])
    return {
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
        x1: { x1_startRef, x1base_startRef, x1_from, x1b_from },
        x2: { x2_startRef, x2base_startRef, x2_from, x2b_from },
        u: { u_startRef, u_from },
        setProgressbarRef,
        mline_from,
        setMlineRef,
    }
}
