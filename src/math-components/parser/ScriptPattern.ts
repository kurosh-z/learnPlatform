import { FONTSIZES } from './MathCss'
import Pattern, { MathExpr, PatternArgs } from './Pattern'

type IndexType = 'subscript' | 'supscript'

type ScriptExprs = {
    expr: string
    type: 'sub' | 'sup'
    fontKey: keyof FONTSIZES
}
export default class ScriptPattern extends Pattern {
    regString = `(_{)|(\\^{)|(_)|(\\^)`
    // regString = `((_{)|(\\^{))|((_)|(\\^))`;
    mathExpressions: Required<MathExpr>[]
    stratingIndex: number
    endingIndex: number
    stringsRest: string
    isType2: boolean = false
    scriptExprs: ScriptExprs[]

    constructor({ name }: PatternArgs) {
        super({ name })
    }
    /* 
    test the given str for pattern
    */
    public isPattern(str: string) {
        const regexp = new RegExp(this.regString, 'mg')
        return regexp.test(str)
    }

    _findIndex(str: string, startIdx: number) {
        const regexp = /(_{)|(\^{)|(_)|(\^)/gm
        regexp.lastIndex = startIdx
        const match = regexp.exec(str)

        // check if its []_[] or []_{[]} ?
        var type: IndexType
        var endIdx: number
        var indexStr: string

        if (match[0] === '_' || match[0] === '^') {
            indexStr = str[startIdx + 1]
            endIdx = startIdx + 2
        } else if (match[0] === '_{' || match[0] === '^{') {
            endIdx = this.findmatchingPairs({
                openregStr: '{',
                closeregStr: '}',
                str: str,
                startIdx: match.index + 1,
            })
            indexStr = str.slice(startIdx + 2, endIdx - 1)
        }
        if (match[0] === '_' || match[0] === '_{') type = 'subscript'
        else if (match[0] === '^' || match[0] === '^{') type = 'supscript'

        return { indexStr, type, endIdx }
    }
    strToMathExpr(str: string, startIdx: number = 0) {
        // const base = str.slice(startIdx, startIdx + 1);

        let type1: IndexType, type2: IndexType
        let endIdx1: number, endIdx2: number
        let indexStr1: string, indexStr2: string
        let nextIndex = this._findIndex(str, 0)
        type1 = nextIndex.type
        endIdx1 = nextIndex.endIdx
        indexStr1 = nextIndex.indexStr

        //check if thre is another index
        if (str[endIdx1] === '_' || str[endIdx1] === '^') {
            let nextIndex = this._findIndex(str, endIdx1)
            type2 = nextIndex.type
            endIdx2 = nextIndex.endIdx
            indexStr2 = nextIndex.indexStr
        }

        if (
            (type1 === 'subscript' && type2 === 'subscript') ||
            (type1 === 'supscript' && type2 === 'supscript')
        )
            throw new Error(`double subscript at index ${endIdx1}`)

        if (type2) this.isType2 = true
        else this.isType2 = false

        let indexFontKey: keyof FONTSIZES

        if (this.fontKey === 'scriptsize') indexFontKey = 'tiny'
        else if (this.fontKey === 'tiny') indexFontKey = 'tiny'
        else indexFontKey = 'scriptsize'

        this.scriptExprs = type2
            ? [
                  {
                      expr: indexStr1,
                      type: type1 === 'subscript' ? 'sub' : 'sup',
                      fontKey: indexFontKey,
                  },
                  {
                      expr: indexStr2,
                      type: type2 === 'subscript' ? 'sub' : 'sup',
                      fontKey: indexFontKey,
                  },
              ]
            : [
                  {
                      expr: indexStr1,
                      type: type1 === 'subscript' ? 'sub' : 'sup',
                      fontKey: indexFontKey,
                  },
              ]
        this.stratingIndex = startIdx
        this.endingIndex = type2 ? endIdx2 : endIdx1
        this.stringsRest = this.consume(str, this.endingIndex)
    }
}
