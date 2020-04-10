import { FontSizesType } from './MathCss';
import Pattern, { LETTERS, MathExpr, PatternArgs } from './Pattern';

type IndexType = 'subscript' | 'supscript';
const SUP_DY = -8;
const SUB_DY = 5;

export default class ScriptPattern extends Pattern {
  regString = `([${LETTERS}0-9])((_{)|(\\^{))|([${LETTERS}0-9])((_)|(\\^))([${LETTERS}0-9])`;
  mathExpressions: Required<MathExpr>[];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  isType2: boolean = false;

  constructor({ name, fontSizes }: PatternArgs) {
    super({ name, fontSizes });
  }
  /* 
    test the given str for pattern
    */
  public isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }
  isParallel() {
    return this.isType2;
  }

  _findFirstIndex(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    const match = regexp.exec(str);

    // check if its []_[] or []_{[]} ?
    var type: IndexType;
    var endIdx: number;
    var indexStr: string;

    if (str[2] !== '{') {
      indexStr = str[2];
      endIdx = 3;
    } else {
      endIdx = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: 0,
      });
      indexStr = str.slice(3, endIdx - 1);
    }
    type = str[1] === '_' ? (type = 'subscript') : 'supscript';

    return { indexStr, type, endIdx };
  }
  _findSecondIndex(str: string, startIdx: number) {
    const regexp = /(_{)|(\^{)|(_)|(\^)/gm;
    regexp.lastIndex = startIdx;
    const match = regexp.exec(str);

    // check if its []_[] or []_{[]} ?
    var type: IndexType;
    var endIdx: number;
    var indexStr: string;

    if (match[0] === '_' || match[0] === '^') {
      indexStr = str[startIdx + 2];
      endIdx = startIdx + 3;
    } else if (match[0] === '_{' || match[0] === '^{') {
      endIdx = this.findmatchingPairs({
        openregStr: '{',
        closeregStr: '}',
        str: str,
        startIdx: match.index + 1,
      });
      indexStr = str.slice(startIdx + 3, endIdx - 1);
    }
    if (match[0] === '_' || match[0] === '_{') type = 'subscript';
    else if (match[0] === '^' || match[0] === '^{') type = 'supscript';

    return { indexStr, type, endIdx };
  }
  strToMathExpr(str: string, startIdx: number = 0) {
    const base = str.slice(startIdx, startIdx + 1);

    let type1: IndexType, type2: IndexType;
    let endIdx1: number, endIdx2: number;
    let indexStr1: string, indexStr2: string;
    let nextIndex = this._findFirstIndex(str);
    type1 = nextIndex.type;
    endIdx1 = nextIndex.endIdx;
    indexStr1 = nextIndex.indexStr;

    //check if thre is another index
    if (str[endIdx1] === '_' || str[endIdx1] === '^') {
      let nextIndex = this._findSecondIndex(str, endIdx1 - 1);
      type2 = nextIndex.type;
      endIdx2 = nextIndex.endIdx;
      indexStr2 = nextIndex.indexStr;
    }

    if (
      (type1 === 'subscript' && type2 === 'subscript') ||
      (type1 === 'supscript' && type2 === 'supscript')
    )
      throw new Error(`double subscript at index ${endIdx1}`);

    if (type2) this.isType2 = true;
    else this.isType2 = false;

    let indexFontKey: keyof FontSizesType;
    if (this.fontKey === 'scriptsize') indexFontKey = 'tiny';
    else if (this.fontKey === 'tiny') indexFontKey = 'tiny';
    else indexFontKey = 'scriptsize';
    let sub_dy = this.fontSizes[indexFontKey] * SUB_DY;
    let sup_dy = this.fontSizes[indexFontKey] * SUP_DY;

    const mathExpressions: Required<MathExpr>[] = type2
      ? [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.fontKey,
            },
          },

          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? sub_dy : sup_dy,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
          {
            expr: indexStr2,
            attr: {
              dx: 0,
              dy: type2 === 'subscript' ? sub_dy : sup_dy,
              className: type2 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
        ]
      : [
          {
            expr: base,
            attr: {
              dx: 0,
              dy: 0,
              className: 'base',
              fontKey: this.fontKey,
            },
          },
          {
            expr: indexStr1,
            attr: {
              dx: 0,
              dy: type1 === 'subscript' ? sub_dy : sup_dy,
              className: type1 === 'subscript' ? 'sub' : 'sup',
              fontKey: indexFontKey,
            },
          },
        ];
    this.mathExpressions = mathExpressions;
    this.stratingIndex = startIdx;
    this.endingIndex = type2 ? endIdx2 : endIdx1;
    this.stringsRest = this.consume(str, this.endingIndex);
  }
}
