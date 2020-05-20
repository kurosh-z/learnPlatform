import {
    PConfigs,
    parserFactory,
    AtomPattern,
    AtomSpecPattern,
    SymbolPattern,
    ScriptPattern,
    AnimCompPattern,
    AccentPattern,
    MatrixPattern,
    FracPattern,
} from './index'

import { FONTSIZES, FontSizeFunc } from './MathCss'
import { getStringMetrics, FONT_FAMILIES, FONT_STYLES } from './fontMetrics'
import { MathExpr } from './Pattern'

// import './test.css';

type NoneAtomPatterns =
    | ScriptPattern
    | AnimCompPattern
    | SymbolPattern
    | MatrixPattern
    | AccentPattern
    | FracPattern
export type CookedMathExpr = {
    expr: string
    attr: { x?: number; y?: number; className?: string; transform?: string }
}
export type PBBox = {
    top: number
    bottom: number
    left: number
    right: number
    width: number
    height: number
}
type LastElement = {
    type: 'atom' | 'int' | 'mat' | 'partial'
    BBox?: Partial<PBBox>
}

type PAnim = {
    component: 'animcomp'
    id: string
    aAttr: { x?: number; y?: number; className: string; transform?: string }
    animElements: ParserOutputList
}
type Ptext = {
    component: 'text'
    attr: {
        x: number
        y: number
        className: string
        transform?: string
        textAnchor?: 'start' | 'middle' | 'end'
    }
    mathExpr?: string
    tspans?: {
        texpr: string
        tattr: { dx?: number; dy?: number; className?: string }
    }[]
}
type Pdelimiter = {
    component: 'delimiter'
    dtype:
        | 'bracket_open'
        | 'bracket_close'
        | 'parentheses_open'
        | 'parentheses_close'
        | 'vertical_bar'
        | 'hline'
        | 'arrow'
        | 'check_line'
        | 'bbox'
    dattr: {
        transform?: string
        height?: number
        width?: number
        fontSize?: number
        thickness?: number
        text?: string
        bbox?: Omit<PBBox, 'width' | 'height'>
        className?: string
    }
}
type PGroup = {
    component: 'group'
    gattr: { className?: string; transform?: string }
    gelements: ParserOutputList
}
type ParserOut = {
    Ptext: Ptext
    Pdelimiter: Pdelimiter
    PGroup: PGroup
    Panim: PAnim
}

export type ParserOutput<T extends keyof ParserOut> = ParserOut[T]

export type ParserOutputList = (
    | ParserOutput<'Ptext'>
    | ParserOutput<'Pdelimiter'>
    | ParserOutput<'PGroup'>
    | ParserOutput<'Panim'>
)[]

export type ParserArgs = {
    str: string
    x?: number
    y?: number
    fontKey?: keyof FONTSIZES
    configs: PConfigs
}
export default class Parser {
    outputs: ParserOutputList = []
    str: string
    currStr: string
    fontKey: keyof FONTSIZES
    classNames = ''
    configs: PConfigs
    getFontSize: FontSizeFunc
    patternList: PConfigs['allPatterns']
    atomPatternsList: PConfigs['atomPatterns']
    allRegStrings: string
    allAtomRegStrings: string
    currPos: { currX: number; currY: number }
    BBox: PBBox = {
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        width: 0,
        height: 0,
    }
    maxWH: { w: number; h: number }
    lastElement: LastElement

    constructor({
        str,
        x = 0,
        y = 0,
        configs,
        fontKey = 'normalsize',
    }: ParserArgs) {
        this.str = str
        this.configs = configs
        this.getFontSize = this.configs.getFontSize
        this.patternList = this.configs.allPatterns
        this.atomPatternsList = this.configs.atomPatterns
        this.fontKey = fontKey
        this.currPos = { currX: x, currY: y }
        this.allRegStrings = this._makeAllregStrings(this.patternList)
        this.allAtomRegStrings = this._makeAllregStrings(this.atomPatternsList)
        this.maxWH = { w: 0, h: 0 }
        this.BBox = {
            left: x,
            right: x,
            top: y,
            bottom: y,
            width: 0,
            height: 0,
        }
    }

    _updateBBox(strAscent: number, strDescent: number) {
        const { currX, currY } = this.currPos
        const { top, bottom, left, right } = this.BBox
        const currAsc = currY - strAscent
        const currDsc = currY + strDescent

        if (currAsc < top) {
            this.BBox.top = currAsc
        }
        if (currDsc > bottom) {
            this.BBox.bottom = currDsc
        }
        if (currX < left) {
            this.BBox.left = currX
        }
        if (currX > right) {
            this.BBox.right = currX
        }
        this.BBox.width = this.BBox.right - this.BBox.left
        this.BBox.height = this.BBox.bottom - this.BBox.top
    }

