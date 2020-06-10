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
    SetAxes,
    SetTick,
    SetVector,
    AnimatedVecProps,
    SetMline,
    AnimatedTickProps,
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

function cubic_in_out(t: number): SpringConfig {
    return { easing: easeCubicInOut, duration: t * 1000 }
}

type FnToFrom<T> = (args?: object | number | string) => T
type SanimSet<T> = React.MutableRefObject<
    SpringStartFn<T | Function> | SpringStartFn<T>
>
type SanimTF<T> = T | FnToFrom<T>
type SanimSettings = { config?: SpringConfig; delay?: number }
type SanimAddArgs<T> = {
    to: SanimTF<T>
    from?: SanimTF<T>
    settings?: SanimSettings
    meta: string
}
class Sanim<T = object> {
    set: SanimSet<T>
    from: SanimTF<T>
    all: {
        [keys: string]: (SanimAddArgs<T> & { from: SanimTF<T> })[]
    } = {}
    currIndex: { secNum: number; subNum: number; conNum: number } = {
        secNum: 0,
        subNum: 0,
        conNum: 0,
    }
    currIndexKey = '0-0-0'
    constructor({ set, from }: { set: SanimSet<T>; from: SanimTF<T> }) {
        this.set = set
        this.from = from
    }

    add({
        to,
        from,
        settings = {},
        meta,
        secNum,
        subNum,
        conNum,
    }: SanimAddArgs<T> & {
        secNum?: number
        subNum?: number
        conNum?: number
    }) {
        const currSec = this.currIndex.secNum
        const currSub = this.currIndex.subNum
        const currCon = this.currIndex.conNum
        const last_index = currSec + '-' + currSub + '-' + currCon
        const index_key = secNum + '-' + subNum + '-' + conNum
        this.currIndex = { secNum, subNum, conNum }

        if (!index_key) {
            throw new Error(
                `index_key is undefined! recieved args: secNum:${secNum}, subNum:${subNum}, conNum:${conNum}`
            )
        }

        let _from: typeof from
        // : SanimTF<T>

        if (typeof this.from === 'function') {
            if (this.isEmpty(this.all)) {
                _from = from ? from : this.from
            } else {
                const last = this.all[last_index]
                const len = last.length
                _from = from ? from : last[len - 1].to
            }
        } else {
            if (this.isEmpty(this.all)) {
                _from = from ? from : this.from
            } else {
                const last = this.all[last_index]
                const len = last.length
                _from = {
                    ...last[len - 1].from,
                    ...last[len - 1].to,
                    ...from,
                }
            }
        }

        // for the case that in one index_key contains more than one animation with the same set (for example same animation with
        // different delays  after each others) we push every animations in a list so all[index] is a list of animations
        if (!this.all[index_key]) {
            this.all[index_key] = [{ from: _from, to, settings, meta }]
        } else {
            this.all[index_key].push({ from: _from, to, settings, meta })
        }

        this.currIndexKey = index_key

        return this
    }

    isEmpty(arg: object) {
        if (arg === undefined || arg === null) {
            throw new Error(`object is undefined or null!`)
        }
        if (typeof arg === 'object') {
            return Object.keys(arg).length === 0
        }
    }

    getAnimList({
        secNum,
        subNum,
        conNum,
    }: {
        secNum: number
        subNum: number
        conNum: number
    }) {
        const index_key = secNum + '-' + subNum + '-' + conNum
        const res = this.all[index_key]
        if (!res) {
            {
                console.log(this.all)
                throw new Error(
                    `no props could be found for index_key:${index_key}`
                )
            }
        } else return res
    }
}

type ConcurrentSanims = Sanim[]

type SubsectionArgs = {
    title: string
    meta?: string
    secNumber: number
    subNumber: number
}

