import React, { useEffect, useRef, useState } from 'react'
import { useSpring, animated } from 'react-spring'
import { SpringHandle, SpringConfig } from '@react-spring/core'
import { useThree } from 'react-three-fiber'
import { Vector3 } from 'three'
import { useDrag } from 'react-use-gesture'
import { Aspoint } from './Point'
import { Events } from './types'

const mouse = new Vector3()
export type AnimatedPulsingPointProps = {
    coreR?: number
    pulsingR?: number
    color?: string
    position: [number, number, number]
    opacity?: number
}

declare type SetPulsingPoint = (props: {
    to: AnimatedPulsingPointProps
    from?: AnimatedPulsingPointProps
    config: SpringConfig
}) => Promise<object>

type PulsingPointProps = {
    from: AnimatedPulsingPointProps
    pause?: boolean
    setSrpingRef: React.MutableRefObject<SetPulsingPoint>
    dragCallBack?: (pos: [number, number, number]) => void
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
    dragCallBack,
}) => {
    const {
        color = 'red',
        opacity = 1,
        coreR = 0.05,
        pulsingR = 0.12,
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

    useEffect(() => {
        const setSpringFunc: SetPulsingPoint = async ({ to, from, config }) => {
            const res0 = Promise.all([
                setCore({
                    to: {
                        color: to.color,
                        coreR: to.coreR,
                        position: to.position,
                        opacity: to.opacity,
                    },
                    from: from,
                    config,
                }),
                setPulse({
                    to: {
                        color: to.color,
                        pulsingR: to.pulsingR,
                    },
                    from: from,
                    config,
                }),
            ])

            return res0
        }
        setSrpingRef.current = setSpringFunc
    }, [])

    const [blink, setBlink] = useState(true)

    useEffect(() => {
        if (pause === false)
            setPulse({
                from: {
                    opacity: 0,
                    pulsingR: coreR,
                },
                to: {
                    opacity: 0.5,
                    pulsingR,
                },
                loop: blink,
                config: { friction: 20, mass: 2, tension: 60 },
            })
    }, [pause, blink])

    useEffect(() => {
        if (pause) {
            coreRef.current.pause()
            pulseRef.current.pause()
        }
    }, [pause])

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
        const _width = scale(
            (43 * window.innerWidth) / window.innerHeight / 1.7628
        ) // width of canvas in camera world
        const _height = scale(24)
        const _pos: [number, number, number] = [
            (_width / 2) * mouse.x,
            (_height / 2) * mouse.y,
            0,
        ]
        if (down) {
            setBlink(false)
            if (dragCallBack) {
                dragCallBack(_pos)
            }
            setCore({
                position: _pos,
                config: { friction: 23, mass: 1, tension: 170 },
            })
        }
    })

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
            />
        </>
    )
}
