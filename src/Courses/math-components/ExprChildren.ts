import { PatternAttr } from './Pattern';
/* Class ExprChildren  ------------------------------------------------



-----------------------------------------------------------------*/
export type ExprChildProps = {
  exprRaw: string;
  exprExt: string;
  pattName: string;
  children?: ExprChild[];
};

export default class ExprChild {
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
    // if (child.pattName === 'atom') allAtoms.push(this);
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

  //   attachChild(child: ExprChild) {
  //     child._parent = this;
  //     if (this._children) this._children.push(child);
  //     else {
  //       this._children = [child];
  //     }
  //   }
  hasParent() {
    return this._parent ? true : false;
  }
  // TODO: see if you need this mixing here at all!
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
