import React, { useMemo, Suspense, lazy } from 'react'
import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../theme/types'

const ImageLoader = lazy(() =>
    import(/* webpackPrefetch: true */ './ImageLoader')
)
const Figure: React.RefForwardingComponent<
    HTMLDivElement,
    {
        data_src: string
        caption_number: string
        caption_text: string
        show: boolean
    }
> = ({ data_src, caption_text, caption_number, show }, ref) => {
    const theme = useTheme<Theme>()
    const fig_wrapper = useMemo(() => {
        const fig_wrapper = emoCSS({
            width: '60%',
            margin: '1rem auto 1.2rem auto',

            [theme.mediaQueries.md]: {
                maxWidth: '',
            },
            [theme.mediaQueries.lg]: {
                maxWidth: '500px',
            },

            '.fig': {
                display: 'block',
                width: '100%',
            },
            '.fig__link': {
                textDecoration: 'none',
                color: 'black',
            },
            '.fig__caption': {
                fontSize: theme.typography.fontSizes[1],
                margin: '0 auto 0 auto',
                textAlign: 'center',
            },
            '.caption__number': {
                fontWeight: theme.typography.fontWeights.bold,
            },
            '.fig__loading': {
                '&::after': {
                    content: '"...loading"',
                    display: 'block',
                    fontSize: '3rem',
                },
            },
        })
        return fig_wrapper
    }, [theme])

    return (
        <div
            ref={ref}
            css={fig_wrapper}
            className="fig__wrapper "
            id={'img' + caption_number}
        >
            <a
                className="fig__link"
                //  href={'#img' + caption_number}
            >
                <Suspense fallback={<div className="fig__loading" />}>
                    <ImageLoader
                        src={data_src}
                        className="fig"
                        hidden={show ? false : true}
                    />
                </Suspense>
                <h6 className="fig__caption">
                    <span className="caption__number">
                        Figure {caption_number}:{' '}
                    </span>
                    {caption_text}
                </h6>
            </a>
        </div>
    )
}

export default React.forwardRef(Figure)
