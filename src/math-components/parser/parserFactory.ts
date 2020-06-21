import Parser, { ParserArgs } from './Parser'
import { FontSizeFunc } from './MathCss'
import PConfigs from './PConfigs'

export default function parserFactory({
    str,
    x,
    y,
    fontKey,
    fontSizegetter,
    parentParser,
}: Omit<ParserArgs, 'configs'> & {
    fontSizegetter?: FontSizeFunc
    parentParser?: Parser
}) {
    let configs
    if (fontSizegetter) {
        configs = PConfigs.getInstance({ getFontSize: fontSizegetter })
        configs.setConfigs(fontSizegetter)
    } else {
        configs = PConfigs.getInstance({})
    }
    // const configs = new PConfigs(pfontSizes);
    const parser = new Parser({ str, x, y, fontKey, configs })
    parser.parse()
    // if parentParse update BBox of the parent!
    if (parentParser) {
        parentParser._updateBBoxFromBBox(parser)
    }
    return parser
}
