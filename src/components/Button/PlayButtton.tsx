import React, { useMemo, useState } from 'react'
import { css as emoCSS } from '@emotion/core'

type PlayButtonPrps = {
    size?: number
    style: React.CSSProperties
    className?: string
    onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
}
const PlayButton: React.FC<PlayButtonPrps> = ({
    size = 100,
    style,
    className,
    onClick,
}) => {
    const playBtn = useMemo(
        () =>
            emoCSS({
                /*  border: 1px solid red;*/
                display: 'inline-block',
                width: '100%',
                height: '100%',
                // transition: 'all 0.5s ease',
                svg: {
                    backgorundColor: 'red',
                },
                '.pause_l1, .pause_l2': {
                    stroke: '#000',
                    opacity: 0,
                    transform: 'scale(0)',
                    // strokeDasharray: 100,
                    // strokeDashoffset: 100,
                    transition: 'all .4 ease-in-out',
                },
                '&.clicked': {
                    '.pause_l1, .pause_l2': {
                        // strokeDashoffset: 0,
                        opacity: 1,
                        transform: 'scale(1)',
                        // strokeDasharray: 0,
                        // transition:
                        //     'stroke-dashoffset 0.2s ease-in-out,  opacity 0.3s ease-in-out ',
                        transition: 'all .4 ease-in-out',
                    },
                    '.play__triangle': {
                        opacity: 0,
                    },
                },

                '.play__triangle': {
                    transition:
                        'stroke-dashoffset 0.4s ease-in-out, opacity 0.3s ease-in-out',
                    strokeDasharray: 290,
                    strokeDashoffset: 580,
                    stroke: '#000',
                    transform: 'translateY(0)',
                },
                '&:hover': {
                    '.play__triangle': {
                        strokeDashoffset: 0,
                        // opacity: 1,
                        stroke: '#f8aa28',
                        animation: 'nudge 0.4s ease-in-out',

                        '@keyframes nudge': {
                            '0%': {
                                transform: 'translateX(0)',
                            },
                            '30%': {
                                transform: 'translateX(-5px)',
                            },
                            '50%': {
                                transform: 'translateX(5px)',
                            },
                            '70%': {
                                transform: 'translateX(-2px)',
                            },
                            '100%': {
                                transform: 'translateX(0)',
                            },
                        },
                    },
                },
            }),
        []
    )
    // onClick handler:
    const [clicked, toggle] = useState(false)

    return (
        <div
            className={
                className
                    ? 'playBtn__container ' + className
                    : 'playBtn__container '
            }
            style={style}
        >
            <a
                href="#"
                className={clicked ? 'playBtn clicked' : 'playBtn'}
                role="button"
                css={playBtn}
                onClick={(event) => {
                    toggle(!clicked)
                    onClick(event)
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns-xlink="http://www.w3.org/1999/xlink"
                    xmlns-a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
                    x="0px"
                    y="0px"
                    // width="213.7px"
                    // height="213.7px"
                    // width={`${size}px`}
                    height={`${size}px`}
                    // viewBox="0 0 213.7 213.7"
                    viewBox="0 0 110 110"
                    // enableBackground="new 0 0 213.7 213.7"
                    xml-space="preserve"
                >
                    <polygon
                        className="play__triangle"
                        id="XMLID_18_"
                        fill="none"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeMiterlimit="10"
                        points="5,5  105,55 5,105"
                    />
                    <line
                        className="pause_l1"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        x1="25"
                        y1="5"
                        x2="25"
                        y2="100"
                    />
                    <line
                        className="pause_l2"
                        fill="none"
                        strokeWidth="10"
                        strokeLinecap="round"
                        x1="60"
                        y1="5"
                        x2="60"
                        y2="100"
                    />
                    {/* <circle
                        className="circle"
                        id="XMLID_17_"
                        fill="none"
                        strokeWidth="7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeMiterlimit="10"
                        cx="106.8"
                        cy="106.8"
                        r="103.3"
                    /> */}
                </svg>
            </a>
        </div>
    )
}

export default PlayButton
