import React, { useRef, useEffect } from 'react'
import { useSpring, config, animated as a } from 'react-spring'
import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'
import MastHead from './MastHead'
import Card from './Card'
import NavPanel from '../shared/NavPanel'
// import { alpha } from '../theme/colors'
// import { useThemeToggler } from './theme/themeContext';

interface AnimPorps {
    offset: number
}

// initial offset of videotriger element to top of the windwo , we use this to interpolate opacity of video
let initialOffset = 480

// make animated version of comonents useSpring on it.
const AnimMastHead = a(MastHead)

// Homepage component:
const HomePage: React.FC<{}> = () => {
    // reference to the components
    const videobgtriggerEl = useRef<HTMLDivElement>(null)

    // getting theme from emotion
    const theme = useTheme<Theme>()

    // use offset of videotrigger element to top of the window to animate opacity of the video
    const [{ offset }, set] = useSpring<AnimPorps>(() => ({
        offset: initialOffset,
        config: config.molasses,
    }))
    // TODO: is there any better way to set the initialOffset after DOM is loaded?
    useEffect(() => {
        setTimeout(function () {
            if (!videobgtriggerEl.current) return
            const rect = videobgtriggerEl.current.getBoundingClientRect()
            initialOffset = rect.top
            // console.log('init', initialOffset);
        }, 1200)
    })
    //  interpolating video opacity
    const opMastHead = offset.interpolate((off) => {
        if (typeof off !== 'number') return
        // as offset: initialoffset -> 0 ==> opacity goes: 1 -> 0
        if (off < -100) return 0
        return off >= 0 ? 1 + (off - initialOffset) / (initialOffset - 80) : 0
    })

    // styling:
    const homepageCss = emoCSS({
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'scroll',
        // backgroundColor: theme.palette.aubergine.dark
    })

    return (
        <div className="homepage" css={homepageCss}>
            {/* <SidePanel open={sidepanelOn} />
      <AnimHeaderPanel opacity={navOp} burgerCB={burgerCB} /> */}
            <NavPanel
                background_color={'transparent'}
                textColor_closed={theme.palette.white.base}
                textColor_opened={theme.palette.white.base}
                // navCB={burgerCB}
            />
            <section className="mainpage">
                <AnimMastHead
                    videoOpacity={opMastHead}
                    overlayColor={theme.palette.aubergine.lightest}
                />
                <div className="videobgtrigger" ref={videobgtriggerEl}></div>
                <Card
                    title1="Found the Future"
                    text=" Entrepreneur First is the world’s leading talent investor. We
                  invest time and money in the world’s most talented and
                  ambitious individuals, helping them to find a co-founder,
                  develop an idea, and start a company. So far, we’ve helped
                  2,000+ people create 300+ companies, worth a combined $2bn
                  "
                    textPosition="center"
                ></Card>
                <Card
                    title1="Imagination"
                    title2="is more important than knowledge"
                    text="   “For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution” ―Albert Einstein"
                    imgsrc={
                        'https://drive.google.com/uc?id=1Y2iLsdxh9xdC4ioEIoSnjVyQOp4eqq1L'
                    }
                ></Card>
                <Card
                    title1=" “change"
                    title2="is the end result"
                    text="  of all true learning.” ―Leo Buscaglia
          This last one is mine! You’re always going to encounter a learning curve when 
          you learn something new — it’s one of the requirements to actually learning!
           The frustrations and struggles that come with it are also a requirement.
          The learning curve doesn’t mean that you should quit — as long as you
           face the challenges and work through those frustrations, you will make progress."
                    imgsrc="https://drive.google.com/uc?id=1IryuCDSzc03VVVqmUubwi9gCD31duCBE"
                    textPosition="end"
                ></Card>
            </section>
        </div>
    )
}

export default HomePage
