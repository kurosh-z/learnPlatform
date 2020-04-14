import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import { FontSizeFunc } from './MathCss';
import MatrixPattern from './MatrixPattern';
import patternFactory from './patternFactory';
import ScriptPattern from './ScriptPattern';
import SymbolPattern from './SymbolPattern';
import AnimCompPattern from './AnimCompPattern';

export type PConfigsConstArgs = {
  getFontSize: FontSizeFunc;
};
export default class PConfigs {
  getFontSize: FontSizeFunc;
  cssName: any;
  allPatterns: (
    | ScriptPattern
    | MatrixPattern
    | SymbolPattern
    | AnimCompPattern
  )[];
  atomPatterns: (AtomPattern | AtomSpecPattern)[];
  public static instance: PConfigs;

  private constructor({ getFontSize }: PConfigsConstArgs) {
    this.getFontSize = getFontSize;
    this.allPatterns = [
      patternFactory('supsub', getFontSize),
      patternFactory('matrix'),
      patternFactory('symbols'),
      patternFactory('animcomp'),
    ];
    this.atomPatterns = [
      patternFactory('atom', getFontSize),
      patternFactory('special_chars', getFontSize),
    ];
  }
  public static getInstance({ getFontSize }: Partial<PConfigsConstArgs>) {
    if (!PConfigs.instance) {
      PConfigs.instance = new PConfigs({ getFontSize });
    }
    return PConfigs.instance;
  }
}
