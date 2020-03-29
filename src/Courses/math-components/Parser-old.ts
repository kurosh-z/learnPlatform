import Pattern from './Pattern';
import ExprChild from './ExprChildren';

/* Class Parser  ------------------------------------------------



-----------------------------------------------------------------
*/
const allAtoms: ExprChild[] = [];

export default class Parser {
  patternList: Pattern[] = [];
  patternObj: { [key: string]: Pattern } = {};
  regStringAll: string = '';
  allAtoms: ExprChild[] = [];

  constructor(patternList: Pattern[]) {
    this.patternList = patternList;
    this._makePatternObj();
    this._makeRegStringAll();
  }
  _makeRegStringAll() {
    var regStringAll = '';
    let idx = 0;
    for (const pattern of this.patternList) {
      let newStr = idx === 0 ? pattern.regString : '|' + pattern.regString;
      regStringAll += newStr;
      idx++;
    }
    this.regStringAll = regStringAll;
  }
  _makePatternObj() {
    var patternObj = {};
    for (const pattern of this.patternList) {
      Object.defineProperty(patternObj, pattern.name, {
        value: pattern,
        enumerable: true
      });
    }
    this.patternObj = patternObj;
  }
  whichPattern(expr: string): string {
    for (const pattern of this.patternList) {
      if (pattern.isPattern(expr)) return pattern.name;
    }
    return 'atom';
  }
  _patternToChild(exprRaw: string, seperatedExprList: ExprChild[]) {
    let pattName = this.whichPattern(exprRaw);

    let exprExt =
      pattName === 'atom'
        ? exprRaw
        : this.patternObj[pattName].extExpr(exprRaw);

    let exprAttr = pattName === 'atom' ? {} : this.patternObj[pattName].attr;

    let child = new ExprChild({
      exprRaw: exprRaw, // raw expression mainly for debugging purposes
      exprExt: exprExt, // extraced expression to be processes again
      pattName: pattName // pattern name needed to assing required attrs to expressions
    });
    child.attr = exprAttr;
    if (child._pattName === 'atom') {
      allAtoms.push(child);
      console.log('atom found:', child._exprRaw);
    }
    seperatedExprList.push(child);
  }

  _exprToChildren(str: string): ExprChild[] {
    var seperatedExprList: ExprChild[] = [];
    const regexAll = new RegExp(this.regStringAll, 'mg');

    var flag = true;
    var lastIndex = 0;
    var newIndex = 0;
    let idx = 0;
    while (flag) {
      let match = regexAll.exec(str);
      idx += 1;
      if (idx >= 10000) {
        alert('iteration exceeded 10000 loops!');
        flag = false;
      } // TODO: remove this for production!
      if (!match) {
        if (lastIndex !== str.length) {
          let exprRaw = str.slice(lastIndex, str.length);
          this._patternToChild(exprRaw, seperatedExprList);
        }
        flag = false;
      } else {
        newIndex = regexAll.lastIndex;
        if (lastIndex !== match.index) {
          let exprRaw = str.slice(lastIndex, match.index);
          this._patternToChild(exprRaw, seperatedExprList);
        }
        // console.log("expr", expr);
        let exprRaw = str.slice(match.index, newIndex);
        this._patternToChild(exprRaw, seperatedExprList);
        lastIndex = newIndex;
      }
    }
    // console.log(seperatedExprList);

    return seperatedExprList;
  }

  _areAllChildrenAtoms(children: ExprChild[]) {
    let isAtomized = true;
    for (const child of children) {
      if (child._pattName !== 'atom') isAtomized = false;
    }
    return isAtomized;
  }
  _processChildren(children: ExprChild[]) {
    for (const child of children) {
      //   console.log('childRaw', child._exprExt);
      let exprExt = child._exprExt;
      if (child._pattName !== 'atom') {
        let childrenList = this._exprToChildren(exprExt);
        child.children = childrenList;
        // console.log('children of childRaw:', childrenList);
        // console.log('-----------------------------------');
        if (!this._areAllChildrenAtoms(childrenList)) {
          this._processChildren(childrenList);
        }
      }
    }
    return;
    // console.log('proces∫s', children);
  }

  stringToAtom(str: string) {
    let level0Children = this._exprToChildren(str); //first children form str;
    this._processChildren(level0Children);
    // console.log(level0Children);
    // console.log('atoms', this.allAtoms);
    return allAtoms;
  }
}
