import { FONTSIZES } from './MathCss'
import Pattern, { PatternArgs } from './Pattern'

type AccentExpr = {
    expr: string
    accent: string
    accentType: 'path' | 'text'
    adx: number
    className: string
    fontKey: keyof FONTSIZES
}
export default class AccentPattern extends Pattern {
    regString: string
    stratingIndex: number
    endingIndex: number
    stringsRest: string
    accentExpr: AccentExpr

    constructor({ name }: PatternArgs) {
        super({ name })
        this._createRegStrings()
    }
    private _createRegStrings() {
        const keyList: string[] = []

        for (const key in ACCENTS) {
            keyList.push(key.split('\\')[1])
        }
        let regStr = '(\\\\)('
        let idx = 0
        for (const expr of keyList) {
            if (idx === 0) {
                regStr += '(' + expr + ')'
            } else {
                regStr += '|(' + expr + ')'
            }
            idx++
        }
        regStr += ')(\\{?)'

        this.regString = regStr
    }

    public isPattern(str: string) {
        const regexp = new RegExp(this.regString, 'mg')
        return regexp.test(str)
    }

    strToMathExpr(str: string) {
        const regexp = new RegExp(this.regString, 'mg')
        const match = regexp.exec(str)
        const accent_type = '\\' + match[2]
        const accent = ACCENTS[accent_type]
        let expr: string
        if (match[13]) {
            const endingIndex = this.findmatchingPairs({
                str,
                openregStr: '{',
                closeregStr: '}',
                startIdx: 0,
            })
            this.stratingIndex = 0
            this.endingIndex = endingIndex
            this.stringsRest = this.consume(str, this.endingIndex)
            const regexpOp = /\{/gm
            const openBracket = regexpOp.exec(str)
            const openBracketIdx = openBracket.index
            expr = str.slice(openBracketIdx + 1, this.endingIndex - 1)
        } else {
            this.stratingIndex = 0
            this.endingIndex = accent_type.length + 1
            expr = str.slice(accent_type.length, this.endingIndex)
            this.stringsRest = this.consume(str, this.endingIndex)
        }
        let className = 'accent_' + match[2]

        const font_factor = this.getFontSize({
            type: 'math_letter',
            sizeKey: this.fontKey,
        })
        const accKey = expr //  expr + accent;
        let adx =
            accKey in ACCENT_SPACING
                ? ACCENT_SPACING[accKey](font_factor)['adx']
                : 0

        if (match[2] === 'ddot') {
            className += ' ' + 'ddot_spacing'
            adx += 0.5 * font_factor
        }
        const accentType =
            match[2] === 'vec' || match[2] === 'widehat' ? 'path' : 'text'
        this.accentExpr = {
            expr,
            accent,
            className,
            adx,
            accentType,
            fontKey: this.fontKey,
        }
    }
}

const ACCENTS = {
    '\\hat': '^',
    // '\\widehat': '', // TODO:has to be implemented with svg path
    '\\tilde': '~',
    '\\check': 'ˇ',
    '\\acute': 'ˊ',
    '\\grave': 'ˋ',
    '\\dot': '.',
    '\\ddot': '..',
    '\\breve': '˘',
    '\\bar': 'ˉ',
    '\\vec': 'arrow',
}
const ACCENT_SPACING = {
    // hat spacing
    c: (font_factor) => ({ adx: 1 * font_factor }),
    f: (font_factor) => ({ adx: 3 * font_factor }),
    g: (font_factor) => ({ adx: 1 * font_factor }),
    d: (font_factor) => ({ adx: 2.5 * font_factor }),
    j: (font_factor) => ({ adx: 1 * font_factor }),
    o: (font_factor) => ({ adx: 0.5 * font_factor }),
    l: (font_factor) => ({ adx: 0.6 * font_factor }),
    m: (font_factor) => ({ adx: 0.6 * font_factor }),
    q: (font_factor) => ({ adx: 1.2 * font_factor }),
    r: (font_factor) => ({ adx: 0.6 * font_factor }),
    s: (font_factor) => ({ adx: 0.6 * font_factor }),
    t: (font_factor) => ({ adx: 0.6 * font_factor }),
    u: (font_factor) => ({ adx: 0.6 * font_factor }),
    v: (font_factor) => ({ adx: 0.6 * font_factor }),
    w: (font_factor) => ({ adx: 1.6 * font_factor }),
    x: (font_factor) => ({ adx: 0.7 * font_factor }),
    y: (font_factor) => ({ adx: 0.8 * font_factor }),
    z: (font_factor) => ({ adx: 0.8 * font_factor }),
    '\\beta': (font_factor) => ({ adx: 1.5 * font_factor }),
    '\\gamma': (font_factor) => ({ adx: 0.7 * font_factor }),
    '\\zeta': (font_factor) => ({ adx: 1.5 * font_factor }),
    '\\rho': (font_factor) => ({ adx: 1.3 * font_factor }),
    '\\nu': (font_factor) => ({ adx: 1.1 * font_factor }),
    '\\upsilon': (font_factor) => ({ adx: 1 * font_factor }),
    '\\omicron': (font_factor) => ({ adx: 0.5 * font_factor }),
    '\\tau': (font_factor) => ({ adx: 0.9 * font_factor }),
    '\\chi': (font_factor) => ({ adx: 0.7 * font_factor }),
    '\\xi': (font_factor) => ({ adx: 1.3 * font_factor }),
    '\\psi': (font_factor) => ({ adx: 1.4 * font_factor }),
}
