import { css as emoCss, SerializedStyles } from '@emotion/core'
export type FONTSIZES = {
    tiny: number
    scriptsize: number
    footnotesize: number
    small: number
    normalsize: number
    large: number
    Large: number
    huge: number
    Huge: number
}

export default class MathCss {
    private _sizeFactor: number
    private TINY: number
    private SCRIPTSIZE: number
    private FOOTNOTESIZE: number
    private SMALL: number
    private NORMALSIZE: number
    private LARGE: number
    private LLARGE: number
    private HUGE: number
    private HHUGE: number
    private _fontSizes: FONTSIZES

    private _math_css: SerializedStyles
    constructor(sizeFactor: number) {
        this._sizeFactor = sizeFactor
        this.TINY = this._sizeFactor * 0.6
        this.SCRIPTSIZE = this._sizeFactor * 0.85
        this.FOOTNOTESIZE = this._sizeFactor * 9.6
        this.SMALL = this._sizeFactor * 1.1
        this.NORMALSIZE = this._sizeFactor * 1.2
        this.LARGE = this._sizeFactor * 1.3
        this.LLARGE = this._sizeFactor * 1.9
        this.HUGE = this._sizeFactor * 2.3
        this.HHUGE = this._sizeFactor * 2.9
        this._fontSizes = {
            tiny: this.TINY,
            scriptsize: this.SCRIPTSIZE,
            footnotesize: this.FOOTNOTESIZE,
            small: this.SMALL,
            normalsize: this.NORMALSIZE,
            large: this.LARGE,
            Large: this.LLARGE,
            huge: this.HUGE,
            Huge: this.HHUGE,
        }

        this._math_css = emoCss({
            fontFamily: 'KaTeX_Main',
            fontSize: `${this.NORMALSIZE}rem`,
            lineHeight: '1.2rem',
            '.main': {
                '&.tiny': {
                    fontSize: `${this.TINY}rem`,
                },
                '&.scriptsize': {
                    fontSize: `${this.SCRIPTSIZE}rem`,
                },
                '&.footnotesize': {
                    fontSize: `${this.FOOTNOTESIZE}rem`,
                },
                '&.small': {
                    fontSize: `${this.SMALL}rem`,
                },
                '&.normalsize': {
                    fontSize: `${this.NORMALSIZE}rem`,
                },
                '&.large': {
                    fontSize: `${this.LARGE}rem`,
                },
                '&.Large': {
                    fontSize: `${this.LLARGE}rem`,
                },
                '&.huge': {
                    fontSize: `${this.HUGE}rem`,
                },
                '&.Huge': {
                    fontSize: `${this.HHUGE}rem`,
                },
            },

            '.math_letter': {
                fontFamily: 'KaTeX_Math',
                fontStyle: 'italic',
                '&.tiny': {
                    fontSize: `${this.TINY}rem`,
                },
                '&.scriptsize': {
                    fontSize: `${this.SCRIPTSIZE}rem`,
                },
                '&.footnotesize': {
                    fontSize: `${this.FOOTNOTESIZE}rem`,
                },
                '&.small': {
                    fontSize: `${this.SMALL}rem`,
                },
                '&.normalsize': {
                    fontSize: `${this.NORMALSIZE}rem`,
                },
                '&.large': {
                    fontSize: `${this.LARGE}rem`,
                },
                '&.Large': {
                    fontSize: `${this.LLARGE}rem`,
                },
                '&.huge': {
                    fontSize: `${this.HUGE}rem`,
                },
                '&.Huge': {
                    fontSize: `${this.HHUGE}rem`,
                },
            },
            '.math_number': {
                fontFamily: 'KaTex_Main',
                '&.tiny': {
                    fontSize: `${0.9 * this.TINY}rem`,
                },
                '&.scriptsize': {
                    fontSize: `${0.9 * this.SCRIPTSIZE}rem`,
                },
                '&.footnotesize': {
                    fontSize: `${0.9 * this.FOOTNOTESIZE}rem`,
                },
                '&.small': {
                    fontSize: `${0.9 * this.SMALL}rem`,
                },
                '&.normalsize': {
                    fontSize: `${0.9 * this.NORMALSIZE}rem`,
                },
                '&.large': {
                    fontSize: `${0.9 * this.LARGE}rem`,
                },
                '&.Large': {
                    fontSize: `${0.9 * this.LLARGE}rem`,
                },
                '&.huge': {
                    fontSize: `${0.9 * this.HUGE}rem`,
                },
                '&.Huge': {
                    fontSize: `${0.9 * this.HHUGE}rem`,
                },
            },
            '.math_op': {
                fontFamily: 'KaTeX_Size2',
                fontStyle: 'normal',
                '&.tiny': {
                    fontSize: `${0.7 * this.TINY}rem`,
                    fontFamily: 'KaTeX_Size1',
                },
                '&.scriptsize': {
                    fontSize: `${this.SCRIPTSIZE}rem`,
                    fontFamily: 'KaTeX_Size1',
                },
                '&.footnotesize': {
                    fontSize: `${this.FOOTNOTESIZE}rem`,
                    fontFamily: 'KaTeX_Size1',
                },
                '&.small': {
                    fontSize: `${this.SMALL}rem`,
                },
                '&.normalsize': {
                    fontSize: `${this.NORMALSIZE}rem`,
                },
                '&.large': {
                    fontSize: `${this.LARGE}rem`,
                },
                '&.Large': {
                    fontSize: `${this.LLARGE}rem`,
                },
                '&.huge': {
                    fontSize: `${this.HUGE}rem`,
                },
                '&.Huge': {
                    fontSize: `${this.HHUGE}rem`,
                },
            },
            '.normal': {
                fontStyle: 'normal',
            },
            '.ddot_spacing': {
                letterSpacing: '-.4rem',
            },

            path: {
                fill: 'none',
                stroke: 'black',
                strokeLinejoin: 'round',
            },
            '.check_line': {
                stroke: 'red',
                strokeWidth: 1.5,
            },

            '.bbox': {
                stroke: '#eb7434',
                strokeWidth: 1.5,
            },
        })
    }
    get sizeFactor() {
        return this._sizeFactor
    }
    set sizeFactor(sizeFactor: number) {
        this._sizeFactor = sizeFactor
    }
    get css() {
        return this._math_css
    }
    getfontSizeFunc(): FontSizeFunc {
        const thisFontSizes = this._fontSizes

        function getFontSize({
            type = 'math_letter',
            sizeKey = 'normalsize',
        }: {
            type?: 'math_number' | 'math_letter' | 'math_op' | 'main'
            sizeKey?: keyof FONTSIZES
        }) {
            if (type === 'math_letter' || type === 'main') {
                return thisFontSizes[sizeKey]
            }
            if (type === 'math_number') {
                return 0.9 * thisFontSizes[sizeKey]
            } else if (type === 'math_op') {
                if (sizeKey === 'normalsize') {
                    return thisFontSizes['normalsize']
                } else return thisFontSizes[sizeKey]
            }
        }

        return getFontSize
    }
}

export type FontSizeFunc = ({
    type,
    sizeKey,
}: {
    type?: 'math_number' | 'math_letter' | 'math_op' | 'main'
    sizeKey?: keyof FONTSIZES
}) => number