class Subsection {
    title: string
    meta?: string
    secNumber: number
    subNumber: number
    queue: ConcurrentSanims[] = []
    currCon = 0
    constructor({ title, meta, secNumber, subNumber }: SubsectionArgs) {
        this.title = title
        this.meta = meta
        this.secNumber = secNumber
        this.subNumber = subNumber
    }
    add<T extends object>({
        anim,
        props,
    }: {
        anim: Sanim<object | Function>
        props: SanimAddArgs<T>
    }) {
        anim.add({
            secNum: this.secNumber,
            subNum: this.subNumber,
            conNum: this.currCon,
            ...props,
        })

        let currConList = this.queue[this.currCon]
        if (currConList) {
            currConList.push(anim)
        } else {
            currConList = [anim]
            this.queue.push(currConList)
        }
        return this
    }
    nextCon() {
        this.currCon++
        return this
    }
}

type SectionArgs = {
    title: string
    secNumber: number
    meta?: string
    subs: Subsection[]
}
class Section {
    title: string
    secNumber: number
    meta?: string
    subs: Subsection[]
    num_anims: number
    constructor({ title, secNumber, meta, subs }: SectionArgs) {
        this.title = title
        this.secNumber = secNumber
        this.meta = meta
        this.subs = subs
        this.num_anims = this.counter()
    }
    counter() {
        let count = 0
        let subNum = 0
        let conNum = 0
        for (const sub of this.subs) {
            for (const concurrent of sub.queue) {
                for (const sanim of concurrent) {
                    const sanimList = sanim.getAnimList({
                        secNum: this.secNumber,
                        subNum,
                        conNum,
                    })
                    for (const _ of sanimList) {
                        count++
                    }
                }
                conNum++
            }
            subNum++
            conNum = 0 //reset conNum for new subSection!
        }

        return count
    }
}

type CurrentProgress = {
    sec: number
    sub: number
    con: number
    sobj: number
    sanim: number
}
type ProgressRef = React.MutableRefObject<CurrentProgress>
const flush = async ({
    queue,
    subNum,
    secNum,
    setProgress,
    progressRef,
    num_anims,
    reverse = false,
    immediate = false,
}: {
    queue: ConcurrentSanims[]
    secNum: number
    subNum: number
    setProgress: SetProgressbar
    progressRef: ProgressRef
    num_anims: number
    reverse?: boolean
    immediate?: boolean
}) => {
    if (reverse) {
        let conNum = queue.length - 1
        for (const concurrent of queue.reverse()) {
            await Promise.all(
                concurrent.reverse().map((anim) => {
                    const set = anim.set

                    const { from, to, settings, meta } = anim.getProps({
                        secNum,
                        subNum,
                        conNum,
                    })

                    return typeof from === 'function'
                        ? set.current(from)
                        : set.current({
                              from: to,
                              to: from,
                              ...settings,
                          })
                })
            )
            conNum--
        }
    } else {
        let conNum = 0
        for (const concurrent of queue) {
            await Promise.all(
                // map all the concurrent animation to single animation (Sanim)
                concurrent.map((sanim) => {
                    const set = sanim.set
                    const sanimList = sanim.getAnimList({
                        secNum,
                        subNum,
                        conNum,
                    })
                    // map all animations in Sanim to their set functions
                    return Promise.all(
                        sanimList.map((anim) => {
                            const { from, to, settings, meta } = anim
                            const progress =
                                ((progressRef.current.sanim + 1) / num_anims) *
                                100
                            setProgress((i) => {
                                if (i === secNum) {
                                    return {
                                        width: progress + '%',
                                        titleColor:
                                            progress === 100
                                                ? '#279c3c'
                                                : 'black',
                                        config: VSLOW,
                                    }
                                } else return {}
                            })
                            // console.log(
                            //     'num_anims, animCount',
                            //     num_anims,
                            //     progressRef.current.sanim
                            // )

                            progressRef.current.sanim++
                            return typeof to === 'function'
                                ? set.current(to)
                                : set.current({
                                      from,
                                      to,
                                      ...settings,
                                  })
                        })
                    )
                })
            )
            conNum++
        }
    }
}

