import Pattern, { PatternArgs, MathExpr } from './Pattern';

const DELIMITERS = {
  matrix: { open: '', close: '' },
  pmatrix: { open: 'parentheses_open', close: 'parentheses_close' },
  bmatrix: { open: 'bracket_open', close: 'bracket_close' },
  Bmatrix: { open: '{', close: '}' },
  vmatrix: { open: 'vertical_bar', close: 'vertical_bar' },
};
type Delimiters = typeof DELIMITERS;
type MatrixType = keyof Delimiters;
type Delimiter = { open: string; close: string };
export default class MatrixPattern extends Pattern {
  regString =
    '(\\\\begin)(({matrix})|({pmatrix})|({bmatrix})|({Bmatrix})|({vmatrix})|({Vmatrix}))';
  matrixElements: MathExpr[][];
  stratingIndex: number;
  endingIndex: number;
  stringsRest: string;
  mtype: MatrixType;
  delimiter: Delimiter;

  constructor({ name }: PatternArgs) {
    super({ name });
  }
  isParallel() {
    return false;
  }
  isPattern(str: string) {
    const regexp = new RegExp(this.regString, 'mg');
    return regexp.test(str);
  }

  strToMathExpr(str: string, startIdx: number = 0) {
    // const closingStrs =  '(\\\\end)(({matrix})|({pmatrix})|({Bmatrix})|({vmatrix})|({Vmatrix}))';
    const regexp = new RegExp(this.regString, 'gm');
    const match = regexp.exec(str);
    const matrixType = match[2]; // second group should be one of  {matrix} or {pmatrix} ...
    const mtype = matrixType.slice(1, matrixType.length - 1);
    if (!DELIMITERS[mtype])
      throw new Error(`matrix type: ${mtype} is not recognized!`);
    this.mtype = mtype as MatrixType;
    this.delimiter = DELIMITERS[mtype];

    const openregStr = '\\' + match[0]; // \begin{matrix}
    const closeregStr = '\\\\end{' + matrixType.slice(1, matrixType.length);
    let endingIndex = this.findmatchingPairs({
      openregStr,
      closeregStr,
      str,
    });

    const startingIndex = regexp.lastIndex;
    this.stratingIndex = startingIndex;
    // thre is one char more in closeregStr (because of scaping backslash);
    this.endingIndex = endingIndex - 1;

    let matrixElements: MathExpr[][] = [];

    let matrixStr = str.slice(startingIndex, endingIndex - closeregStr.length);
    // matrixStr = this.consumeWhiteSpaces(matrixStr);

    let idx = 0;
    while (matrixStr.length !== 0) {
      const { rowExprs, reducedStr } = this.findNextRow(matrixStr);
      matrixElements.push(rowExprs);
      matrixStr = reducedStr;
      idx++;
      if (idx > str.length) throw new Error('Oops! something went wrong!');
    }
    this.matrixElements = matrixElements;
    this.stringsRest = this.consume(str, this.endingIndex);
  }
  // consumeWhiteSpaces(str: string): string {
  //   const newStr = str.replace(/\s+|\t+/gm, '');
  //   return newStr;
  // }

  findNextRow(str: string): { rowExprs: MathExpr[]; reducedStr: string } {
    const regex = /&/gm;
    const endRowRegex = /\\\\/gm;
    const endRow = endRowRegex.exec(str);
    const endRowIdx = endRow ? endRow.index : str.length; // the last row can be without \\
    let rowExprs: MathExpr[] = [];
    let lastElIdx = 0;
    let idx = 0;
    let expr: string;
    let attr: MathExpr['attr'] = {
      dx: 0,
      dy: 0,
      className: '',
      fontKey: this.fontKey,
    };
    while (lastElIdx < endRowIdx) {
      let match = regex.exec(str);
      if (match) {
        let matchIdx = match.index;
        if (matchIdx < endRowIdx) {
          expr = str.slice(lastElIdx, matchIdx);
          rowExprs.push({ expr, attr });
          lastElIdx = matchIdx + 1;
        } else {
          expr = str.slice(lastElIdx, endRowIdx);
          rowExprs.push({ expr, attr });
          break;
        }
      } else {
        expr = str.slice(lastElIdx, endRowIdx);
        rowExprs.push({ expr, attr });
        break;
      }

      idx++;
      if (idx > str.length)
        throw new Error('loop inside finNextRow is not stable!');
    }
    // const lastExpr = str.slice(lastElIdx, endRowIdx);
    // rowExprs.push({ expr: lastExpr });
    const reducedStr = this.consume(str, endRowIdx + 2);
    return { rowExprs, reducedStr };
  }

  findForbidenExprs(str: string) {
    // TODO: add other forbiden expressions here!
    const forbindenRegExp = new RegExp(this.regString, 'gm');
    return;
  }
}
