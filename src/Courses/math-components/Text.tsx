import React from 'react';
import { css as emoCss } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../../theme/types';

const symbols = {
  '\\Alpha': 'Α',
  '\\alpha': 'α',
  '\\Beta': 'Β',
  '\\beta': 'β'
};

type Text = {
  children?: string;
  math?: string;
};
const Text: React.FC<Text> = ({ children, math }) => {
  const theme = useTheme<Theme>();

  const mathdefault = emoCss({
    fontFamily: 'KaTeX_Math',
    // fontStyle: 'italic',
    fontSize: '2rem'
  });
  //   console.log(children);
  return (
    <text css={mathdefault} x={100} y={100}>
      {symbols[math]}
    </text>
  );
};

export default Text;
