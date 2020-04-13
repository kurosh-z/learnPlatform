import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import { FONTSIZES, FontSizeFunc } from './MathCss';
import MatrixPattern from './MatrixPattern';
import patternFactory from './patternFactory';
import ScriptPattern from './ScriptPattern';
import SymbolPattern from './SymbolPattern';

export default class PConfigs {
  getFontSize: FontSizeFunc;
  cssName: any;
  allPatterns: (ScriptPattern | MatrixPattern | SymbolPattern)[];
  atomPatterns: (AtomPattern | AtomSpecPattern)[];
  public static instance: PConfigs;

  private constructor(getFontSize: FontSizeFunc) {
    this.getFontSize = getFontSize;
    this.allPatterns = [
      // @ts-ignore
      patternFactory('supsub', getFontSize),
      // @ts-ignore
      patternFactory('matrix'),
      // @ts-ignore
      patternFactory('symbols'),
    ];
    this.atomPatterns = [
      // @ts-ignore
      patternFactory('atom', getFontSize),
      // @ts-ignore
      patternFactory('special_chars', getFontSize),
    ];
  }
  public static getInstance(getfontSize?: FontSizeFunc) {
    if (!PConfigs.instance) {
      PConfigs.instance = new PConfigs(getfontSize);
    }
    return PConfigs.instance;
  }
}
