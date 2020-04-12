import AtomPattern from './AtomPattern';
import AtomSpecPattern from './AtomSpecPattern';
import { FontSizesType } from './MathCss';
import MatrixPattern from './MatrixPattern';
import patternFactory from './patternFactory';
import ScriptPattern from './ScriptPattern';
// import SpecLetterPattern from './SpecLetterPattern';
import IntegralPattern from './IntegralPattern';
export default class PConfigs {
  fontSizes: FontSizesType;
  cssName: any;
  allPatterns: (ScriptPattern | MatrixPattern)[];
  atomPatterns: (AtomPattern | AtomSpecPattern)[];
  public static instance: PConfigs;

  private constructor(fontSizes: FontSizesType) {
    this.fontSizes = fontSizes;
    this.allPatterns = [
      // @ts-ignore
      patternFactory('supsub', fontSizes),
      // @ts-ignore
      patternFactory('matrix'),
      // @ts-ignore
      // patternFactory('special_letters'),
    ];
    this.atomPatterns = [
      // @ts-ignore
      patternFactory('atom', fontSizes),
      // @ts-ignore
      patternFactory('special_chars', fontSizes),
    ];
  }
  public static getInstance(fontSizes?: FontSizesType) {
    if (!PConfigs.instance) {
      PConfigs.instance = new PConfigs(fontSizes);
    }
    return PConfigs.instance;
  }
  public getFontSizes() {
    return this.fontSizes;
  }
}
