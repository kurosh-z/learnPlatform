export type SymbolObject = {
  [key: string]: string;
};
// TODO: change it to a singleton pattern?
export const symbolObject: SymbolObject = {
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

export const defineSymbols: (newSymbols: SymbolObject) => void = newSymbols => {
  Object.assign(symbolObject, newSymbols);
};

export const symbolBank: string[] = [];
for (const symb in symbolObject) {
  symbolBank.push(symbolObject[symb]);
}

export var symbolBankString: string = '';
for (const str of symbolBank) {
  symbolBankString += str;
}
