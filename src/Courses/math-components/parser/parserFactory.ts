import Parser, { ParserArgs } from './Parser';
import { FontSizesType } from './MathCss';
import PConfigs from './PConfigs';

export default function parserFactory({
  str,
  x,
  y,
  fontKey,
  pfontSizes,
  parentParser,
}: Omit<ParserArgs, 'configs'> & {
  pfontSizes?: FontSizesType;
  parentParser?: Parser;
}) {
  const configs = pfontSizes
    ? PConfigs.getInstance(pfontSizes)
    : PConfigs.getInstance();
  // const configs = new PConfigs(pfontSizes);
  const parser = new Parser({ str, x, y, fontKey, configs });
  parser.parse();
  // if parentParse update BBox of the parent!
  if (parentParser) {
    parentParser._updateBBoxFromBBox(parser);
  }
  return parser;
}
