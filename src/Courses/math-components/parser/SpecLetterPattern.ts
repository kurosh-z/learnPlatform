import Pattern, { MathExpr, PatternArgs } from './Pattern';
import mathssymbols from './mathsymbols';
const GREEK_CHARS = mathssymbols.GreekChars;
const GREEK_KEYS = mathssymbols.getGreekKeys();

export default class SpecLetterPattern extends Pattern {
  endingIndex: number;
  stratingIndex: number;
  regString: string;
  mathExpressions: MathExpr[];
  stringsRest: string;
  constructor({ name }: PatternArgs) {
    super({ name });
    this._createGreekRegString();
  }
  private _createGreekRegString() {
    let greekkeylist = GREEK_KEYS.split(/\\/gm);
    greekkeylist = greekkeylist.slice(1, greekkeylist.length);
    let regStr = '(\\\\)(';
    let idx = 0;
    for (const expr of greekkeylist) {
      if (idx === 0) {
        regStr += '(' + expr + ')';
      } else {
        regStr += '|(' + expr + ')';
      }
      idx++;
    }
    regStr += ')';

    this.regString = regStr;
  }

  isParallel() {
    return false;
  }
  isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }

  strToMathExpr(str: string) {
    const regexp = new RegExp(this.regString, 'gm');
    const match = regexp.exec(str);
    this.stratingIndex = match.index;
    const expr = GREEK_CHARS[match[0]];
    this.endingIndex = regexp.lastIndex;
    this.stringsRest = this.consume(str, this.endingIndex);

    this.mathExpressions = [
      {
        expr: expr,
        attr: { className: '', dx: 0, dy: 0, fontKey: this.fontKey },
      },
    ];
  }
}
