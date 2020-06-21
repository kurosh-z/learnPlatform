import AtomPattern from './AtomPattern'
import AtomSpecPattern from './AtomSpecPattern'
import { FontSizeFunc } from './MathCss'
import MatrixPattern from './MatrixPattern'
import ScriptPattern from './ScriptPattern'
import SymbolPattern from './SymbolPattern'
import AnimCompPattern from './AnimCompPattern'
import AccentPattern from './AccentPattern'
import FracPattern from './FracPattern'

export default function patternFactory(
    patternName: 'atom' | 'special_chars',
    getFontSize?: FontSizeFunc
): AtomPattern | AtomSpecPattern

export default function patternFactory(
    patternName:
        | 'supsub'
        | 'matrix'
        | 'symbols'
        | 'animcomp'
        | 'accent'
        | 'fraction',
    getFontSize?: FontSizeFunc
):
    | ScriptPattern
    | MatrixPattern
    | SymbolPattern
    | AnimCompPattern
    | AccentPattern
    | FracPattern

export default function patternFactory(
    patternName:
        | 'atom'
        | 'special_chars'
        | 'supsub'
        | 'matrix'
        | 'symbols'
        | 'animcomp'
        | 'accent'
        | 'fraction',
    getFontSize?: FontSizeFunc
) {
    if (patternName === 'atom')
        return new AtomPattern({
            name: patternName,
            getFontSize: getFontSize,
        })

    if (patternName === 'supsub')
        return new ScriptPattern({
            name: 'supsub',
        })
    if (patternName === 'matrix')
        return new MatrixPattern({
            name: 'matrix',
        })
    if (patternName === 'special_chars')
        return new AtomSpecPattern({
            name: 'special_chars',
            getFontSize: getFontSize,
        })
    if (patternName === 'symbols')
        return new SymbolPattern({
            name: patternName,
            getFontSize: getFontSize,
        })
    if (patternName === 'animcomp')
        return new AnimCompPattern({
            name: patternName,
        })
    if (patternName === 'accent')
        return new AccentPattern({
            name: patternName,
        })
    if (patternName === 'fraction')
        return new FracPattern({
            name: patternName,
        })
    else throw new Error(`pattern name ${patternName} is not recognized!`)
}