    _updateBBoxFromBBox({
        parser,
        BBox,
    }: {
        parser?: Parser
        BBox?: Omit<PBBox, 'width' | 'height'>
    }) {
        const { left, right, top, bottom } = this.BBox

        const otherBBox = parser ? parser.BBox : BBox
        if (!otherBBox)
            throw new Error(`one of the parser or BBox should be given!`)

        if (otherBBox.left < left) {
            this.BBox.left = otherBBox.left
        }
        if (otherBBox.right > right) {
            this.BBox.right = otherBBox.right
        }
        if (otherBBox.top < top) {
            this.BBox.top = otherBBox.top
        }
        if (otherBBox.bottom > bottom) {
            this.BBox.bottom = otherBBox.bottom
        }

        this.BBox.width = this.BBox.right - this.BBox.left
        this.BBox.height = this.BBox.bottom - this.BBox.top
    }

    _makeAllregStrings(
        patternList: PConfigs['allPatterns'] | PConfigs['atomPatterns']
    ) {
        let allRegStrings = ''
        let idx = 0
        for (const pattern of patternList) {
            if (idx === 0) allRegStrings = pattern.regString
            else {
                allRegStrings += '|' + pattern.regString
            }
            idx++
        }
        return allRegStrings
    }
    whichPattern(
        expr: string,
        patternList: PConfigs['allPatterns'] | PConfigs['atomPatterns']
    ) {
        let matchingPattern
        for (const pattern of patternList) {
            if (pattern.isPattern(expr)) return pattern
        }
        if (!matchingPattern) throw new Error(`expr containts no latex code!`)
    }
    // consume(expr: string, startingIndex: number) {
    //   // console.log('consume', startingIndex, expr);
    //   const reducedExpr = expr.slice(startingIndex, expr.length);
    //   return reducedExpr;
    // }
    _consumeWhiteSpaces(str: string): string {
        const newStr = str.replace(/\s+|\t+/gm, '')
        return newStr
    }

    strToMathExpressions(str: string) {
        let nstr = this._consumeWhiteSpaces(str)
        // nstr = nstr.replace(/(\\int)/gm, '∫');
        let idx = 0

        while (nstr.length !== 0) {
            const regexAll = new RegExp(this.allRegStrings, 'mg')
            const match = regexAll.exec(nstr)

            if (!match || match.index !== 0) {
                nstr = this._handleAtoms(nstr)
                // console.log('parserStr', this.str);
                // console.log('str: ', str);
                // console.log('nstr', nstr);
                // console.log('------------------------');
            } else {
                const pattern = this.whichPattern(match[0], this.patternList)
                pattern.fontKey = this.fontKey
                pattern.getFontSize = this.getFontSize
                pattern.strToMathExpr(nstr, match.index)
                // nstr = this.consume(nstr, pattern.endingIndex);
                nstr = pattern.stringsRest

                // console.log('parserStr', this.str);
                // console.log('str: ', str);
                // console.log('nstr', nstr);
                // console.log('------------------------');

                this._handleNonAtoms(pattern as NoneAtomPatterns)
            }
            idx++

            if (idx > str.length) throw new Error(`parsing loop is not stable!`)
        }
    }
    _isAtom(str: string) {
        const regexAll = new RegExp(this.allAtomRegStrings, 'mg')
        return regexAll.test(str)
    }

    _handleAtoms(str: string) {
        const regexAll = new RegExp(this.allAtomRegStrings, 'mg')
        const match = regexAll.exec(str)
        if (!match || match.index !== 0) {
            throw new Error(
                `expr: ${str} is not a correct latex code or it's not recognized`
            )
        }
        const pattern = this.whichPattern(match[0], this.atomPatternsList)
        // pattern's fontkey is defaulted to normalsize and is just required by SepecialCharPattern
        // but we're set them anyway!
        pattern.fontKey = this.fontKey
        pattern.strToMathExpr(str, match.index)
        const mathexprList = pattern.mathExpressions
        for (const mathexpr of mathexprList) {
            const { expr, attr } = mathexpr
            const { dx, dy, dxx, dyy } = attr

            let { currX, currY } = this.currPos

            if (dx) {
                currX += dx
            }
            if (dy) {
                currY += dy
            }
            let className = attr.className
            className += ' ' + this.fontKey

            let font_size = this.getFontSize({
                type: 'main',
                sizeKey: this.fontKey,
            })

            let fontFamily: FONT_FAMILIES = 'KaTeX_Math'
            let fontStyle: FONT_STYLES = 'italic'
            if (pattern instanceof AtomPattern && pattern.isNumber(expr)) {
                font_size = this.getFontSize({
                    type: 'math_number',
                    sizeKey: this.fontKey,
                })
                fontFamily = 'KaTex_Main'
                fontStyle = 'normal'
            }
            if (pattern instanceof AtomSpecPattern) {
                fontFamily = mathexpr.attr.fontFamily
                fontStyle = mathexpr.attr.fontStyle
            }

            const output: ParserOutput<'Ptext'> = {
                component: 'text',
                mathExpr: expr,
                attr: { x: currX, y: currY, className: className },
            }

            // console.log(coockedmathExpr.expr, this.fontKey);

            // font font_size font_style
            // console.log(this.fontKey, this.fontSizes[this.fontKey], font_size);
            const { width, maxAscent, maxDescent } = getStringMetrics({
                str: expr,
                fontFamily,
                fontSize: font_size,
                fontStyle,
            })

            this.outputs.push(output)

            // get last character's metrics for last element.
            const lastCharMet = getStringMetrics({
                str: expr.charAt(expr.length - 1),
                fontFamily,
                fontSize: font_size,
                fontStyle,
            })
            const ltop = lastCharMet.maxAscent
            const lbottom = lastCharMet.maxDescent
            const lheight = lbottom - ltop
            const lwidth = lastCharMet.width

            // console.log(
            //   expr,
            //   'width',
            //   width,
            //   'maxAscent',
            //   maxAscent,
            //   'maxDescent',
            //   maxDescent
            // );
            // console.log('------------');
            currX += width
            // after charachter positionings
            if (dxx) {
                currX += dxx
            }
            if (dyy) {
                currY += dyy
            }

            currX += 1.3 * font_size
            // letter_spacing
            this.currPos = { currX, currY }

            this._updateBBox(maxAscent, maxDescent)
            this.lastElement = {
                type: 'atom',
                BBox: {
                    top: ltop,
                    bottom: lbottom,
                    height: lheight,
                    width: lwidth,
                },
            }
            // console.log('after width', this.currPos.currX);

            // console.log(expr, currX);
            // console.log('maxW', this._maxWH.w);
            // console.log('maxH', this._maxWH.h, this.maxWH);
            // console.log('-----------------');
        }

        // str = this.consume(str, pattern.endingIndex);
        str = pattern.stringsRest
        return str
    }

