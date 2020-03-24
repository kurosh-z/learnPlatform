import Pattern, { PatternAttr } from './Pattern';

/* Class ExprChildren  ------------------------------------------------



-----------------------------------------------------------------*/
type ExprChildProps = {
  exprRaw: string;
  exprExt: string;
  pattName: string;
  children?: ExprChild[];
};
const allAtoms: ExprChild[] = [];
class ExprChild {
  _exprRaw: string;
  _exprExt: string;
  _pattName: string;
  _attr: PatternAttr = { dx: 0, dy: 0, className: '' };

  private _children?: ExprChild[] = [];
  private _parent?: ExprChild | null = null;

  constructor(child: ExprChildProps) {
    this._exprRaw = child.exprRaw;
    this._exprExt = child.exprExt;
    this._pattName = child.pattName;
    if (child.children) this._children = child.children;
    if (child.pattName === 'atom') allAtoms.push(this);
  }

  set children(children: ExprChild[]) {
    if (!children)
      throw new Error(
        `expected children of type ExprChildren got ${children} `
      );
    else {
      for (const child of children) {
        this._updateChildsAttrs(child);
        child._parent = this;
      }
      this._children = children;
    }
  }
  get children() {
    if (this._children) return this._children;
  }

  attachChild(child: ExprChild) {
    child._parent = this;
    if (this._children) this._children.push(child);
    else {
      this._children = [child];
    }
  }
  hasParent() {
    return this._parent ? true : false;
  }
  set attr(attr: PatternAttr) {
    if (this._parent) {
      const parrentAttrs = this._parent._attr;

      //   console.log('parrentAttrs', parrentAttrs);
      //   console.log('newAttr', attr);
      let attr_key: keyof PatternAttr;
      for (attr_key in attr) {
        if (attr_key === 'className') {
          this._attr[attr_key] = attr[attr_key];
        } else {
          if (attr_key in parrentAttrs)
            this._attr[attr_key] = parrentAttrs[attr_key] + attr[attr_key];
          else this._attr[attr_key] = attr[attr_key];
        }
      }
      for (attr_key in parrentAttrs) {
        if (!(attr_key in attr) && attr_key !== 'className') {
          this._attr[attr_key] = parrentAttrs[attr_key];
        }
      }
      console.log('mixed', this._attr);
      //   console.log('------------------------------------');
    } else {
      this._attr = { ...this._attr, ...attr };
    }
  }

  // we use this to update childs attrs with its parrent as we add children!
  private _updateChildsAttrs(child: ExprChild) {
    const parrentAttrs = this._attr;
    let attr_key: keyof PatternAttr;
    // update classNames form parent's classNames
    this._updateClassNames(child._attr, parrentAttrs);
    for (attr_key in child._attr) {
      if (attr_key in parrentAttrs && attr_key !== 'className')
        // @ts-ignore
        child._attr[attr_key] = child._attr[attr_key] + parrentAttrs[attr_key];
    }
    for (attr_key in parrentAttrs) {
      if (!(attr_key in child._attr) && attr_key !== 'className') {
        child._attr[attr_key] = parrentAttrs[attr_key];
      }
    }
  }

  // if expr is found in the string returns true otherwiese false
  _isExprInStr(expr: string, str: string) {
    const regexp = RegExp(expr, 'mg');
    return regexp.test(str);
  }
  _updateClassNames(childAttr: PatternAttr, parrentAttr: PatternAttr) {
    let className = childAttr['className'];
    let parentClass = parrentAttr['className'];
    let updatedClassName: string;
    if (this._isExprInStr(className, parentClass)) {
      updatedClassName = parentClass;
    } else {
      updatedClassName = parentClass + ' ' + className;
    }
    childAttr.className = updatedClassName;
  }
}

/* Class Parser  ------------------------------------------------



-----------------------------------------------------------------
*/

export class Parser {
  patternList: Pattern[] = [];
  patternObj: { [key: string]: Pattern } = {};
  regStringAll: string = '';

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
      if (idx >= 10) flag = false;
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
    // console.log('process', children);
  }

  stringToAtom(str: string) {
    let level0Children = this._exprToChildren(str); //first children form str;
    this._processChildren(level0Children);
    console.log(level0Children);
    // console.log('atoms', this.allAtoms);
  }
}

// const patt1Str = '_{([(_{(a-z0-9)+?})?]+)?}';
const patt1Str = '_{[(_{(a-z0-9)+?})?]+}';
const patt2Str = '_[a-z0-9A-Z@]';

const extractExpr1 = function(expr: string) {
  return expr.slice(2, -1);
};
const extractExpr2 = function(expr: string) {
  return expr.slice(1, expr.length);
};

const pattern1 = new Pattern({
  name: 'patt1',
  regString: patt1Str,
  extExprCb: extractExpr1,
  attr: { dy: -12, className: 'underscript' }
});

const pattern2 = new Pattern({
  name: 'patt2',
  regString: patt2Str,
  extExprCb: extractExpr2,
  attr: { dy: -12, className: 'underscript' }
});

const patternList = [pattern1, pattern2];
const parser = new Parser(patternList);
const str = 'd_{u_{a_2}}';
parser.stringToAtom(str);
console.log('allatoms', allAtoms);
