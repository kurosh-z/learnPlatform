import React, { useRef, useEffect, useCallback } from 'react'
import { useSpring, animated as a } from 'react-spring'
// import { useSprings, config, animated as a, useSpring } from 'react-spring';
import { css as emoCSS } from '@emotion/core'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'
import { useUiState, useUiDispatch } from '../app_states/stateContext'
// import HomePage from '../homepage/HomePage';
// import Probability01 from '../Courses/Probability01';

// sidebar width:
const SWIDTH = 600
const SWIDTH_MOB = 350
const BTM_CONST_MOB = 150
const BTM_CONST = 380

const PanelCanvas: React.FC<{
    navTop: number
    navBottom: number
    sWidth: number
}> = ({ navBottom, navTop, sWidth }) => {
    const canvRef = useRef<HTMLCanvasElement>(null)

    if (canvRef.current) {
        const canv = canvRef.current
        const ctx = canv.getContext('2d')
        const newH = window.innerHeight
        canv.height = newH
        // ctx.clearRect(0, 0, 600, newH);
        ctx.fillStyle = '#2c142e' //'#1a1c1a'; //'#bababa'; // '#2c142e';
        ctx.beginPath()
        ctx.moveTo(sWidth, 0)
        ctx.lineTo(navTop, 0)
        ctx.lineTo(navBottom, newH)
        ctx.lineTo(sWidth, newH)
        // ctx.lineTo(sWidth, 0);
        ctx.closePath()
        ctx.fill()
    }

    const theme = useTheme<Theme>()
    const sidepanel__canv = emoCSS({
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        // minWidth: 280,
        width: sWidth,
        opacity: 1,
        zIndex: theme.zIndices.sticky,
    })
    const uiState = useUiState()

    return (
        <canvas
            style={{ display: uiState.nav !== 'closed' ? 'block' : 'none' }}
            id="sideBg"
            css={sidepanel__canv}
            ref={(el) => {
                canvRef.current = el
            }}
            className="sidepanel__bg"
            width={sWidth - 20}
            height="1000"
        ></canvas>
    )
}

const ApanelCanvas = a(PanelCanvas)

const SidePanel: React.FC = () => {
    // const [opened, setOpened] = useState<boolean>(true)
    const uiState = useUiState()
    const uiDispatch = useUiDispatch()

    const sWidth = uiState.isMobile ? SWIDTH_MOB : SWIDTH
    const BtmConst = uiState.isMobile ? BTM_CONST_MOB : BTM_CONST

    const [{ navBottom }, setNavBottom] = useSpring(() => ({
        navBottom: sWidth,
        config: { mass: 1, friction: 30, velocity: 0 },
    }))
    const [{ navTop }, setNavTop] = useSpring(() => ({
        navTop: sWidth,
        config: { mass: 1.4, friction: 40, tension: 340, delay: 5000 },
        onRest: () => {
            uiDispatch({ type: '[ui] nav anim finished' })
        },
    }))

    const openCallback = useCallback(async () => {
        await Promise.all([
            uiDispatch({ type: '[ui] nav anim progress' }),
            setNavBottom({
                navBottom: sWidth - BtmConst,
                config: { tension: 180 },
            }),
            setNavTop({
                navTop: 0,
            }),
        ])
    }, [])

    const closeCallback = useCallback(async () => {
        await Promise.all([
            uiDispatch({ type: '[ui] nav anim progress' }),
            setNavBottom({ navBottom: sWidth, config: { tension: 150 } }),
            setNavTop({ navTop: sWidth }),
        ])
    }, [])

    useEffect(() => {
        if (uiState.navToggle === 'open') {
            openCallback()
        } else if (uiState.navToggle === 'close' && uiState.nav !== 'closed') {
            closeCallback()
        }
    }, [uiState.navToggle])

    const theme = useTheme<Theme>()

    const sidepanel = emoCSS({
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        minWidth: 500,
        // backgroundColor: 'black',
        zIndex: theme.zIndices.sticky,
        backgroundColor: 'transparent',

        a: {
            color: theme.palette.white.light,
            fontFamily: 'open-sans,Helvetica,Arial,sans-serif',
            textTransform: 'uppercase',
            textDecoration: 'none',
        },
        '.sidepanel__up': {
            boreder: '1px solid red',
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            top: 150,
            right: 20,
            //   marginTop: 150,
            flexWrap: 'nowrap',
            whiteSpace: 'nowrap',
            textAlign: 'right',
            color: 'red',
            fontSize: theme.typography.fontSizes[2],
            letterSpacing: theme.spaces.sm, // TODO:consider changing the theme spacing
            [theme.mediaQueries.sm]: {
                fontSize: theme.typography.fontSizes[4],
                right: 40,
            },
        },
        '.sidepanel__down': {
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            bottom: 100,
            right: 30,
            fontSize: theme.typography.fontSizes[0],
            [theme.mediaQueries.sm]: {
                fontSize: theme.typography.fontSizes[0],
                right: 100,
            },
        },
    })
    return (
        <Router>
            <ApanelCanvas
                navBottom={navBottom}
                navTop={navTop}
                sWidth={sWidth}
            />
            <div
                className="sidepanel"
                css={sidepanel}
                style={{
                    display: uiState.navToggle === 'open' ? 'block' : 'none',
                }}
            >
                <div className="sidepanel__up">
                    {/* upper list items:  */}
                    <ul className="up__list">
                        {/* ------------------ */}
                        <li className="up__list__item">
                            <a href="/" className="home">
                                home
                            </a>
                        </li>
                        {/* ------------------ */}

                        <li className="up__list__item">
                            <a href="/courses" className="Courses">
                                courses
                            </a>
                        </li>
                        {/* ------------------ */}

                        <li className="up__list__item">
                            <Link to={`/community`} className="community">
                                our community
                            </Link>
                        </li>
                        {/* ------------------ */}
                    </ul>
                </div>
                {/* upper list items:  */}
                <div className="sidepanel__down">
                    <ul className="down__list">
                        {/* ------------------ */}
                        <li className="down__list__item">
                            <a href="#" className="faq">
                                FAQ
                            </a>
                        </li>
                        {/* ------------------ */}
                        <li className="down__list__item">
                            <Link to="/about" className="about">
                                About Us
                            </Link>
                        </li>
                        {/* ------------------ */}
                        <li className="down__list__item">
                            <a href="#" className="contact">
                                Contact us
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </Router>
    )
}

export default SidePanel
