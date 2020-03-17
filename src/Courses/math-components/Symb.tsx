import React, { SVGProps } from 'react';

const symbols = {
  '\\Alpha': 'Α',
  '\\alpha': 'α',
  '\\Beta': 'Β',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\epsilon': 'ϵ',
  '\\zeta': 'ζ',
  '\\Zeta': 'Z',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\Theta': 'Θ',
  '\\iota': 'ι',
  '\\Iota': 'I',
  '\\kappa': 'κ',
  '\\Kappa': 'K',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\omicron': 'ο',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\rho': 'ρ',
  '\\siqma': 'σ',
  '\\Siqma': 'Σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\Upsilon': 'Υ',
  '\\phi': 'ϕ',
  '\\Phi': 'Φ',
  '\\chi': 'χ',
  '\\Xi': 'Ξ',
  '\\xi': 'ξ',
  '\\psi': 'ψ',
  '\\Psi': 'Ψ',
  '\\omega': 'ω',
  '\\Omega': 'Omega'
};
type SymbProps = {
  symb?: string;
  symbtype?: 'number' | 'letter' | 'operator';
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  className: string;
};
const Symb: React.FC<SymbProps> = ({
  symb,
  dx,
  dy,
  symbtype,
  className,
  children,
  ...rest
}) => {
  const symbol = symb in symbols ? symbols[symb] : symb;

  return (
    <tspan dx={dx} dy={dy} className={className} {...rest}>
      {symbol}
    </tspan>
  );
};

export default Symb;
