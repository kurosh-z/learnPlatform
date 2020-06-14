import { useRef, useMemo, useEffect, useState, useCallback } from 'react'
import { useSpring } from 'react-spring'
import { sMultiply, linearComb } from '../../shared'
import { SetGridFn } from '../../3D-components/Grids'
import { SetProgressbar } from './Progressbar'
import {
    PointsProps,
    SetPoints,
    SetAxes,
    SetTick,
    SetVector,
    AnimatedVecProps,
    AnimatedPointsProps,
    PulPointSetConfirmedCallback,
    PulPointDragCallback,
    AnimatedMlineProps,
    SetMline,
    AnimatedTickProps,
    AnimatedPulsingPointProps,
    SetPulsingPoint,
} from '../../3D-components'

import { Section, Subsection, Sanim, SanimSet } from './anim_section'
import { sConfigs, cubic_in_out } from './anim-utils'
import { mplayer } from './mplayer'
import { StreamDrawUsage, NumberKeyframeTrack } from 'three'

const { FAST, SLOW } = sConfigs

type VectorArray = [number, number, number]
type CalPointsArgs = {
    alpha1_range?: number[]
    alpha2_range?: number[]
    alpha1?: number
    alpha2?: number
    base1: VectorArray
    base2: VectorArray
}

function calculatePoints({
    alpha1_range,
    alpha2_range,
    alpha1 = 1,
    alpha2 = 2,
    base1,
    base2,
}: CalPointsArgs): PointsProps['points'] {
    const points: PointsProps['points'] = []
    console.log('point are being calculated')
    if (alpha1_range) {
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
                visible: true,
            })
        }
    } else if (alpha2_range) {
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
            })
        }
    }

    return points
}
// compiler complains about empty object
const STORAGE: {
    anim_x1: Sanim<AnimatedVecProps>
    anim_x2: Sanim<AnimatedVecProps>
    anim_u: Sanim<AnimatedVecProps>
    anim_x1b: Sanim<AnimatedVecProps>
    anim_x2b: Sanim<AnimatedVecProps>
    anim_line: Sanim<AnimatedMlineProps>
    anim_points: Sanim<AnimatedPointsProps>
    pulsing_point: Sanim<AnimatedPulsingPointProps>
} = {}

