import Pattern, { MathExpr, PatternArgs } from './Pattern'

const MATH_SYMBOLS = {
    '\\alpha': 'α',
    '\\Beta': 'Β',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ϵ',
    '\\zeta': 'ζ',
    '\\Zeta': 'Z',
    '\\eta': 'η',
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\iota': 'ι',
    '\\kappa': 'κ',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\mu': 'μ',
    '\\nu': 'ν',
    '\\omicron': 'ο',
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\rho': 'ρ',
    '\\sigma': 'σ',
    '\\Siqma': 'Σ',
    '\\tau': 'τ',
    '\\upsilon': 'υ',
    '\\Upsilon': 'Υ',
    '\\phi': 'ϕ',
    '\\Phi': 'Φ',
    '\\chi': 'χ',
    '\\Xi': 'Ξ',
    '\\xi': 'ξ',
    '\\psi': 'ψ',
    '\\Psi': 'Ψ',
    '\\omega': 'ω',
    //math-op
    '\\int': '∫',
    '\\times': '×',
    '\\infty': '∞',
    '\\partial': '∂',
    '\\ldots': '.', // horizontal dots on the line
    '\\cdots': '.', // horizontal dots above the line
    '\\vdots': '.', // vertical dots
    '\\ddots': '.', // diagonal dots
}

export default class SymbolPattern extends Pattern {
    endingIndex: number
    stratingIndex: number
    regString: string
    mathExpressions: MathExpr[]
    stringsRest: string
    symb: 'int' | 'partial' | 'atom' | 'ldots' | 'cdots' | 'vdots' | 'ddots'
    constructor({ name }: PatternArgs) {
        super({ name })
        const regStrs = this._createRegStrings()

        this.regString = regStrs
    }
    private _createRegStrings() {
        let keyList: string[] = []

        for (const key in MATH_SYMBOLS) {
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
        regStr += ')'

        return regStr
    }

    isParallel() {
        return false
    }
    isPattern(str: string) {
        const regexp = new RegExp(this.regString, 'mg')
        return regexp.test(str)
    }

    strToMathExpr(str: string) {
        const regexp = new RegExp(this.regString, 'gm')
        const match = regexp.exec(str)
        this.stratingIndex = match.index
        const expr = MATH_SYMBOLS[match[0]]
        if (expr === '∫') this.symb = 'int'
        else if (expr === '∂') this.symb = 'partial'
        else if (expr === '.')
            this.symb = match[2] as 'ldots' | 'cdots' | 'ddots' | 'vdots'
        else this.symb = 'atom'
        this.endingIndex = regexp.lastIndex
        this.stringsRest = this.consume(str, this.endingIndex)

        this.mathExpressions = [
            {
                expr: expr,
                attr: { className: '', dx: 0, dy: 0, fontKey: this.fontKey },
            },
        ]
    }
}