type MplayerArgs = {
    sections: Section[]
    setProgress: SetProgressbar
    progressRef: ProgressRef
    playfrom?: { secNum: number; subNum: number; conNum: number }
}
const mplayer = async ({ sections, setProgress, progressRef }: MplayerArgs) => {
    for (const section of sections) {
        for (const sub of section.subs) {
            await flush({
                queue: sub.queue,
                secNum: sub.secNumber,
                subNum: sub.subNumber,
                num_anims: section.num_anims,
                setProgress,
                progressRef,
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
const STORAGE = {}

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
        label_factor: 1,
        label_opacity: 0,
        vector: x1_base,
        color: '#4287f5',
        opacity: 0,
        thicknessFactor: 1.4,
        label_transform: 'translate(-60px, 0px)',
    }
    const x1b_from = { ...x1_from, vector: x1_base, opacity: 0 }
    const x2_from: AnimatedVecProps = {
        vector: x2_base,
        label_factor: 1,
        color: '#d14a2c',
        opacity: 0,
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

    const currProgress = useRef({ sec: 0, sub: 0, con: 0, sobj: 0, sanim: 0 })

    const createCoordinatesAnims = useCallback(() => {
        const delay = 200
        // Defining single animation objects
        STORAGE['anim_xAxes'] = new Sanim<AnimatedVecProps>({
            set: setxAxesRef,
            from: { visible: false, vector: [0, 0, 0] },
        })
        STORAGE['anim_yAxes'] = new Sanim<AnimatedVecProps>({
            set: setyAxesRef,
            from: { visible: false, vector: [0, 0, 0] },
        })
        STORAGE['anim_xTicks'] = new Sanim<AnimatedTickProps>({
            set: setxTicksRef,
            from: (i: number) => ({
                opacity: 0,
                length: 0,
                config: FAST,
                delay: (delay / 4) * i,
            }),
        })
        STORAGE['anim_yTicks'] = new Sanim<AnimatedTickProps>({
            set: setyTicksRef,
            from: (i: number) => ({
                opacity: 0,
                length: 0,
                config: FAST,
                delay: (delay / 4) * i,
            }),
        })
        STORAGE['anim_grids'] = new Sanim({
            set: gridStartRef as SanimSet<{
                hdraw: boolean
                vdraw: boolean
            }>,
            from: {
                hdraw: false,
                vdraw: false,
            },
        })
    }, [])

    const createbasisAnims = useCallback(
        ({
            _x1_from,
            _x1b_from,
            _x2_from,
            _u_from,
        }: {
            _x1_from: AnimatedVecProps
            _x1b_from: AnimatedVecProps
            _x2_from: AnimatedVecProps
            _u_from: AnimatedVecProps
        }) => {
            // Defining single animation objects

            STORAGE['anim_x1'] = new Sanim<AnimatedVecProps>({
                set: x1_startRef,
                from: _x1_from,
            })
            STORAGE['anim_x1b'] = new Sanim({
                set: x1base_startRef,
                from: _x1b_from,
            })
            STORAGE['anim_x2'] = new Sanim({
                set: x2_startRef,
                from: _x2_from,
            })
            STORAGE['anim_u'] = new Sanim({
                set: u_startRef,
                from: _u_from,
            })
            STORAGE['anim_points'] = new Sanim({
                set: setPointsStringsRef,
                from: () => ({}),
            })
            STORAGE['anim_line'] = new Sanim({
                set: setMlineRef,
                from: {},
            })
        },
        []
    )

    const create_sub_2dCoordinates = useCallback(
        (secNum: number, subNum: number) => {
            const delay = 200
            // Defining sub0:'starting a 2d coordinates system'
            const sub = new Subsection({
                title: 'coordinates',
                subNumber: subNum,
                secNumber: secNum,
                meta: 'starting a 2d coordinates system',
            })

            sub.add({
                anim: STORAGE['anim_xAxes'],
                props: {
                    to: { visible: true },
                    meta: 'make xaxes visible',
                },
            })
                .add({
                    anim: STORAGE['anim_yAxes'],
                    props: {
                        to: { visible: true },
                        meta: 'make yaxes visible',
                    },
                })
                .nextCon()
                .add({
                    anim: STORAGE['anim_xAxes'],
                    props: {
                        to: { vector: [scale(10), 0, 0] },
                        settings: { config: FAST },
                        meta: 'starting off x axis',
                    },
                })
                .add({
                    anim: STORAGE['anim_yAxes'],
                    props: {
                        to: { vector: [0, scale(10), 0] },
                        settings: { config: FAST },
                        meta: 'starting off y axis',
                    },
                })
                .add({
                    anim: STORAGE['anim_xTicks'],
                    props: {
                        to: (i: number) => ({
                            opacity: 1,
                            length: 0.2,
                            config: SLOW,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'starting off x ticks',
                    },
                })
                .add({
                    anim: STORAGE['anim_yTicks'],
                    props: {
                        to: (i: number) => ({
                            opacity: 1,
                            length: 0.2,
                            config: SLOW,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'starting off y ticks',
                    },
                })
                .add({
                    anim: STORAGE['anim_grids'],
                    props: {
                        to: { vdraw: true, hdraw: true },
                        settings: {
                            config: GRID_CONF,
                            delay: 2 * delay,
                        },
                        meta: 'set horizontal grids',
                    },
                })
                .add({
                    anim: STORAGE['anim_grids'],
                    props: {
                        to: { hdraw: true },
                        settings: { config: GRID_CONF, delay: 4 * delay },
                        meta: 'set vertical grids',
                    },
                })

            return sub
        },
        []
    )

    const create2dSpan = useCallback(
        ({
            base1,
            base2,
            secNum,
        }: {
            base1: [number, number, number]
            base2: [number, number, number]
            secNum: number
        }) => {
            const delay = 200

            // Defining single animation objects
            const anim_xAxes = new Sanim<AnimatedVecProps>({
                set: setxAxesRef,
                from: { visible: false, vector: [0, 0, 0] },
            })
            const anim_yAxes = new Sanim<AnimatedVecProps>({
                set: setyAxesRef,
                from: { visible: false, vector: [0, 0, 0] },
            })
            const anim_xTicks = new Sanim<AnimatedTickProps>({
                set: setxTicksRef,
                from: (i: number) => ({
                    opacity: 0,
                    length: 0,
                    config: FAST,
                    delay: (delay / 4) * i,
                }),
            })
            const anim_yTicks = new Sanim<AnimatedTickProps>({
                set: setyTicksRef,
                from: (i: number) => ({
                    opacity: 0,
                    length: 0,
                    config: FAST,
                    delay: (delay / 4) * i,
                }),
            })
            const anim_grids = new Sanim({
                set: gridStartRef as SanimSet<{
                    hdraw: boolean
                    vdraw: boolean
                }>,
                from: {
                    hdraw: false,
                    vdraw: false,
                },
            })
            const anim_x1 = new Sanim<AnimatedVecProps>({
                set: x1_startRef,
                from: x1_from,
            })
            const anim_x1b = new Sanim({
                set: x1base_startRef,
                from: x1b_from,
            })
            const anim_x2 = new Sanim({
                set: x2_startRef,
                from: x2_from,
            })
            const anim_u = new Sanim({
                set: u_startRef,
                from: u_from,
            })
            const anim_points = new Sanim({
                set: setPointsStringsRef,
                from: () => ({}),
            })
            const anim_line = new Sanim({
                set: setMlineRef,
                from: {},
            })

            // Defining sub0:'starting a 2d coordinates system'
            const sub0 = new Subsection({
                title: 'coordinates',
                subNumber: 0,
                secNumber: 0,
                meta: 'starting a 2d coordinates system',
            })

            sub0.add({
                anim: anim_xAxes,
                props: {
                    to: { visible: true },
                    meta: 'make xaxes visible',
                },
            })
                .add({
                    anim: anim_yAxes,
                    props: {
                        to: { visible: true },
                        meta: 'make yaxes visible',
                    },
                })
                .nextCon()
                .add({
                    anim: anim_xAxes,
                    props: {
                        to: { vector: [scale(10), 0, 0] },
                        settings: { config: FAST },
                        meta: 'starting off x axis',
                    },
                })
                .add({
                    anim: anim_yAxes,
                    props: {
                        to: { vector: [0, scale(10), 0] },
                        settings: { config: FAST },
                        meta: 'starting off y axis',
                    },
                })
                .add({
                    anim: anim_xTicks,
                    props: {
                        to: (i: number) => ({
                            opacity: 1,
                            length: 0.2,
                            config: SLOW,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'starting off x ticks',
                    },
                })
                .add({
                    anim: anim_yTicks,
                    props: {
                        to: (i: number) => ({
                            opacity: 1,
                            length: 0.2,
                            config: SLOW,
                            delay: (delay / 4) * i,
                        }),
                        meta: 'starting off y ticks',
                    },
                })
                .add({
                    anim: anim_grids,
                    props: {
                        to: { vdraw: true, hdraw: true },
                        settings: {
                            config: GRID_CONF,
                            delay: 2 * delay,
                        },
                        meta: 'set horizontal grids',
                    },
                })
                .add({
                    anim: anim_grids,
                    props: {
                        to: { hdraw: true },
                        settings: { config: GRID_CONF, delay: 4 * delay },
                        meta: 'set vertical grids',
                    },
                })

            // Defining Sub01:'starting off a 2D span'
            const sub01 = new Subsection({
                title: 'starting basis',
                secNumber: 0,
                subNumber: 1,
                meta: 'starting off a 2D span',
            })

            sub01
                .add<AnimatedVecProps>({
                    anim: anim_x1,
                    props: {
                        to: { visible: true },
                        meta: 'set x1 visible',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x1,
                    props: {
                        to: { opacity: 1, label_opacity: 1 },
                        settings: { config: cubic_in_out(4) },
                        meta: 'starting off x1',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x2,
                    props: {
                        to: { visible: true },
                        meta: 'set x2 visible',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x2,
                    props: {
                        to: { opacity: 1, label_opacity: 1 },
                        settings: { config: cubic_in_out(4) },
                        meta: 'starting off x2',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x1b,
                    props: {
                        to: { visible: true },
                        meta: 'set x1b visible',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x1b,
                    props: {
                        to: { opacity: 0.7 },
                        settings: { config: cubic_in_out(4) },
                        meta: 'show x1 base ',
                    },
                })
                .add<AnimatedVecProps>({
                    anim: anim_x1,
                    props: {
                        to: {
                            origin: x2_base,
                            label_transform: 'translate(10px, -20px)',
                        },
                        settings: { config: cubic_in_out(4) },
                        meta: " move x1's origin",
                    },
                })
                .add<AnimatedVecProps>({
                    anim: anim_x1b,
                    props: {
                        to: { opacity: 0 },
                        settings: { config: cubic_in_out(6) },
                        meta: 'set opacity of x1 base to zero',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_x1b,
                    props: {
                        to: { visible: false },
                        meta: 'set x1b unvisible',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_u,
                    props: {
                        to: { visible: true },
                        meta: 'set u visible',
                    },
                })
                .nextCon()
                .add<AnimatedVecProps>({
                    anim: anim_u,
                    props: {
                        to: {
                            vector: linearComb({
                                vec1: x1_base,
                                vec2: x2_base,
                            }),
                            label_opacity: 1,
                        },
                        settings: { config: SLOW },
                        meta: 'show vector u',
                    },
                })

            // Defining Sub02:' 2D span: linear combination of alpha*x1+x2'
            const sub02 = new Subsection({
                title: '2D span of alpha*x1+x2',
                secNumber: 0,
                subNumber: 2,
                meta: '2D span: linear combination of alpha*x1+x2',
            })

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

            for (let alpha = 4; alpha > -4; alpha += -1) {
                const v1 = sMultiply(alpha, x1_base)
                const uv = linearComb({ vec1: x2_base, vec2: v1 })
                if (i !== 0) {
                    sub02.nextCon()
                }
                sub02
                    .add<AnimatedVecProps>({
                        anim: anim_x1,
                        props: {
                            to: {
                                vector: v1,
                                label_factor: alpha,
                                label_transform: `translate${x1labeltrans[i]}`,
                            },
                            settings: {
                                config: FAST,
                                delay: i === 0 ? 5000 : 0,
                            },
                            meta: `set x1 to ${alpha} * x1`,
                        },
                    })
                    .add<AnimatedVecProps>({
                        anim: anim_u,
                        props: {
                            to: {
                                vector: uv,
                                label_transform: `translate${ulabeltrans[i]}`,
                            },
                            settings: {
                                config: FAST,
                                delay: i === 0 ? 5000 : 0,
                            },
                            meta: `set u to ${alpha}*x1 + x2`,
                        },
                    })
                    .nextCon()
                    .add<Function>({
                        anim: anim_points,
                        props: {
                            to: ((idx) => (i) => {
                                if (i === idx) {
                                    return {
                                        from: { radius: 0.0001 },
                                        to: { radius: 0.09 },
                                        config: cubic_in_out(0.4),
                                    }
                                } else return {}
                            })(idx),
                            from: ((idx) => (i) => {
                                if (i === idx) {
                                    return {
                                        from: { radius: 0.09 },
                                        to: { radius: 0.0001 },
                                    }
                                } else return {}
                            })(idx),
                            meta: `set ${i}st point on ${alpha}*x1 + x2`,
                        },
                    })

                idx--
                i++
            }
            sub02
                .add({
                    anim: anim_x2,
                    props: {
                        to: { opacity: 0, label_opacity: 0 },
                        settings: {
                            config: cubic_in_out(2),
                            delay: 4 * delay,
                        },
                        meta: 'set opacity of x2 to zero',
                    },
                })
                .add({
                    anim: anim_x1,
                    props: {
                        to: { opacity: 0, label_opacity: 0 },
                        settings: {
                            config: cubic_in_out(2),
                            delay: 9 * delay,
                        },
                        meta: 'set opacity of x1 to zero',
                    },
                })
                .add({
                    anim: anim_u,
                    props: {
                        to: { opacity: 0, label_opacity: 0 },
                        settings: {
                            config: cubic_in_out(2),
                            delay: 14 * delay,
                        },
                        meta: 'set opacity of u to zero',
                    },
                })
                .nextCon()
                .add({
                    anim: anim_x2,
                    props: {
                        to: { visible: false },
                        meta: 'set x2 unvisible',
                    },
                })
                .add({
                    anim: anim_x1,
                    props: {
                        to: { visible: false },
                        meta: 'set x1 unvisible',
                    },
                })
                .add({
                    anim: anim_u,
                    props: {
                        to: { visible: false },
                        meta: 'set u unvisible',
                    },
                })
                .nextCon()
                .add({
                    anim: anim_line,
                    props: {
                        to: {
                            visible: true,
                        },

                        meta: 'set line visible',
                    },
                })
                .nextCon()
                .add({
                    anim: anim_line,
                    props: {
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
                })

            const section0 = new Section({
                title: '2D Span',
                secNumber: 0,
                meta: 'linear combination of basis x1 & x2',
                subs: [sub0, sub01, sub02],
            })

            return section0
        },
        []
    )
    const section0 = useMemo(() => {
        const sec0 = create2dSpan()
        return sec0
    }, [])

    const animate = useCallback(async () => {
        mplayer({
            sections: [section0],
            setProgress: setProgressbarRef.current,
            progressRef: currProgress,
        })
    }, [])

    const [started, setStarted] = useState(false)

    useEffect(() => {
        if (!started) {
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
