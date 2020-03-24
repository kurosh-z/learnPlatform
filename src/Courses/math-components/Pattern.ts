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
}
