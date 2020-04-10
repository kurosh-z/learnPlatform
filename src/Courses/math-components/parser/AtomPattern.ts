import Pattern, { LETTERS, MathExpr, PatternArgs } from './Pattern';

export default class AtomPattern extends Pattern {
  mathExpressions: MathExpr[];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  numRegStr = '([-+]?)(\\d+.?\\d*)';
  lettRegStr = `[${LETTERS}]+`;
  regString = `[${LETTERS}]+|([-+]?)(\\d+.?\\d*)`;
  constructor({ name }: PatternArgs) {
    super({ name });
  }
  isParallel() {
    return false;
  }
  isPattern(str: string) {
    //for the point char(.) between numbers.
    if (str === '.') return true;
    const regex = new RegExp(this.regString, 'mg');
    return regex.test(str);
  }

  isNumber(str: string) {
    if (str === '.') return true;
    const regex = new RegExp(this.numRegStr, 'gm');
    return regex.test(str);
  }
  isLetter(str: string) {
    if (str === '.') return true;
    const regex = new RegExp(this.lettRegStr, 'gm');
    return regex.test(str);
  }
  isForbidenChar(char: string) {
    if (char === '_' || char === '^') return true;
    return false;
  }
  findRangeGroup(expr: string) {
    let idx = -1;
    let groups: { expr: string; type: 'math_number' | 'math_letter' }[] = [];
    let currGroup: { expr: string; type: 'math_number' | 'math_letter' } = {
      expr: '',
      type: 'math_letter',
    };

    for (const char of expr) {
      if (this.isPattern(char) && !this.isForbidenChar(expr[idx + 2])) {
        idx++;
      } else {
        break;
      }
      if (idx === 0) {
        currGroup.type = this.isLetter(char) ? 'math_letter' : 'math_number';
        currGroup.expr += char;
      } else {
        if (
          (this.isLetter(char) && currGroup.type === 'math_letter') ||
          (this.isNumber(char) && currGroup.type === 'math_number')
        ) {
          currGroup.expr += char;
        } else {
          groups.push(currGroup);
          currGroup = { expr: '', type: 'math_letter' };
          currGroup.type = this.isLetter(char) ? 'math_letter' : 'math_number';
          currGroup.expr += char;
        }
      }
    }
    groups.push(currGroup);
    return { groups: groups, endingIndex: idx + 1 };
  }
  strToMathExpr(str: string, startIdx: number = 0) {
    const { endingIndex, groups } = this.findRangeGroup(str);
    this.stratingIndex = startIdx;
    this.endingIndex = endingIndex;

    const mathExpressions: MathExpr[] = [];
    for (const group of groups) {
      const attr: MathExpr['attr'] = {
        className: group.type,
        fontKey: this.fontKey,
        dx: 0,
        dy: 0,
      };
      mathExpressions.push({ expr: group.expr, attr });
    }

    this.mathExpressions = mathExpressions;
    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
