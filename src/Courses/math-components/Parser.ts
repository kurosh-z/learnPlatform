import React from 'react';
import { AtomPattern, SscriptPattern, Pattern } from './Pattern';
const allPatterns = [
  new SscriptPattern({ regString: '([a-z0-9])((_{)|(^{))', name: 'sScript' })
];
const atomPatterns = [
  new AtomPattern({ regString: '[a-zA-Z@]+', name: 'letters' })
];
export type CompProps = {
  component: React.RefForwardingComponent<any, any>;
  props: Object;
};
export default class Parser {
  str: string;
  nstr: string;
  patternList: typeof allPatterns = allPatterns;
  atomPatternsList: typeof atomPatterns = atomPatterns;
  allRegStrings: string;
  allAtomRegStrings: string;
  componentList: CompProps[] = [];
  xPos: number;

  constructor(str: string, x: number) {
    this.str = str;
    this.nstr = str;
    this.xPos = x;
    this.allRegStrings = this._makeAllregStrings(this.patternList);
    this.allAtomRegStrings = this._makeAllregStrings(this.atomPatternsList);
  }
  _makeAllregStrings(patternList: typeof allPatterns | typeof atomPatterns) {
    let allRegStrings = '';
    var idx = 0;
    for (const pattern of patternList) {
      if (idx === 0) allRegStrings = pattern.regString;
      else {
        allRegStrings += '|' + pattern.regString;
      }
      idx++;
    }
    return allRegStrings;
  }
  whitchPattern(
    expr: string,
    patternList: typeof allPatterns | typeof atomPatterns
  ) {
    let matchingPattern;
    for (const pattern of patternList) {
      if (pattern.isPattern(expr)) return pattern;
    }
    if (!matchingPattern) throw new Error(`expr containts no latex code!`);
  }
  consume(expr: string, startingIndex: number) {
    // console.log('consume', startingIndex, expr);
    const reducedExpr = expr.slice(startingIndex, expr.length);
    return reducedExpr;
  }
  _handleAtoms(expr: string) {
    const regexAll = new RegExp(this.allAtomRegStrings, 'mg');
    const match = regexAll.exec(expr);
    if (!match || match.index !== 0) {
      throw new Error(`expr: ${expr} is not latex`);
    }
    const pattern = this.whitchPattern(match[0], this.atomPatternsList);

    pattern.exprToProps(expr, match.index);
    this.componentList.push({
      component: pattern.getComponent(),
      props: pattern.props
    });
    expr = this.consume(expr, pattern.endingIndex);
    return expr;
  }

  exprToComponents() {
    let idx = 0;
    while (this.nstr.length !== 0) {
      const regexAll = new RegExp(this.allRegStrings, 'mg');
      const match = regexAll.exec(this.nstr);
      if (!match || match.index !== 0) {
        this.nstr = this._handleAtoms(this.nstr);
      } else {
        const pattern = this.whitchPattern(match[0], this.patternList);

        pattern.exprToProps(this.nstr, match.index);
        this.componentList.push({
          component: pattern.getComponent(),
          props: pattern.props
        });
        this.nstr = this.consume(this.nstr, pattern.endingIndex);
      }
      idx++;

      if (idx > this.str.length || idx > 100)
        throw new Error(`parsing loop is not stable!`);
    }
    return this.componentList;
  }
}
