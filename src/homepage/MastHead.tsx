import React, { useRef } from 'react'
import { useSpring, animated as a } from 'react-spring'
import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'
import { useScrollPosition } from '../shared'
// import { useUiState } from '../app_states/stateContext'
// import { alpha } from '../theme/colors'
// homepage master header :
const MastHead: React.FC<{}> = () => {
    // getting theme from emotion
    const theme = useTheme<Theme>()
    const videoRef = useRef(null)
    // console.log('op', videoOpacity);
    // styling:
    const styleCss = emoCSS({
        position: 'relative',
        textAlign: 'left',
        '.masthead__imgwrapper': {
            marginTop: '60px',
        },
        '.masthead__img': {
            maxWidth: '100%',
            height: 'auto',
        },
        '.masthead__videosizewrapper': {
            position: 'fixed',
            width: 'calc(100vh * (1000 / 562))',
            height: 'calc(100vw * (562 / 1000))',
            minWidth: '100%',
            minHeight: '100%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            // backgroundColor: 'red',
            opacity: 1,
            zIndex: theme.zIndices.back,
        },

        '.masthead__video': {
            position: 'absolute',
            top: 0,
            left: 0,
            padding: 0,
            margin: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            // opacity: videoOpacity
        },
        '.masthead__overlay': {
            opacity: 0.93,
            position: 'absolute',
            top: 0,
            width: '100%',
            paddingTop: '56.2%',
            paddingBottom: '20px',
            // backgroundColor: theme.palette.aubergine.dark,
            // backgroundColor: theme.palette.white.base,
            willChange: 'background-color',
            transition: 'background-color .5s ease-in-out',
        },
    })

    const [{ scroll }, setScroll] = useSpring(() => ({
        scroll: window.innerHeight / 8,
        config: { mass: 1, friction: 40, tension: 130 },
    }))
    const scrollThreshold = window.innerHeight / 8
    useScrollPosition(
        ({ currPos }) => {
            const currScroll = Math.abs(currPos.y)
            const threshold = currScroll > scrollThreshold
            const maxScroll = 4 * scrollThreshold
            setScroll({
                scroll: threshold
                    ? currScroll <= maxScroll
                        ? currScroll
                        : maxScroll
                    : scrollThreshold,
            })
        },

        [],
        null,
        false
    )
    // const uiState = useUiState()

    return (
        <header className="masthead" css={styleCss}>
            <div className="masthead__imgwrapper">
                <img
                    className="masthead__img"
                    src="https://www.joinef.com/wp-content/uploads/2018/11/homepage.header-1600x900.png"
                />
            </div>

            {/* <div className='masthead__videoposwrapper'> */}
            <a.div
                className="masthead__videosizewrapper"
                style={{
                    opacity: scroll.interpolate(
                        (s) =>
                            (8 * s - 32 * scrollThreshold) /
                            (-24 * scrollThreshold)
                    ),
                }}
            >
                <iframe
                    ref={videoRef}
                    className="masthead__video"
                    src="https://player.vimeo.com/video/181194082?title=1&amp;byline=0&amp;portrait=0&amp;color=ebbe1e?controls=0&amp;title=0&amp;byline=0&amp;autoplay=1&amp;loop=1&amp;background=1&amp;hd=1&amp;dnt=0&amp;;#t=28s"
                    // src='//player.vimeo.com/video/307251728?title=1&amp;byline=0&amp;portrait=0&amp;color=ebbe1e?controls=0&amp;title=0&amp;byline=0&amp;autoplay=1&amp;loop=1&amp;background=1&amp;hd=1&amp;volume=0'
                    width="640"
                    height="480" //358
                    frameBorder="0"
                    allowFullScreen
                ></iframe>
                <div
                    className="masthead__overlay"
                    style={{
                        backgroundColor: theme.palette.aubergine.dark,
                    }}
                />
            </a.div>
            {/* </div> */}
        </header>
    )
}

export default MastHead
