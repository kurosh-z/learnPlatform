import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useSpring, animated } from 'react-spring'
import {
    SpringHandle,
    SpringConfig,
    SpringDefaultProps,
} from '@react-spring/core'
import { useThree } from 'react-three-fiber'
import { HTML } from 'drei'
import { Vector3 } from 'three'
import { useDrag } from 'react-use-gesture'
import { Aspoint } from './Point'
import { Events } from './types'
import { PopupMenu } from '../Courses/exampleCourse/PopupMenu'

const AHTML = animated(HTML)

const mouse = new Vector3()
export type AnimatedPulsingPointProps = {
    coreR?: number
    pulsingR?: number
    color?: string
    opacity?: number
    position?: [number, number, number]
}
export type PulPointDragCallback = (pos: [number, number, number]) => void
export type PulPointSetConfirmedCallback = (
    pos: [number, number, number]
) => void

export type SetPulsingPoint = (props: {
    to: AnimatedPulsingPointProps
    from?: AnimatedPulsingPointProps
    config: SpringConfig
    default: SpringDefaultProps
}) => Promise<any>

export type PulsingPointProps = {
    from: AnimatedPulsingPointProps
    pause?: boolean
    setSrpingRef: React.MutableRefObject<SetPulsingPoint>
    dragCallbackRef: React.MutableRefObject<PulPointDragCallback>
    setConfirmedCallbackRef: React.MutableRefObject<
        PulPointSetConfirmedCallback
    >
    scale: (a: number) => number
}

type CoreSpringProps = Omit<AnimatedPulsingPointProps, 'pulsingR'>
type PulsingSpringProps = Omit<AnimatedPulsingPointProps, 'coreR' | 'position'>

const Pulse: React.FC<{
    coreOpacity: number
    pulseOpacity: number
    radius: number
    color: string
    position: [number, number, number]
    onClick?: Events['onClick']
    onPointerUp?: Events['onPointerUp']
    onPointerDown?: Events['onPointerDown']
    onPointerOver?: Events['onPointerOver']
    onPointerOut?: Events['onPointerOut']
    onPointerMove?: Events['onPointerMove']
    onWheel?: Events['onWheel']
}> = ({
    coreOpacity,
    pulseOpacity,
    radius,
    position,
    color,
    children,
    ...events
}) => {
    const opacity = coreOpacity * pulseOpacity

    return (
        <Aspoint
            color={color}
            radius={radius}
            opacity={opacity}
            position={position}
            transparent={true}
            {...events}
        />
    )
}
const APulse = animated(Pulse)

