import React, { ReactElement, useMemo } from 'react'
import { css as emoCSS } from '@emotion/core'
import { useTheme } from 'emotion-theming'
import { Theme } from '../../theme/types'

const Objective: React.FC<{}> = ({ children }) => {
    return <li>{children}</li>
}
Objective.displayName = 'Objective'

interface HeaderMembers {
    Objective: typeof Objective
}

type TContentHeaderProps = {
    title: string
    title_number: string
    className?: string
}

const TContentHeader: React.FC<TContentHeaderProps> & HeaderMembers = ({
    title,
    title_number,
    children,
    className,
}) => {
    const theme = useTheme<Theme>()

    const contant__header = useMemo(
        () =>
            emoCSS({
                '.chapter': {
                    marginBottom: '.5rem',
                    '*': {
                        fontSize: theme.typography.h4.fontSize,
                        fontWeight: theme.typography.fontWeights.bold,
                        display: 'inline-block',
                    },
                    '.title__text': { marginLeft: '1rem' },
                },
                em: {
                    marginLeft: '.15em',
                    marginRight: '.15em',
                    fontWeight: theme.typography.fontWeights.bold,
                },
                '.content__objectives': {
                    borderLeft: `3px solid ${theme.palette.orange.base}`,
                    marginLeft: '.5rem',
                    '&::after': {
                        display: 'block',
                        content: '" "',
                        width: '25px',
                        borderBottom: `3px solid ${theme.palette.orange.base}`,
                    },
                },

                '.objectives': {
                    fontSize: theme.typography.h5.fontSize,
                    fontWeight: theme.typography.fontWeights.bold,
                    marginLeft: '.7rem',
                },

                '.objectives__list': {
                    counterReset: 'objective-counter',
                    marginBottom: '.5rem',
                    li: {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        flexWrap: 'wrap',
                        marginLeft: '1rem',
                        fontSize: theme.typography.h6.fontSize,
                        counterIncrement: 'objective-counter',
                        '&::before': {
                            content: 'counter(objective-counter)". "',
                        },
                    },
                },
            }),
        [theme]
    )

    return (
        <section className={className} css={contant__header}>
            <header className="chapter">
                <h1 className="chapter__title">
                    <p className="title__number">{title_number}</p>
                    <p className="title__text">{title}</p>
                </h1>
            </header>
            <article className="content__objectives">
                <h5>
                    <span className="objectives">Objectives</span>
                </h5>
                <ol className="objectives__list">
                    {React.Children.map(
                        children,
                        (child: ReactElement<typeof Objective>) => {
                            return (
                                <>
                                    {child.type.displayName === 'Objective' &&
                                        React.cloneElement(child, {
                                            ...child.props,
                                        })}
                                </>
                            )
                        }
                    )}
                </ol>
            </article>
        </section>
    )
}

TContentHeader.Objective = Objective
export default TContentHeader
