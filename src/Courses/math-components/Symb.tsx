import React, {
  useEffect,
  useRef,
  useState,
  ReactElement,
  useMemo
} from 'react';
import mathSymols from './mathsymbols';
const getlatexSymbol = mathSymols.getlatexSymbol;
// const mathSymbols = Mathsymbols.getInstance();
type SymbProps = {
  symb: string;
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  className?: string;
  children?: ReactElement;
  widthArr: { char: string; width: number }[];
};
const Symb: React.FC<SymbProps> = ({
  symb,
  dx,
  dy,
  className,
  children,
  widthArr,
  ...rest
}) => {
  const symbol = getlatexSymbol(symb);
  console.log('symhols');
  // console.log(symbol);
  const elRef = useRef<SVGTSpanElement>(null);

  //TODO: change the position of things with respect to fontSize (if you don't whant to scale things)

  const [{ x, y, height, width }, set] = useState({
    x: null,
    y: null,
    height: null,
    width: null
  });

  useEffect(() => {
    // console.log(
    //   window.getComputedStyle(elRef.current, null).getPropertyValue('font-size')
    // );
    // console.log(
    //   symbol,
    //   elRef.current.getBBox().width,
    //   elRef.current.getBBox().x
    // );
    widthArr.push({ char: symbol, width: elRef.current.getBBox().height });
    set(() => elRef.current.getBBox());
  }, [dx, dy]);

  return (
    <>
      <tspan dx={dx} dy={dy} className={className} {...rest} ref={elRef}>
        {symbol}
      </tspan>

      {/* {React.cloneElement(children, { ...children.props })} */}
    </>
  );
};

export default Symb;

const TestEl: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <circle cx={x} cy={y} r={20} fill='black' />;
};
