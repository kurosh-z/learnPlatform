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
                background_color={'transparent'}
                textColor_closed={theme.palette.white.base}
                textColor_opened={theme.palette.white.base}
            />
            <section className="mainpage">
                <MastHead />
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
