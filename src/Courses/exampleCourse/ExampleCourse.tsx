import React, { useMemo } from 'react'
import './../course.css'
import { useTheme } from 'emotion-theming'
import { css as emoCss } from '@emotion/core'
import { Theme } from '../../theme/types'
import NavPanel from '../../shared/NavPanel'
import Mathbox from './MathBox'
import ExHeader from './ExHeader'
// import { useUiState, useUiDispatch } from '../app_states/stateContext';

const ExampleCourse: React.FC<{}> = () => {
    const theme = useTheme<Theme>()
    const coursepage = useMemo(
        () =>
            emoCss({
                '.content__header': {
                    margin: '80px auto 0 2rem',
                },
            }),
        [theme]
    )
    return (
        <div className="coursepage" css={coursepage}>
            <NavPanel
                background_color={theme.palette.white.light}
                textColor_closed={theme.palette.aubergine.dark}
                textColor_opened={theme.palette.white.base}
            />
            <main className="main mathcontent">
                <ExHeader className="content__header" />
                <Mathbox />
            </main>
        </div>
    )
}

export default ExampleCourse
