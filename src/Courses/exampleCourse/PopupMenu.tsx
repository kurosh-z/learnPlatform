import React, { useRef, useEffect, useMemo, useCallback } from 'react'
import { css as emoCSS } from '@emotion/core'
import { alpha } from '../../theme'
import { useTransition, useSpring, config, a } from 'react-spring'

type PopupContainerProps = {
    transform: string
    background: string
    opacity: number
}

const PopupContainer: React.FC<PopupContainerProps> = ({
    transform,
    background,
    opacity,
    children,
}) => {
    const popup_css = useMemo(
        () =>
            emoCSS({
                userSelect: 'none',
                position: 'absolute',
                margin: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                height: 80,
                width: 120,
                background: '#302f36',
                borderRadius: 5,
                transformOrigin: 'center center',
                cursor: 'pointer',
                boxShadow: '-2px 10px 10px -5px rgba(0, 0, 0, 0.1)',
                willChange: 'transfrom',
                '.popup__item': {
                    textAlign: 'center',
                    lineHeight: '30px',
                    width: 100,
                    height: 30,
                    borderRadius: 3,
                    background: alpha('white', 0.7),
                    '&:focus': {
                        outline: 'none',
                    },
                    transition:
                        'box-shadow .1s ease-in-out, font-weight .1s ease-in-out',
                    '&:hover': {
                        boxShadow: 'inset 0 -3em 3em rgba(255,255,255,0.5)',
                        fontWeight: 'bold',
                    },
                },
            }),
        []
    )

    return (
        <div
            className="popup__container"
            css={popup_css}
            style={{
                opacity,
                background,
                transform,
                display: opacity > 0 ? 'flex' : 'none',
            }}
        >
            {children}
        </div>
    )
}

const Container = a(PopupContainer)

type PopupMenuProps = {
    opened: boolean
    setCallback: () => void
}

export const PopupMenu: React.FC<PopupMenuProps> = ({
    opened,
    setCallback,
}) => {
    const springRef = useRef(null)
    const contSpring = useSpring({
        ref: springRef,
        config: config.stiff,
        transform: 'scale(0.4)',
        opacity: 0.1,
        from: { background: 'white' },
        to: {
            transform: opened ? 'scale(1.0)' : 'scale(0.4)',
            background: opened ? alpha('#fc9e19', 0.9) : '#fc9e19',
            opacity: opened ? 1 : 0,
        },
    })

    const transRef = useRef(null)
    const transitions = useTransition(opened ? ['set', 'change'] : [], {
        ref: transRef,
        keys: (item) => item,
        unique: true,
        trail: 100,
        from: { opacity: 0, transform: 'scale(0)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0)' },
    })

    const setItemClickHandler = useCallback(
        (ev: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
            ev.preventDefault()
            ev.stopPropagation()
            setCallback()
        },
        []
    )
    const elements = transitions((styles, item) => {
        return (
            <a.span
                className="popup__item"
                role="button"
                tabIndex={item === 'set' ? 1 : 0}
                style={styles}
                onClick={item === 'set' ? setItemClickHandler : null}
            >
                {item}
            </a.span>
        )
    })
    useEffect(() => {
        if (springRef.current && transRef.current && opened) {
            springRef.current.start({
                to: async () => {
                    await springRef.current.start()
                    await transRef.current.start()
                },
            })
        } else if (springRef.current && transRef.current && !opened) {
            springRef.current.start({
                to: async () => {
                    await transRef.current.start()
                    await springRef.current.start()
                },
            })
        }
    }, [opened])

    return (
        <Container
            opacity={contSpring.opacity}
            transform={contSpring.transform}
            background={contSpring.background}
        >
            {elements}
        </Container>
    )
}
