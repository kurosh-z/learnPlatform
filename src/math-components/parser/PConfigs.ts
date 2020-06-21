import { FontSizeFunc } from './MathCss'
import {
    AtomPattern,
    AtomSpecPattern,
    MatrixPattern,
    patternFactory,
    ScriptPattern,
    SymbolPattern,
    AnimCompPattern,
    AccentPattern,
    FracPattern,
} from './index'

export type PConfigsConstArgs = {
    getFontSize: FontSizeFunc
}
export default class PConfigs {
    getFontSize: FontSizeFunc
    cssName: any
    allPatterns: (
        | ScriptPattern
        | MatrixPattern
        | SymbolPattern
        | AnimCompPattern
        | AccentPattern
        | FracPattern
    )[]
    atomPatterns: (AtomPattern | AtomSpecPattern)[]
    public static instance: PConfigs

    private constructor({ getFontSize }: PConfigsConstArgs) {
        this.getFontSize = getFontSize
        this.allPatterns = [
            patternFactory('supsub', getFontSize),
            patternFactory('matrix'),
            patternFactory('symbols'),
            patternFactory('animcomp'),
            patternFactory('accent'),
            patternFactory('fraction'),
        ]
        this.atomPatterns = [
            patternFactory('atom', getFontSize),
            patternFactory('special_chars', getFontSize),
        ]
    }
    public setConfigs(getFontSize: FontSizeFunc) {
        this.getFontSize = getFontSize
    }
    public static getInstance({ getFontSize }: Partial<PConfigsConstArgs>) {
        if (!PConfigs.instance) {
            PConfigs.instance = new PConfigs({ getFontSize })
        }
        return PConfigs.instance
    }
}
