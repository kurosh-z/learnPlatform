import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import { FontSizeFunc } from './MathCss';
import MatrixPattern from './MatrixPattern';
import ScriptPattern from './ScriptPattern';
import SymbolPattern from './SymbolPattern';

export default function patternFactory(
  patternName: 'atom' | 'special_chars' | 'supsub' | 'matrix' | 'symbols',
  getFontSize?: FontSizeFunc
) {
  if (patternName === 'atom')
    return new AtomPattern({
      name: patternName,
      getFontSize: getFontSize,
    });

  if (patternName === 'supsub')
    return new ScriptPattern({
      name: 'supsub',
    });
  if (patternName === 'matrix')
    return new MatrixPattern({
      name: 'matrix',
    });
  if (patternName === 'special_chars')
    return new AtomSpecPattern({
      name: 'special_chars',
      getFontSize: getFontSize,
    });
  if (patternName === 'symbols')
    return new SymbolPattern({
      name: patternName,
      getFontSize: getFontSize,
    });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
