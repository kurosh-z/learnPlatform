export type PatternAttr = { dx?: number; dy?: number; className?: string };
export type PatternProps = {
  name: string;
  regString: string;
  attr: PatternAttr;
  extExprCb: (expr: string) => string;
};
export default class Pattern {
  regString: string;
  name: string;
  private _attr: PatternAttr;
  extExprCb: (expr: string) => string;

  /* 
  @param name: name of the pattern ex. underscript
  @param regString: regexp string to detect the pattern
  @extExprCb: a callback function which retuns the actual expr 
              (ex: _{somethign} => something)
  @param attr: returns the required attributes for expr in this pattern            
  */
  constructor({ name, regString, extExprCb, attr = {} }: PatternProps) {
    this.name = name;
    this.regString = regString;
    this.extExprCb = extExprCb;
    this._attr = attr;
  }
  /* 
  test the given str for pattern
  */
  isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }
  /* 
   trim rawExpr and returns actual expr (ex: _{somethign} => something)
  */
  extExpr(expr: string): string {
    // let extExpr = this.extExprCb.call(this, expr);
    // return extExpr;
    return this.extExprCb(expr);
  }
  /* 
  returns the required attributes for expr in this pattern
  (ex: a_{expr} => expr should be positioned as underscript: attr:{dy:-12})
  */
  get attr() {
    return this._attr;
  }
  patternCB: (str: string, startIdx: number) => void = (str, startIdx) => {
    const base = str.slice(startIdx, startIdx + 1);
    const subEndIdx = this.findmatchingPairs({
      open: '{',
      close: '}',
      str: str,
      startIdx: startIdx
    });
  };

  findmatchingPairs({
    open,
    close,
    str,
    startIdx = 0
  }: {
    open: string;
    close: string;
    str: string;
    startIdx?: number;
  }) {
    const regOpen = new RegExp(open, 'gm');
    const regClose = new RegExp(close, 'gm');
    regOpen.lastIndex = startIdx;
    const match = regOpen.exec(str);
    regClose.lastIndex = regOpen.lastIndex;
    var numOpen = 1,
      numClose = 0;
    var clMatch: RegExpExecArray;
    var matchingCloseIndex: number;
    let flag = true;
    while (flag) {
      if (regOpen.exec(str)) numOpen++;
      clMatch = regClose.exec(str);
      if (clMatch) numClose++;
      if (numOpen - numClose === 0 && !match)
        throw new Error('unbalanced paris: no closing match could be found');
      if (numOpen - numClose) {
        matchingCloseIndex = regClose.lastIndex;
        flag = false;
      }
    }
    return matchingCloseIndex;
  }
}