    _handleNonAtoms(pattern: NoneAtomPatterns) {
        if (pattern instanceof MatrixPattern) {
            this._handleMatrix(pattern)
        } else if (pattern instanceof ScriptPattern) {
            this._handleScripts(pattern)
        } else if (pattern instanceof AnimCompPattern) {
            this._handleAnimComp(pattern)
        } else if (pattern instanceof SymbolPattern) {
            this._handleSymbols(pattern)
        } else if (pattern instanceof AccentPattern) {
            this._handleAccents(pattern)
        } else if (pattern instanceof FracPattern) {
            this._handleFraction(pattern)
        }
    }
    _handleFraction(pattern: FracPattern) {
        const { numerator, denominator } = pattern.fracExprs
        const { currX, currY } = this.currPos

        // if the fraction is index use tiny
        const font_key = this.fontKey === 'scriptsize' ? 'tiny' : this.fontKey
        const numParser = parserFactory({
            str: numerator,
            fontKey: font_key,
            x: 0,
            y: 0,
        })

        const denParser = parserFactory({
            str: denominator,
            fontKey: font_key,
            fontSizegetter: this.getFontSize,
            x: 0,
            y: 0,
        })
        const numTop = numParser.BBox.top
        const numBottom = numParser.BBox.bottom
        const numWidth = numParser.BBox.width
        const denTop = denParser.BBox.top
        const denBottom = denParser.BBox.bottom
        const denWidth = denParser.BBox.width
        const font_factor = this.getFontSize({
            type: 'main',
            sizeKey: font_key,
        })
        const V_MARGIN = 3 * font_factor
        const H_MARGIN = 0

        const fracWidth =
            numWidth > denWidth ? numWidth + H_MARGIN : denWidth + H_MARGIN

        const numdX = fracWidth / 2 - numWidth / 2
        const numdY = -Math.abs(numBottom) - V_MARGIN
        const dendX = fracWidth / 2 - denWidth / 2
        const dendY = Math.abs(denTop) + V_MARGIN
        // console.log(fracWidth);
        const fracLine: ParserOutput<'Pdelimiter'> = {
            component: 'delimiter',
            dtype: 'hline',
            dattr: {
                width: fracWidth,
                thickness: 0.6 * font_factor,
                className: 'fracline',
            },
        }

        const numGroup: ParserOutput<'PGroup'> = {
            component: 'group',
            gattr: {
                className: 'numgroup',
                transform: `translate(${numdX} ${numdY})`,
            },
            gelements: numParser.outputs,
        }
        const denGroup: ParserOutput<'PGroup'> = {
            component: 'group',
            gattr: {
                className: 'dengroup',
                transform: `translate(${dendX} ${dendY})`,
            },
            gelements: denParser.outputs,
        }

        const FRAC_DY = 4 * font_factor
        const fgroup: ParserOutput<'PGroup'> = {
            component: 'group',
            gattr: {
                className: 'frac',
                transform: `translate(${currX} ${currY - FRAC_DY})`,
            },
            gelements: [fracLine, numGroup, denGroup],
        }

        this.outputs.push(fgroup)

        // update bbox
        const top = currY + numdY + numTop - FRAC_DY
        const bottom = currY + dendY + denBottom - FRAC_DY
        const left = currX
        const right = currX + fracWidth
        const newBBox = { top, bottom, left, right }
        this._updateBBoxFromBBox({ BBox: newBBox })
        // update currPos
        this.currPos.currX = right + 1.3 * font_factor
    }

