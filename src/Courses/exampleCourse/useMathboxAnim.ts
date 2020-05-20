import { useState, useCallback, useRef } from 'react'
import { useSpring } from 'react-spring'
import { SpringHandle } from '@react-spring/core'
import { sMultiply as multiply, addVectors } from '../../shared'
import { VectorProps } from '../courseComps/LinearCombination'
const SLOW = { friction: 30, mass: 2, tension: 40 }
const VSLOW = { friction: 100, mass: 3, tension: 80 }

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

export function useMathboxAnim({ scale }) {
    const x1_base: VectorProps['vec'] = [scale(2), scale(-2), 0]
    const x2_base: VectorProps['vec'] = [scale(2), scale(3), 0]
    //mathbox State
    const [newPoints, addNewPoints] = useState({})
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
        }>
    >(null)
    const [line, setLine] = useSpring<{
        opacity: number
        p1: VectorProps['vec']
        p2: VectorProps['vec']
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
            const delay = 100
            await animX1({
                to: { origin: x2_base, base_opacity: 0 },
                delay,
                // config: SLOW,
            })
            await Promise.all([
                animX1({
                    vec: multiply(6, x1_base),
                    factor: 6,
                    delay: delay,
                    // config: SLOW,
                }),
                set_u({
                    opacity: 1,
                    // config: SLOW,
                }),
            ])
            await Promise.all([
                addNewPoints({
                    p2: {
                        color: 'gray',
                        radius: 0.07,
                        opacity: 1,
                        position: linearComb({
                            alpha1: 6,
                            vec1: x1_base,
                            vec2: x2_base,
                        }),
                    },
                }),
            ])
            for (let alpha = -5; alpha < 5; alpha++) {
                await animX1({
                    vec: multiply(-alpha, x1_base),
                    factor: -alpha,
                    delay: delay,
                })
                await Promise.all([
                    addNewPoints({
                        p3: {
                            color: 'gray',
                            radius: 0.07,
                            opacity: 1,
                            position: linearComb({
                                alpha1: -alpha,
                                vec1: x1_base,
                                vec2: x2_base,
                            }),
                        },
                    }),
                ])
            }

            await Promise.all([
                animX1({ opacity: 0 }),
                setv_x2({ to: { opacity: 0, base_opacity: 0 } }),
                set_u({ to: { opacity: 0 } }),
                setLine({
                    to: {
                        opacity: 1,
                        p2: linearComb({
                            alpha1: -5,
                            vec1: x1_base,
                            vec2: x2_base,
                        }),
                    },
                }),
            ])
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
        newPoints: newPoints,
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
    }
}
