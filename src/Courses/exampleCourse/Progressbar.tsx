import React, { useMemo, useEffect, useRef } from 'react'
import { useSprings, useSpring, a } from 'react-spring'
import { SpringStartFn, SpringHandle } from '@react-spring/core'

import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../../theme/types'
import { alpha } from '../../theme/colors'
import PlayButton from '../../components/button/PlayButtton'
import { MathBoxActions, MathBoxState, TOGGLE_PAUSE } from './mathBoxReducer'

const AplayBtn = a(PlayButton)
export type AnimatedProgressbarProps = { width: string; titleColor: string }
export type SetProgressbar = SpringStartFn<AnimatedProgressbarProps>
type ProgressbarProps = {
    sections: { title: string; meta?: string }[]
    mathboxState: MathBoxState
    mathboxDispatch: React.Dispatch<MathBoxActions>
    setSpringsRef: React.MutableRefObject<SetProgressbar>
}

export const Progressbar: React.FC<ProgressbarProps> = ({
    sections,
    mathboxDispatch,
    mathboxState,
    setSpringsRef,
}) => {
    const theme = useTheme<Theme>()
    const springsRef = useRef<SpringHandle<AnimatedProgressbarProps>>(null)
    const [springs, setSprings] = useSprings(sections.length, () => ({
        ref: springsRef,
        width: '0%',
        titleColor: 'black',
    }))

    useEffect(() => {
        setSpringsRef.current = setSprings
    }, [])

    useEffect(() => {
        if (mathboxState.pause && springsRef.current) {
            springsRef.current.pause()
        }
    }, [mathboxState.pause])

    const mplayer_css = useMemo(() => {
        const progressbar_height = 0.5
        const mplayr_css = emoCSS({
            backgroundColor: 'transparent',
            padding: '.1rem',
            height: '2rem',
            width: 'calc(100% - .6rem)',
            position: 'absolute',
            transform: 'translate(-50% , -50%)',
            top: 'calc(100% - 1.5rem)',
            left: '50%',
            '.mplayer__ctrls': {
                display: 'flex',
                flexDirection: 'row',
                position: 'relative',
                width: '100%',
                height: '100%',
                alignContent: 'center',

                // overflow: 'hidden',
            },
            '.mplayer__progressbar': {
                height: progressbar_height + 'rem',
                borderRadius: theme.radii.sm,
                alignSelf: 'center',
                marginLeft: '.4rem',
                width: 'calc(100% - 60px)',
                zIndex: theme.zIndices.fixed,
                backgroundColor: alpha(theme.palette.white.base, 0.5),
                overflow: 'visible',
                cursor: 'pointer',
            },
            '.progressbar__sectList': {
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around',
                // color: 'white',
            },
            '.section': {
                position: 'relative',
                height: '.3rem',
                marginTop: (progressbar_height - 0.3) / 2 + 'rem',
                marginBottom: (progressbar_height - 0.3) / 2 + 'rem',
                marginRight: '.8rem',
                borderRadius: theme.radii.sm,
                alignSelf: 'center',
                width: `calc(99%/${sections.length})`,
                backgroundColor: alpha(theme.palette.gray.lightest, 0.3),
                display: 'flex',
                justifyContent: 'center',
                '&:hover': {
                    '.section__title': {
                        opacity: 1,
                        transition: 'opacity .3s ease-in-out 0s',
                    },
                },
            },
            '.section_progress': {
                position: 'absolute',
                left: '0.01rem',
                borderRadius: theme.radii.sm,
                opacity: 0.7,
                height: '.35rem',
                // backgroundColor: theme.palette.blue.base,
                backgroundColor: theme.palette.green.base,
            },
            '.section__title': {
                fontSize: '1rem',
                fontWeight: theme.typography.fontWeights.bold,
                position: 'absolute',
                bottom: '1.4rem',
                opacity: 0,
                overflow: 'hidden',
                transition: 'opacity .3s ease-in-out .2s',
            },

            '.mplayer__playbtn': {
                zIndex: theme.zIndices.tooltip,
                willChange: 'top, left',
                width: '30px',
            },
        })

        return mplayr_css
    }, [theme, sections.length])

    const [{ psize, ...playbtnStyle }, setPlaybtn] = useSpring(() => ({
        psize: 30,
    }))
    return (
        <div className="mplayer" css={mplayer_css}>
            <div className="mplayer__ctrls">
                <AplayBtn
                    className="mplayer__playbtn"
                    size={psize}
                    style={playbtnStyle}
                    onClick={(ev) => {
                        mathboxDispatch({ type: TOGGLE_PAUSE })
                    }}
                />
                <a.div className="mplayer__progressbar">
                    <a.ul className="progressbar__sectList">
                        {springs.map((prStyle, idx) => {
                            return (
                                <a.li className="section" key={idx}>
                                    {/* <a.span className="section__title">
                                        {sections[idx]['title']}
                                    </a.span> */}
                                    <Title
                                        title={sections[idx]['title']}
                                        color={prStyle.titleColor}
                                    />
                                    <Sprogress width={prStyle.width} />
                                    {/* // <a.span
                                    //     className="section_progress"
                                    //     style={prgoressStyle}
                                    // ></a.span> */}
                                </a.li>
                            )
                        })}
                    </a.ul>
                </a.div>
            </div>
        </div>
    )
}

const Title = a(({ title, color }) => {
    return (
        <span style={{ color }} className="section__title">
            {title}
        </span>
    )
})

const Sprogress = a(({ width }) => {
    return <a.span className="section_progress" style={{ width }} />
})