    _handleAccents(pattern: AccentPattern) {
        const { currX, currY } = this.currPos

        const {
            expr,
            accent,
            accentType,
            fontKey,
            className,
            adx,
        } = pattern.accentExpr
        const parser = parserFactory({
            str: expr,
            fontKey,
            x: currX,
            y: currY,
        })

        const exprTop = parser.BBox.top
        const exprWidth = parser.BBox.width
        const font_factor = this.getFontSize({
            type: 'main',
            sizeKey: fontKey,
        })
        const V_MARGIN = 2.7 * font_factor
        if (accentType === 'text') {
            const accCharMetric = getStringMetrics({
                str: accent,
                fontFamily: 'KaTex_Main',
                fontSize: font_factor,
                fontStyle: 'normal',
            })
            // calculating the position of accent based on accent and expr metrics:
            const accCharWidth = accCharMetric.width
            const accCharDescent = accCharMetric.maxDescent
            const accCharAscent = accCharMetric.maxAscent
            // console.log(accent, ':', accCharWidth);
            const accX = currX + exprWidth / 2 - accCharWidth / 2 + adx
            const accY = exprTop + accCharDescent - V_MARGIN

            const accentText: ParserOutput<'Ptext'> = {
                component: 'text',
                mathExpr: accent,
                attr: { x: accX, y: accY, className },
            }

            //push accent and expressions to outputs:
            // console.log(accCharWidth, exprWidth);
            this.outputs.push(accentText)

            const right =
                accX + 2.7 * font_factor + accCharWidth / 2 >
                parser.BBox.right - 1.8 * font_factor
                    ? accX + 2.7 * font_factor + accCharWidth / 2
                    : parser.BBox.right
            this._updateBBoxFromBBox({
                BBox: {
                    top: accY - accCharAscent,
                    bottom: parser.BBox.bottom,
                    left: currX,
                    right: right,
                },
            })
        } else {
            const accX = currX + exprWidth / 2 - 5 * font_factor + adx
            const accY = exprTop - V_MARGIN - 1 * font_factor
            const accentPath: ParserOutput<'Pdelimiter'> = {
                component: 'delimiter',
                dtype: 'arrow',
                dattr: {
                    fontSize: font_factor,
                    transform: `translate(${accX} ${accY}) scale(${font_factor})`,
                },
            }
            this.outputs.push(accentPath)
            this._updateBBoxFromBBox({
                BBox: {
                    top: accY - 1.75 * font_factor, // rounded lines so that
                    bottom: parser.BBox.bottom,
                    left: currX,
                    right:
                        parser.currPos.currX > accX + 6.34 * font_factor
                            ? parser.currPos.currX
                            : accX + 6.34 * font_factor,
                },
            })
        }
        for (const output of parser.outputs) {
            this.outputs.push(output)
        }

        this.currPos.currX = parser.currPos.currX
    }
    _handleSymbols(pattern: SymbolPattern) {
        for (const mathExpr of pattern.mathExpressions) {
            const { currX, currY } = this.currPos
            let coockedSymb: ParserOutput<'Ptext'>
            // const parserFontFactor = this.fontFactor ===

            const parser = parserFactory({
                str: mathExpr.expr,
                x: currX + mathExpr.attr.dx,
                y: currY + mathExpr.attr.dy,
                fontKey: mathExpr.attr.fontKey,
                parentParser: this,
            })

            if (pattern.symb === 'int') {
                const { maxAscent, maxDescent, width } = getStringMetrics({
                    str: '∫',
                    fontSize: this.getFontSize({
                        type: 'math_op',
                        sizeKey: this.fontKey,
                    }),
                    fontFamily: 'KaTeX_Size2',
                    fontStyle: 'normal',
                })

                this.lastElement = {
                    type: 'int',
                    BBox: {
                        left: currX,
                        right: currX + width + mathExpr.attr.dxx,
                        top: currY - maxAscent,
                        bottom: currY + maxDescent,
                    },
                }
                coockedSymb = parser.outputs[0] as ParserOutput<'Ptext'>
                this.currPos.currX = parser.currPos.currX
            } else {
                this.lastElement = {
                    type: 'atom',
                    BBox: {
                        left: currX,
                        right: parser.BBox.right,
                        top: parser.BBox.top,
                        bottom: parser.BBox.bottom,
                    },
                }

                // rendering dots

                // redering vdots :
                if (pattern.symb === 'vdots') {
                    const font_factor = this.getFontSize({
                        type: 'main',
                        sizeKey: this.fontKey,
                    })
                    const dotMetrics = getStringMetrics({
                        str: '.',
                        fontFamily: 'KaTex_Main',
                        fontSize: font_factor,
                        fontStyle: 'normal',
                    })
                    const width = dotMetrics.width

                    const rawSymbol = parser.outputs[0] as ParserOutput<'Ptext'>
                    coockedSymb = {
                        component: 'text',
                        attr: {
                            x: currX,
                            y: currY,
                            className: `${pattern.symb} main ${this.fontKey}`,
                        },
                        tspans: [
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: {
                                    dx: 1.3 * font_factor,
                                    dy: -6.2 * font_factor,
                                },
                            },
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: { dx: -width, dy: 3.6 * font_factor },
                            },
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: { dx: -width, dy: 3.6 * font_factor },
                            },
                        ],
                    }
                    this.currPos.currX =
                        parser.currPos.currX + 1.3 * font_factor

                    const bbox = {
                        bottom: currY + dotMetrics.maxDescent + 1 * font_factor,
                        top: currY - dotMetrics.maxAscent - 6.3 * font_factor,
                        left: currX,
                        right: this.currPos.currX,
                    }
                    this._updateBBoxFromBBox({ BBox: bbox })
                }
                // redering ldots :
                else if (pattern.symb === 'ldots') {
                    const font_factor = this.getFontSize({
                        type: 'main',
                        sizeKey: this.fontKey,
                    })
                    const dotMetrics = getStringMetrics({
                        str: '.',
                        fontFamily: 'KaTex_Main',
                        fontSize: font_factor,
                        fontStyle: 'normal',
                    })
                    const width = dotMetrics.width

                    coockedSymb = {
                        component: 'text',
                        attr: {
                            x: currX,
                            y: currY,
                            className: `${pattern.symb} main ${this.fontKey}`,
                        },
                        tspans: [
                            {
                                texpr: '...',
                                tattr: {
                                    dx: 0,
                                    dy: 0,
                                },
                            },
                        ],
                    }
                    this.currPos.currX += 3 * width + 1.3 * font_factor
                    const bbox = {
                        bottom: currY + dotMetrics.maxDescent,
                        top: currY - dotMetrics.maxAscent,
                        left: currX,
                        right: this.currPos.currX,
                    }
                    this._updateBBoxFromBBox({ BBox: bbox })
                }
                // redering cdots :
                else if (pattern.symb === 'cdots') {
                    const font_factor = this.getFontSize({
                        type: 'main',
                        sizeKey: this.fontKey,
                    })
                    const dotMetrics = getStringMetrics({
                        str: '.',
                        fontFamily: 'KaTex_Main',
                        fontSize: font_factor,
                        fontStyle: 'normal',
                    })
                    const width = dotMetrics.width

                    coockedSymb = {
                        component: 'text',
                        attr: {
                            x: currX,
                            y: currY,
                            className: `${pattern.symb} main ${this.fontKey}`,
                        },
                        tspans: [
                            {
                                texpr: '...',
                                tattr: {
                                    dx: 0,
                                    dy: -3.3 * font_factor,
                                },
                            },
                        ],
                    }

                    this.currPos.currX += 3 * width + 1.3 * font_factor
                    const bbox = {
                        bottom: currY,
                        top: currY - dotMetrics.maxAscent - 3.3 * font_factor,
                        left: currX,
                        right: this.currPos.currX,
                    }
                    this._updateBBoxFromBBox({ BBox: bbox })
                }