export function useMathboxAnim({
    scale,
    pause,
}: {
    scale: (arg: number) => number
    pause: boolean
}) {
    const x1_startRef = useRef<SetVector>(null)
    const x2_startRef = useRef<SetVector>(null)
    const x1base_startRef = useRef<SetVector>(null)
    const x2base_startRef = useRef<SetVector>(null)
    const u_startRef = useRef<SetVector>(null)
    const gridStartRef = useRef<SetGridFn>(null)
    const setPointsRef = useRef<SetPoints>(null)
    const setxTicksRef = useRef<SetTick>(null)
    const setyTicksRef = useRef<SetTick>(null)
    const setxAxesRef = useRef<SetAxes>(null)
    const setyAxesRef = useRef<SetAxes>(null)
    const setProgressbarRef = useRef<SetProgressbar>(null)
    const setMlineRef = useRef<SetMline>(null)
    const setPulsingPointRef = useRef<SetPulsingPoint>(null)
    const userBasisConfirmedRef = useRef<PulPointSetConfirmedCallback>(null)
    const pulsingDragCallbackRef = useRef<PulPointDragCallback>(null)

    const x1_base: [number, number, number] = [scale(2), scale(-3), 0]
    const x2_base: [number, number, number] = [scale(3), scale(2), 0]

    // after every section we set this we set this
    const started = useRef([false, false])
    // set the default span2d_data this will be set again from user input data in practice 2d
    const [span2d_data, set_span2d_data] = useState<{
        base1: VectorArray
        alpha1_range: number[]
    }>({ base1: x1_base, alpha1_range: [-4, 4] })

    const points = useMemo(
        () =>
            calculatePoints({
                base1: span2d_data['base1'],
                base2: x2_base,
                alpha2: 1,
                alpha1_range: span2d_data['alpha1_range'],
            }),
        [span2d_data]
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

    const createbasisAnims = useCallback(() => {
        // Defining single animation objects

        STORAGE['anim_x1'] = new Sanim<AnimatedVecProps>({
            set: x1_startRef,
            from: x1_from,
        })
        STORAGE['anim_x1b'] = new Sanim<AnimatedVecProps>({
            set: x1base_startRef,
            from: x1b_from,
        })
        STORAGE['anim_x2b'] = new Sanim<AnimatedVecProps>({
            set: x2base_startRef,
            from: x2b_from,
        })
        STORAGE['anim_x2'] = new Sanim<AnimatedVecProps>({
            set: x2_startRef,
            from: x2_from,
        })
        STORAGE['anim_u'] = new Sanim<AnimatedVecProps>({
            set: u_startRef,
            from: u_from,
        })
        STORAGE['anim_points'] = new Sanim<AnimatedPointsProps>({
            set: setPointsRef,
            from: () => ({}),
        })
        STORAGE['anim_line'] = new Sanim<AnimatedMlineProps>({
            set: setMlineRef,
            from: {},
        })
        STORAGE['pulsing_point'] = new Sanim<AnimatedPulsingPointProps>({
            set: setPulsingPointRef,
            from: {
                opacity: 0,
                position: x1_base,
            },
        })
    }, [])

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
                            config: cubic_in_out(3),
                            delay: 2 * delay,
                        },
                        meta: 'set horizontal grids',
                    },
                })
                .add({
                    anim: STORAGE['anim_grids'],
                    props: {
                        to: { hdraw: true },
                        settings: { config: cubic_in_out(3), delay: 4 * delay },
                        meta: 'set vertical grids',
                    },
                })

            return sub
        },
        []
    )
    const create_sub_linearcombination = useCallback(
        (secNum: number, subNum: number) => {
            const delay = 200
            // Defining Sub02:' 2D span: linear combination of alpha*x1+x2'
            const sub = new Subsection({
                title: '2D span of alpha*x1+x2',
                secNumber: secNum,
                subNumber: subNum,
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
                    sub.nextCon()
                }
                sub.add<AnimatedVecProps>({
                    anim: STORAGE['anim_x1'],
                    props: {
                        to: {
                            vector: v1,
                            label_factor: alpha,
                            label_transform: `translate${x1labeltrans[i]}`,
                        },
                        settings: {
                            config: FAST,
                            delay: 0,
                        },
                        meta: `set x1 to ${alpha} * x1`,
                    },
                })
                    .add<AnimatedVecProps>({
                        anim: STORAGE['anim_u'],
                        props: {
                            to: {
                                vector: uv,
                                label_transform: `translate${ulabeltrans[i]}`,
                            },
                            settings: {
                                config: FAST,
                                delay: 0,
                            },
                            meta: `set u to ${alpha}*x1 + x2`,
                        },
                    })
                    .nextCon()
                    .add<Function>({
                        anim: STORAGE['anim_points'],
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
            sub.add({
                anim: STORAGE['anim_x2'],
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
                    anim: STORAGE['anim_x1'],
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
                    anim: STORAGE['anim_u'],
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
                    anim: STORAGE['anim_line'],
                    props: {
                        to: {
                            visible: true,
                        },

                        meta: 'set line visible',
                    },
                })
                .nextCon()
                .add({
                    anim: STORAGE['anim_line'],
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

            return sub
        },

        []
    )
    const create_section_2dSpan = useCallback(() => {
        const sub0 = create_sub_2dCoordinates(0, 0)

        // Defining Sub01:'starting off a 2D span'
        const sub01 = new Subsection({
            title: 'starting basis',
            secNumber: 0,
            subNumber: 1,
            meta: 'starting off a 2D span',
        })

        sub01
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x1'],
                props: {
                    to: { visible: true },
                    meta: 'set x1 visible',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x1'],
                props: {
                    to: { opacity: 1, label_opacity: 1 },
                    settings: { config: cubic_in_out(4) },
                    meta: 'starting off x1',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x2'],
                props: {
                    to: { visible: true },
                    meta: 'set x2 visible',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x2'],
                props: {
                    to: { opacity: 1, label_opacity: 1 },
                    settings: { config: cubic_in_out(4) },
                    meta: 'starting off x2',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x1b'],
                props: {
                    to: { visible: true },
                    meta: 'set x1b visible',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x1b'],
                props: {
                    to: { opacity: 0.7 },
                    settings: { config: cubic_in_out(4) },
                    meta: 'show x1 base ',
                },
            })
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_x1'],
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
                anim: STORAGE['anim_x1b'],
                props: {
                    to: { opacity: 0 },
                    settings: { config: cubic_in_out(6) },
                    meta: 'set opacity of x1 base to zero',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_u'],
                props: {
                    to: { visible: true },
                    meta: 'set u visible',
                },
            })
            .nextCon()
            .add<AnimatedVecProps>({
                anim: STORAGE['anim_u'],
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

        const sub02 = create_sub_linearcombination(0, 2)

        const section0 = new Section({
            title: '2D Span',
            secNumber: 0,
            meta: 'linear combination of basis x1 & x2',
            subs: [sub0, sub01, sub02],
        })

        return section0
    }, [])

    const create_sub_begin_2d_practice = useCallback(() => {
        // setting the
        const pointDragCb = (pos: [number, number, number]) => {
            const _vecSetRef = x1base_startRef
            if (_vecSetRef.current) {
                _vecSetRef.current({
                    vector: pos,
                    config: sConfigs['FASTER'],
                })
            }
        }
        pulsingDragCallbackRef.current = pointDragCb

        const basisConfirmed = (pos: VectorArray) => {
            console.log('data has been set!')
            set_span2d_data((data) => ({ ...data, base1: pos }))
        }
        userBasisConfirmedRef.current = basisConfirmed

        // Defining Sub01:'starting off a 2D span'
        const sub = new Subsection({
            title: 'starting practice 2D Sapn',
            secNumber: 1,
            subNumber: 0,
            meta: 'make things ready for practice 2D span',
        })
        sub.add({
            anim: STORAGE['anim_line'],
            props: {
                to: {
                    opacity: 0,
                },
                meta: 'hide line',
            },
        })
            .add({
                anim: STORAGE['anim_points'],
                props: {
                    to: () => ({ opacity: 0 }),
                    meta: 'hide all points',
                },
            })

            .add({
                anim: STORAGE['anim_x1b'],
                props: {
                    to: {
                        visible: true,
                        opacity: 1,
                    },
                    meta: 'make x1b visble',
                },
            })
            .add({
                anim: STORAGE['anim_x2b'],
                props: {
                    to: {
                        visible: true,
                        opacity: 1,
                    },
                    meta: 'make x2b visble',
                },
            })
            .add({
                anim: STORAGE['pulsing_point'],
                props: {
                    to: {
                        opacity: 1,
                        color: 'blue',
                    },
                    meta: 'setting pulsing point for changing the x1b',
                },
            })
            .nextCon()

        return sub

        // })
    }, [])

    const create_sub_lincomb_practice = useCallback(() => {
        const delay = 200

        // Defining Sub02:' 2D span: linear combination of alpha*x1+x2'
        const sub = new Subsection({
            title: '2D span practice alpha*x1+x2',
            secNumber: 2,
            subNumber: 0,
            meta: 'pracitce linear combination: 2d span ',
        })

        sub.add({
            anim: STORAGE['anim_x1'],
            props: {
                to: {
                    vector: span2d_data['base1'],
                    visible: true,
                    opacity: 1,
                    label_factor: 1,
                    origin: [0, 0, 0],
                },
                settings: {
                    config: sConfigs['FAST'],
                },
                meta: `set x1 to new poistion from user data`,
            },
        })
            .add({
                anim: STORAGE['anim_line'],
                props: {
                    to: {
                        p1: linearComb({
                            vec1: span2d_data['base1'],
                            vec2: x2_base,
                            alpha1: 4.2,
                        }),
                        visible: true,
                        p2: linearComb({
                            vec1: span2d_data['base1'],
                            vec2: x2_base,
                            alpha1: 4.2,
                        }),
                    },

                    meta: 'setting first point of the line to the new position',
                },
            })
            .nextCon()
            .add({
                anim: STORAGE['anim_u'],
                props: {
                    to: {
                        visible: true,
                        opacity: 0,
                        vector: linearComb({
                            vec1: span2d_data['base1'],
                            vec2: x2_base,
                            alpha1: 1,
                            alpha2: 1,
                        }),
                    },
                    settings: { config: sConfigs['FASTs'] },
                    meta: 'make u visble',
                },
            })
            .nextCon()
            .add({
                anim: STORAGE['anim_x1'],
                props: {
                    to: {
                        origin: x2_base,
                    },
                    settings: {
                        config: sConfigs['FAST'],
                    },
                    meta: 'setting origing of the x1 to x2base',
                },
            })
            .add({
                anim: STORAGE['anim_x1b'],
                props: {
                    to: {
                        opacity: 0,
                    },
                    settings: {
                        config: sConfigs['FAST'],
                    },
                    meta: 'hide x1 base',
                },
            })
            .nextCon()
            .add({
                anim: STORAGE['anim_u'],
                props: {
                    to: {
                        opacity: 1,
                    },
                    settings: { config: sConfigs['SLOW'] },
                    meta: 'make u visble',
                },
            })
            .nextCon()

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
            const v1 = sMultiply(alpha, span2d_data['base1'])
            const uv = linearComb({ vec1: x2_base, vec2: v1 })
            if (i !== 0) {
                sub.nextCon()
            }
            sub.add({
                anim: STORAGE['anim_x1'],
                props: {
                    to: {
                        vector: v1,
                        label_factor: alpha,
                        label_transform: `translate${x1labeltrans[i]}`,
                    },
                    settings: {
                        config: sConfigs['default'],
                        delay: 0,
                    },
                    meta: `set x1 to ${alpha} * x1`,
                },
            })
                .add({
                    anim: STORAGE['anim_u'],
                    props: {
                        to: {
                            vector: uv,
                            label_transform: `translate${ulabeltrans[i]}`,
                        },
                        settings: {
                            config: sConfigs['default'],
                            delay: 0,
                        },
                        meta: `set u to ${alpha}*x1 + x2`,
                    },
                })
                .nextCon()
                .add<Function>({
                    anim: STORAGE['anim_points'],
                    props: {
                        to: ((idx) => (i) => {
                            if (i === idx) {
                                return {
                                    from: {
                                        radius: 0.0001,
                                        visible: true,
                                        opacity: 1,
                                        position: points[i].position,
                                    },
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
        sub.add({
            anim: STORAGE['anim_x2'],
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
                anim: STORAGE['anim_x1'],
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
                anim: STORAGE['anim_u'],
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
                anim: STORAGE['anim_line'],
                props: {
                    to: {
                        opacity: 1,
                    },

                    meta: 'set line visible',
                },
            })
            .add({
                anim: STORAGE['anim_line'],
                props: {
                    to: {
                        p2: linearComb({
                            vec1: span2d_data['base1'],
                            vec2: x2_base,
                            alpha1: -3.1,
                        }),
                    },
                    settings: { config: sConfigs['VSLOW'] },
                    meta: 'drawing a mline thorought new lc points',
                },
            })

        return sub
    }, [span2d_data])

    const animate = useCallback(async () => {
        if (started.current[0] === false) {
            createCoordinatesAnims()
            createbasisAnims()
            const section0 = create_section_2dSpan()
            const section1 = new Section({
                title: 'test',
                secNumber: 1,
                subs: [create_sub_begin_2d_practice()],
            })
            started.current[0] = true
            await mplayer({
                sections: [],
                setProgress: setProgressbarRef.current,
                progressRef: currProgress,
            })
            await mplayer({
                sections: [section1],
                setProgress: setProgressbarRef.current,
                progressRef: currProgress,
            })
        }
    }, [])

    useEffect(() => {
        let practice_2d_span_Sub: Subsection

        if (span2d_data['base1'] !== x1_base) {
            practice_2d_span_Sub = create_sub_lincomb_practice()
            console.log('practic created')
            started.current[1] = true
        }
        if (started.current[1]) {
            const section2 = new Section({
                title: 'test',
                secNumber: 2,
                subs: [practice_2d_span_Sub],
            })
            console.log('practic runs!')
            mplayer({
                sections: [section2],
                setProgress: setProgressbarRef.current,
                progressRef: currProgress,
            })
        }
    }, [span2d_data])
    // const animateSec1 = useCallback(async () => {

    //     const section0 = create2dSpan()
    //     const section1 = new Section({
    //         title: 'test',
    //         secNumber: 1,
    //         subs: [create_sub_begin_2d_practice()],
    //     })
    //     mplayer({
    //         sections: [section0],
    //         setProgress: setProgressbarRef.current,
    //         progressRef: currProgress,
    //     })
    // }, [])

    useEffect(() => {
        if (setxAxesRef.current && !pause) {
            animate()
        }
    }, [pause, span2d_data])

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
        setPointsRef,
        points,
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
        setPulsingPointRef,
        userBasisConfirmedRef,
        pulsingDragCallbackRef,
    }
}
