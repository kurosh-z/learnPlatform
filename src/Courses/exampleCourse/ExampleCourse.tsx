import React, { useMemo, useLayoutEffect } from 'react'
import './../course.css'
import { useTheme } from 'emotion-theming'
import { css as emoCss } from '@emotion/core'
import { Theme } from '../../theme/types'
import NavPanel from '../../shared/NavPanel'
import Mathbox from './MathBox'
import ExHeader from './ExHeader'
import { useUiDispatch, IS_COURSE_PAGE } from '../../app_states'

const ExampleCourse: React.FC<{}> = () => {
    const theme = useTheme<Theme>()
    const uiDispatch = useUiDispatch()
    const coursepage = useMemo(
        () =>
            emoCss({
                '.content__header': {
                    margin: '80px auto 0 2rem',
                },
            }),
        [theme]
    )
    useLayoutEffect(() => {
        uiDispatch({ type: IS_COURSE_PAGE, payload: true })
    }, [])
    return (
        <div className="coursepage" css={coursepage}>
            <NavPanel
                background_color={theme.palette.white.light}
                textColor_closed={theme.palette.aubergine.dark}
                textColor_opened={theme.palette.white.base}
                conceptVisibility={false}
            />
            <main className="main mathcontent">
                <ExHeader className="content__header" />
                <Mathbox />
            </main>
        </div>
    )
}

export default ExampleCourse