                // redering ddots :
                else if (pattern.symb === 'ddots') {
                    const font_factor = this.getFontSize({
                        type: 'main',
                        sizeKey: this.fontKey,
                    })
                    const dotMetrics = getStringMetrics({
                        str: '.',
                        fontFamily: 'KaTex_Main',
                        fontSize: font_factor,
                        fontStyle: 'normal',
                    })
                    const width = dotMetrics.width

                    const rawSymbol = parser.outputs[0] as ParserOutput<'Ptext'>
                    coockedSymb = {
                        component: 'text',
                        attr: {
                            x: currX,
                            y: currY,
                            className: `${pattern.symb} main ${this.fontKey}`,
                        },
                        tspans: [
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: {
                                    dx: 0,
                                    dy: -6.3 * font_factor,
                                },
                            },
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: {
                                    dx: -width / 2 + 1 * font_factor,
                                    dy: 3.6 * font_factor,
                                },
                            },
                            {
                                texpr: rawSymbol.mathExpr,
                                tattr: {
                                    dx: -width / 2 + 1 * font_factor,
                                    dy: 3.6 * font_factor,
                                },
                            },
                        ],
                    }
                    this.currPos.currX +=
                        2 * (width / 2 + 2 * font_factor) + 3.9 * font_factor

                    const bbox = {
                        bottom: currY + dotMetrics.maxDescent + 1 * font_factor,
                        top: currY - 6.3 * font_factor - dotMetrics.maxAscent,
                        left: currX,
                        right: this.currPos.currX,
                    }
                    this._updateBBoxFromBBox({ BBox: bbox })
                } else {
                    coockedSymb = parser.outputs[0] as ParserOutput<'Ptext'>
                    this.currPos.currX = parser.currPos.currX
                }
            }

            this.outputs.push(coockedSymb)

            // this._pushParserOutputs({ parser: parser, patternExpr: mathExpr });
        }
    }
    _handleAnimComp(pattern: AnimCompPattern) {
        const { id, expr } = pattern.animExpr
        const { currX, currY } = this.currPos
        const parser = parserFactory({
            str: expr,
            x: currX,
            y: currY,
            fontKey: this.fontKey,
            parentParser: this,
        })
        this.currPos.currX = parser.currPos.currX
        const animComp: PAnim = {
            component: 'animcomp',
            id: id,
            aAttr: {
                className: 'animcomp',
            },
            animElements: parser.outputs,
        }

        this.outputs.push(animComp)
    }
    _handleScripts(pattern: ScriptPattern) {
        type RawScriptElement = {
            elements: ParserOutputList
            type: 'sub' | 'sup'
            elWidth: number
            elHeight: number
            elTop: number
            elBottom: number
            elRight: number
        }
        const scriptElements: RawScriptElement[] = []
        const SUP_DY = -5
        const SUB_DY = 3
        const INT_SUP_DY = -18
        const INT_SUB_DY = 15
        const SMARGIN = 2
        const MID_MARGIN = 1
        const baseType = this.lastElement.type
        const baseHeight = this.lastElement.BBox.height

        const font_factor = this.getFontSize({
            type: 'math_letter',
            sizeKey: this.fontKey,
        })
        const int_font_factor = this.getFontSize({
            type: 'math_op',
            sizeKey: this.fontKey,
        })
        const { currX, currY } = this.currPos
        // this.outputs.push(this._checkline(currX, currY, '0'));
        let indexMaxX = 0
        // loop through the scripts and set the positions
        for (const mathExpr of pattern.scriptExprs) {
            const { expr, type, fontKey } = mathExpr
            const parser = parserFactory({
                str: expr,
                x: currX - 1.3 * font_factor,
                y: currY,
                fontKey: fontKey,
            })

            const { bottom, top, width, right, height } = parser.BBox
            const scriptEl: RawScriptElement = {
                elements: parser.outputs,
                elHeight: height,
                elWidth: width,
                elBottom: bottom,
                elTop: top,
                elRight: right,
                type: type,
            }
            scriptElements.push(scriptEl)
        }

        for (const scriptEl of scriptElements) {
            const scriptType = scriptEl.type
            let dy: number,
                dx: number = 1.1 * font_factor
            if (baseType === 'atom') {
                dy =
                    scriptType === 'sub'
                        ? font_factor * SUB_DY
                        : font_factor * SUP_DY
            }
            if (baseType === 'partial') {
                dy =
                    scriptType === 'sub'
                        ? font_factor * SUB_DY
                        : font_factor * -6.5
                dx = scriptType === 'sub' ? 0 : 3 * font_factor
            }
            if (baseType === 'int' && this.fontKey === 'normalsize') {
                dy =
                    scriptType === 'sub'
                        ? int_font_factor * INT_SUB_DY
                        : int_font_factor * INT_SUP_DY

                dx =
                    scriptType === 'sub'
                        ? int_font_factor * -5
                        : int_font_factor * 3
            }
            if (baseType === 'int' && this.fontKey !== 'normalsize') {
                dy =
                    scriptType === 'sub'
                        ? 0.5 * int_font_factor * INT_SUB_DY
                        : 0.5 * int_font_factor * INT_SUP_DY

                dx =
                    scriptType === 'sub'
                        ? int_font_factor * -5
                        : int_font_factor * -1.5
            }
            if (baseType === 'mat') {
                dy =
                    scriptType === 'sub'
                        ? baseHeight / 2 + 2 * font_factor
                        : -baseHeight / 2 + 3 * font_factor

                dx = -3 * font_factor
            }
            const elBottomPos = dy + scriptEl.elBottom
            const elTopPos = dy + scriptEl.elTop
            const baseMiddleH = 3.5 * font_factor
            // adjustmetns if scripts are bigger than expected:
            if (currY - baseMiddleH < elBottomPos && scriptType === 'sup') {
                dy += -Math.abs(
                    elBottomPos - currY + baseMiddleH + font_factor * MID_MARGIN
                )
            }
            if (currY - baseMiddleH > elTopPos && scriptType === 'sub') {
                dy += Math.abs(
                    elTopPos - currY + baseMiddleH - font_factor * MID_MARGIN
                )
            }

            const output: ParserOutput<'PGroup'> = {
                component: 'group',
                gattr: {
                    className: `${scriptType}`,
                    transform: `translate(${dx} ${dy})`,
                },
                gelements: scriptEl.elements,
            }
            this.outputs.push(output)

            // update the Bounding Box
            const newLeft = this.BBox.left
            const newRight = scriptEl.elRight + dx
            const newBottom = scriptEl.elBottom + dy
            const newTop = scriptEl.elTop + dy
            const newBBOx = {
                left: newLeft,
                right: newRight,
                top: newTop,
                bottom: newBottom,
            }
            this._updateBBoxFromBBox({ BBox: newBBOx })
            if (indexMaxX < scriptEl.elRight) {
                indexMaxX = scriptEl.elRight
            }
        }
        // set currPos
        this.currPos.currX = indexMaxX + SMARGIN * font_factor
        this.currPos.currY = currY
    }

    _pushParserOutputs({
        parser,
        patternExpr,
    }: {
        parser: Parser
        patternExpr: MathExpr
    }) {
        for (const output of parser.outputs) {
            if (output.component === 'text') {
                const parserClNames = output.attr.className
                const patternClName = patternExpr.attr.className
                // console.log(cookedMathExpr.expr);
                // console.log('mathexpr :', mathexprClNames);
                // console.log('pattern  :', patternClName);

                const newClNames = this._updateClassName(
                    parserClNames,
                    patternClName
                )
                // console.log('newclName:', newClNames);
                // console.log('-------------------');
                output.attr.className = newClNames
            }

            this.outputs.push(output)
        }
    }

    _handleMatrix(pattern: MatrixPattern) {
        const matrixElements = pattern.matrixElements
        const mDim = [matrixElements.length, matrixElements[0].length]
        const mtype = pattern.mtype

        // first we find the width and height of each element
        // and also the maximum height and width
        type RawMatrixRow = {
            elements: ParserOutputList
            elWidth: number
            elHeight: number
            elTop: number
            elBottom: number
        }[]
        let rawMatrixRow: RawMatrixRow = []
        const rawMatrixElements: RawMatrixRow[] = []

        const rowMaxH: number[] = []
        const columnMaxW: number[] = []
        const rowMaxTop: number[] = []
        const rowMaxBottom: number[] = []

        let i = 0 //row index
        let j = 0 // column index

        for (const row of matrixElements) {
            for (const elm of row) {
                const expr = elm.expr
                // console.log('expr', expr);

                const parser = parserFactory({
                    str: expr,
                    x: 0,
                    y: 0,
                    fontKey: this.fontKey,
                })

                const elBBox = parser.BBox
                const elMaxW = elBBox.width
                const elMaxH = elBBox.height
                const elTop = elBBox.top
                const elBottom = elBBox.bottom
                // console.log('ij:   ', i, j, expr);
                // console.log('maxW', elMaxW);
                // console.log('maxH', elMaxH);

                rawMatrixRow.push({
                    elements: parser.outputs,
                    elWidth: elMaxW,
                    elHeight: elMaxH,
                    elTop: elTop,
                    elBottom: elBottom,
                })

                if (j === 0) {
                    rowMaxH.push(elMaxH)
                    rowMaxTop.push(elTop)
                    rowMaxBottom.push(elBottom)
                } else {
                    if (rowMaxH[i] < elMaxH) rowMaxH[i] = elMaxH
                    if (rowMaxTop[i] > elTop) rowMaxTop[i] = elTop // elTop is negative
                    if (rowMaxBottom[i] < elBottom) rowMaxBottom[i] = elBottom
                }

                if (i === 0) {
                    columnMaxW.push(elMaxW)
                } else {
                    if (columnMaxW[j] < elMaxW) columnMaxW[j] = elMaxW
                }

                j++
            }
            j = 0
            i++
            rawMatrixElements.push(rawMatrixRow)

            // console.log('rawMatrixRow', rawMatrixRow);
            rawMatrixRow = []
            // console.log('-------------------------------');
        }
        // center the matrix vertically based on the current baseline
        const currX0 = this.currPos.currX
        const currY0 = this.currPos.currY
        const FONT_FACTOR = this.getFontSize({
            type: 'math_letter',
            sizeKey: this.fontKey,
        })
        const V_MARGIN = 18 * FONT_FACTOR
        const H_MARGIN = 8 * FONT_FACTOR
        const DH_MARGIN = 2 * FONT_FACTOR // Delimiter's horizontal margin(top and bottom of matrix)
        const DV_MARGIN = 5 * FONT_FACTOR
        const BL_ADJ = 5 * FONT_FACTOR // basline adjustment
        // calculate the height and width of the matrix:
        let mHeight = 0
        for (const hieght of rowMaxH) {
            mHeight += hieght
        }
        mHeight += H_MARGIN * (mDim[0] - 1) + 2 * DH_MARGIN

        const delim_hieght = mHeight
        let mWidth = 0
        for (const width of columnMaxW) {
            if (width > mWidth) mWidth = width
        }
        mWidth += V_MARGIN * (mDim[1] - 1)

        // if matrix is the first comp we need no margin left!
        // const outLen = this.outputs.length;
        const matrixX = currX0 + DV_MARGIN
        const matrixY = currY0 - mHeight / 2 - BL_ADJ
        const matrixGroup: PGroup = {
            component: 'group',
            gelements: [],
            gattr: {
                transform: `translate(${matrixX} ${matrixY})`,
                className: `${mtype}`,
            },
        }

        // push opening delimeter
        const delimiter_open: Pdelimiter = {
            component: 'delimiter',
            dtype: 'bracket_open',
            dattr: {
                transform: `translate(${0} ${-matrixY})`,
                height: delim_hieght,
                thickness: 0.8 * FONT_FACTOR,
            },
        }

        matrixGroup.gelements.push(delimiter_open)
        // this.outputs.push(delimiter_open);

        //reset i,j
        i = 0
        j = 0

        let currX = DV_MARGIN
        let currY = DH_MARGIN + BL_ADJ // on top of the matrix!
        let posY: number
        let posX: number
        for (const rawMatrixRow of rawMatrixElements) {
            for (const matrixEl of rawMatrixRow) {
                const elements = matrixEl.elements
                posX = currX + (columnMaxW[j] - matrixEl.elWidth) / 2
                posY = currY - rowMaxTop[i]
                // open a group and shift the group by (posX,poxY)
                const elementGroup: PGroup = {
                    component: 'group',
                    gelements: elements,
                    gattr: {
                        transform: `translate(${posX} ${posY})`,
                        className: `mat_${i}_${j}`,
                    },
                }
                // push elements to matrix group
                matrixGroup.gelements.push(elementGroup)
                // matrixGroup.gelements.push(this._checkline(posX, posY));
                // update the postion for the next element
                const dx =
                    j !== mDim[1] - 1
                        ? columnMaxW[j] + V_MARGIN
                        : columnMaxW[j] + DV_MARGIN

                currX += dx
                // matrixGroup.gelements.push(this._checkline(this.currPos.currX, posY));

                j++
            }

            // matrixGroup.gelements.push(this._checkline(currX, posY));
            if (i !== mDim[0] - 1) {
                currX = DV_MARGIN
            }
            currY = posY + rowMaxBottom[i] + H_MARGIN
            // matrixGroup.gelements.push(this._checkline(0, currY));

            j = 0
            i++
        }

        // push closing delimeter
        const delimiter_close: Pdelimiter = {
            component: 'delimiter',
            dtype: 'bracket_close',
            dattr: {
                transform: `translate(${currX} ${-matrixY})`,
                height: delim_hieght,
                thickness: 0.8 * FONT_FACTOR,
            },
        }
        matrixGroup.gelements.push(delimiter_close)
        // this.currPos.currX += DH_MARGIN;
        // push matrix group
        this.outputs.push(matrixGroup)

        // update positions:
        this.currPos.currX = matrixX + currX + 1 * DV_MARGIN
        this.currPos.currY = currY0
        // this.outputs.push(this._checkline(this.currPos.currX, this.currPos.currY));
        const matrixBBox = {
            top: currY0 - mHeight / 2,
            bottom: currY0 + mHeight / 2,
            right: this.currPos.currX,
            left: currX0,
        }
        this._updateBBoxFromBBox({ BBox: matrixBBox })
        this.lastElement = { type: 'mat', BBox: { ...this.BBox } }
        // set BBox
        // if (this.BBox.right < this.currPos.currX) {
        //   this.BBox.right = this.currPos.currX;
        // }
        // if (this.BBox.top < -mHeight / 2) {
        //   this.BBox.top = -mHeight / 2;
        // }
        // if (this.BBox.bottom > mHeight / 2) {
        //   this.BBox.bottom = mHeight / 2;
        // }
        // this.BBox.width = this.BBox.right - this.BBox.left;
        // this.BBox.height = this.BBox.bottom - this.BBox.top;
    }
    _checkline(x: number, y: number, text?: string) {
        const check_line: Pdelimiter = {
            component: 'delimiter',
            dtype: 'check_line',
            dattr: { transform: `translate(${x} ${y})`, text },
        }

        return check_line
    }

    _isExprInStr(expr: string, str: string, range?: boolean) {
        const regexp = RegExp(expr, 'mg')
        if (range) {
            const match = regexp.exec(str)
            const test = match ? true : false
            const startIdx = match ? match.index : null
            const endIdx = match ? regexp.lastIndex : null
            return { test, range: [startIdx, endIdx] }
        }
        return regexp.test(str)
    }

    _createReplacer(replaceStr: string) {
        return function () {
            return [replaceStr].join(' ')
        }
    }
    // find exprOld in str and replace it with exprNew
    _replaceStr(str: string, exprOld: string, exprNew: string) {
        const newStr = str.replace(
            new RegExp(exprOld, 'mg'),
            this._createReplacer(exprNew)
        )
        return newStr
    }

    _updateClassName(currClassNames: string, newClassName: string) {
        let updatedClassNames = ''

        // first we switch btw. math_letter & math_number
        if (this._isExprInStr('math_letter', newClassName)) {
            updatedClassNames = this._replaceStr(
                currClassNames,
                'math_number',
                'math_letter'
            )
        } else if (this._isExprInStr('math_number', newClassName)) {
            updatedClassNames = this._replaceStr(
                currClassNames,
                'math_letter',
                'math_number'
            )

            // then switch btw. subsup && base
        }
        if (this._isExprInStr('sub', newClassName)) {
            updatedClassNames = this._replaceStr(currClassNames, 'sup', 'sub')
        } else if (this._isExprInStr('sup', newClassName)) {
            updatedClassNames = this._replaceStr(currClassNames, 'sub', 'sup')
        } else {
            updatedClassNames = currClassNames + ' ' + newClassName
        }

        return updatedClassNames
    }

    parse() {
        const str = this.str
        this.strToMathExpressions(str)
    }
}
