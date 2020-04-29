import React, { ReactElement } from 'react';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';

interface HeaderMembers {
  Objective: typeof Objective;
}

const ContentHeader: React.FC<{ title: string; title_number: string }> &
  HeaderMembers = ({ title, title_number, children }) => {
  const theme = useTheme<Theme>();
  const content__header = emoCSS({
    '*': {
      fontSize: theme.typography.h4.fontSize,
      fontWeight: theme.typography.fontWeights.bold,
      display: 'inline-block',
    },
    '.title__text': { marginLeft: '1rem' },
  });
  const content__objectives = emoCSS({
    borderLeft: `3px solid ${theme.palette.orange.base}`,
    marginLeft: '.5rem',
    '&::after': {
      display: 'block',
      content: '" "',
      width: '25px',
      borderBottom: `3px solid ${theme.palette.orange.base}`,
    },

    '.objectives': {
      fontSize: theme.typography.h5.fontSize,
      fontWeight: theme.typography.fontWeights.bold,
      marginLeft: '.5rem',
    },

    '.objectives__list': {
      counterReset: 'objective-counter',
      li: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',

        flexWrap: 'wrap',

        marginLeft: '1rem',
        fontSize: theme.typography.h6.fontSize,
        counterIncrement: 'objective-counter',
        '&::before': {
          content: 'counter(objective-counter)". "',
        },
      },
    },
  });

  return (
    <>
      <header css={content__header} className='content__header'>
        <h1 className='header__title'>
          <p className='title__number'>{title_number}</p>
          <p className='title__text'>{title}</p>
        </h1>
      </header>
      <article css={content__objectives} className='content__objectives'>
        <h5>
          <span className='objectives'>Objectives</span>
        </h5>
        <ol className='objectives__list'>
          {React.Children.map(
            children,
            (child: ReactElement<typeof Objective>) => {
              return (
                <>
                  {child.type.displayName === 'Objective' &&
                    React.cloneElement(child, { ...child.props })}
                </>
              );
            }
          )}
        </ol>
      </article>
    </>
  );
};

const Objective: React.FC<{}> = ({ children }) => {
  return <li>{children}</li>;
};
Objective.displayName = 'Objective';

ContentHeader.Objective = Objective;
export default ContentHeader;