export const PulsingPoint: React.FC<PulsingPointProps> = ({
    from,
    setSrpingRef,
    pause,
    scale,
    dragCallbackRef,
    setConfirmedCallbackRef,
}) => {
    const {
        color = 'red',
        opacity = 1,
        coreR = 0.05,
        pulsingR = 0.15,
        position,
    } = from

    const coreRef = useRef<SpringHandle<CoreSpringProps>>(null)
    const [coreSpring, setCore] = useSpring<CoreSpringProps>(() => ({
        ref: coreRef,
        from: {
            coreR,
            color,
            opacity,
            position,
        },
    }))
    const pulseRef = useRef<SpringHandle<PulsingSpringProps>>(null)
    const [pulseSpring, setPulse] = useSpring<PulsingSpringProps>(() => ({
        ref: pulseRef,
        from: {
            pulsingR,
            color,
            opacity: 0.2,
            position,
        },
    }))
    const [blink, setBlink] = useState(true)
    const [hovered, hover] = useState(false)
    const [popup_opened, setPopup] = useState(false)

    const { _width, _height } = useMemo(() => {
        const ratio = window.innerWidth / window.innerHeight
        // width of canvas in 3d world
        const _width = scale((43 * ratio) / 1.7628)
        const _height = scale(24)
        return { _width, _height }
    }, [window.innerWidth / window.innerHeight])

    useEffect(() => {
        const setSpringFunc: SetPulsingPoint = async (props) => {
            const { config, to, from } = props

            const res0 = Promise.all([
                setCore({
                    to: {
                        color: to.color,
                        coreR: to.coreR,
                        opacity: to.opacity,
                    },
                    from: from,
                    config,
                    default: props.default,
                }),
                setPulse({
                    to: {
                        color: to.color,
                        pulsingR: to.pulsingR,
                    },
                    from: from,
                    config,
                    default: props.default,
                }),
                setPulse({
                    from: {
                        opacity: 0.5,
                        pulsingR: coreR,
                    },
                    to: {
                        opacity: 0.01,
                        pulsingR,
                    },
                    loop: true,
                    config: { friction: 20, mass: 2, tension: 60 },
                }),
            ])

            return res0
        }
        setSrpingRef.current = setSpringFunc
    }, [])

    useEffect(() => {
        if (pause === false) {
            setPulse({
                from: {
                    opacity: 0.5,
                    pulsingR: coreR,
                },
                to: {
                    opacity: blink ? 0.03 : 0.15,
                    pulsingR,
                },
                loop: blink,
                config: { friction: 16, mass: 2, tension: 60 },
            })
        }
    }, [pause, blink])

    useEffect(() => {
        if (pause) {
            coreRef.current.pause()
            pulseRef.current.pause()
        }
    }, [pause])

    useEffect(() => {
        document.body.style.cursor = hovered ? 'grab' : 'auto'
    }, [hovered])

    const { size } = useThree()
    const bind = useDrag(({ down, xy }) => {
        const canvas = document
            .getElementById('mathbox')
            .getElementsByTagName('canvas')[0]
        const left = canvas.getClientRects()[0].left
        const top = canvas.getClientRects()[0].top

        mouse.x = (2 * (xy[0] - left)) / size.width - 1
        mouse.y = -(2 * (xy[1] - top)) / size.height + 1
        mouse.z = 0

        const _pos: [number, number, number] = [
            (_width / 2) * mouse.x,
            (_height / 2) * mouse.y,
            0,
        ]

        const _factors = [_pos[0] > 0 ? 1 : -1, _pos[1] > 0 ? 1 : -1]
        _pos[0] =
            _factors[0] * Math.min(Math.abs(_pos[0]), _width / 2 - scale(2))
        _pos[1] =
            _factors[1] * Math.min(Math.abs(_pos[1]), _height / 2 - scale(2))
        document.body.style.cursor = down
            ? 'grabbing'
            : hovered
            ? 'grab'
            : 'auto'
        if (down) {
            setBlink(false)
            if (dragCallbackRef.current) {
                dragCallbackRef.current(_pos)
            }

            setCore({
                position: _pos,
                config: { friction: 23, mass: 1, tension: 170 },
            })
            if (!popup_opened) {
                setPopup(() => true)
            }
        }
    })

    // as user click on set this function will be called
    // set confirmedCallbackRef comes from animation
    const setConfirmationHandler = useCallback(() => {
        if (setConfirmedCallbackRef.current) {
            const lastPos = coreSpring.position.animation.toValues as [
                number,
                number,
                number
            ]
            setConfirmedCallbackRef.current(lastPos)
        }
        setPopup(() => false)
    }, [])
    return (
        <>
            <Aspoint
                color={coreSpring.color}
                radius={coreSpring.coreR}
                opacity={coreSpring.opacity}
                position={coreSpring.position}
                // onPointerDown={bind()['onMouseDown']}
            />
            <APulse
                color={pulseSpring.color}
                radius={pulseSpring.pulsingR}
                coreOpacity={coreSpring.opacity}
                pulseOpacity={pulseSpring.opacity}
                position={coreSpring.position}
                onPointerDown={bind()['onMouseDown']}
                onPointerOver={() => {
                    hover(true)
                }}
                onPointerOut={() => {
                    hover(false)
                }}
            />
            <HTML position={[_width / 2 - scale(4), _height / 2 - scale(1), 0]}>
                <PopupMenu
                    opened={popup_opened}
                    setCallback={setConfirmationHandler}
                />
            </HTML>
        </>
    )
}
