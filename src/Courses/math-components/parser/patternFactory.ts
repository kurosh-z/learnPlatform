import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import { FontSizesType } from './MathCss';
import MatrixPattern from './MatrixPattern';
import ScriptPattern from './ScriptPattern';
import SymbolPattern from './SymbolPattern';

export default function patternFactory(
  patternName: 'atom' | 'special_chars' | 'supsub' | 'matrix' | 'symbols',
  fontSizes?: FontSizesType
) {
  if (patternName === 'atom')
    return new AtomPattern({
      name: patternName,
      fontSizes: fontSizes,
    });

  if (patternName === 'supsub')
    return new ScriptPattern({
      name: 'supsub',
      fontSizes: fontSizes,
    });
  if (patternName === 'matrix')
    return new MatrixPattern({
      name: 'matrix',
    });
  if (patternName === 'special_chars')
    return new AtomSpecPattern({
      name: 'special_chars',
      fontSizes: fontSizes,
    });
  if (patternName === 'symbols')
    return new SymbolPattern({
      name: patternName,
    });
  else throw new Error(`pattern name ${patternName} is not recognized!`);
}
