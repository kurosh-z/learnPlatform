import React, { useEffect } from 'react'
import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'
import MastHead from './MastHead'
import Card from './Card'
import NavPanel from '../shared/NavPanel'

// Homepage component:
const HomePage: React.FC<{}> = () => {
    // getting theme from emotion
    const theme = useTheme<Theme>()

    // styling:
    const homepageCss = emoCSS({
        position: 'relative',
        overflowX: 'hidden',
        overflowY: 'scroll',
    })
    useEffect(() => {
        document.body.style.cssText = `background-color: ${theme.background.primary}`
    }, [])
    return (
        <div className="homepage" css={homepageCss}>
            <NavPanel
                background_color={theme.palette.aubergine.dark}
                textColor_closed={theme.palette.white.base}
                textColor_opened={theme.palette.white.base}
            />
            <section className="mainpage">
                <MastHead />
                <Card
                    title1="Learn Anywhere, Anytime"
                    text=" You learn best when you get to apply what you learn quickly.
                    That’s why we’ve developed Courses that combine short interactive Animations 
                    with immediate exercises. Why we have built Practice Mode with instant and personalised feedback on every exercise.
                    And why we have developed Projects based on real-world problems.
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
          You’re always going to encounter a learning curve when 
          you learn something new — it’s one of the requirements to actually learn`ing!
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
