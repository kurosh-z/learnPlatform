import React, { useMemo } from 'react';
// import { useSpring, animated as a } from 'react-spring';
import { css as emoCSS, SerializedStyles } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';

// TODO: the cneter version in lg screens need to be positoned differently (maybe align it with the picture below?)
// typeds :
const textWrapperWidth = {
  sm: '400px',
  md: '520px',
  lg: '600px'
};
type textPosition = 'start' | 'end' | 'center';

interface CardProps {
  title1: string;
  title2?: string;
  text: string;
  textPosition?: textPosition;
  textWidth?: 'sm' | 'md' | 'lg'; // the maximal width that the width of text can get
  imgsrc?: string;
}

// computing the styles:

const cardStyles: (theme: Theme) => SerializedStyles = theme => {
  const card = emoCSS({
    color: theme.palette.white.light,
    fontFamily: 'open-sans,Helvetica,Arial,sans-serif',
    marginBottom: '25px',
    width: '100vw'
  });

  return card;
};

const cardWrapper: (
  theme: Theme,
  textPosition: textPosition
) => SerializedStyles = (theme, textPosition) => {
  let card__wrapper = emoCSS({
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90vw',
    height: 'auto',
    margin: '.7em auto .7em',
    paddingTop: '2em',
    [theme.mediaQueries.lg]: {
      flexDirection: textPosition === 'start' ? 'row' : 'row-reverse'
    }
  });

  return card__wrapper;
};

const cardText: (
  theme: Theme,
  textPosition: textPosition,
  textWidth: 'sm' | 'md' | 'lg'
) => SerializedStyles = (theme, textPosition, textWidth) => {
  let marginLeftLg, marginRightLg;
  if (textPosition === 'center') {
    marginLeftLg = '50%';
    marginRightLg = '';
  } else {
    marginRightLg = textPosition === 'start' ? '4em' : '.5em';
    marginLeftLg = textPosition === 'end' ? '4em' : '.5em';
  }

  let maxTextWidthLg;
  if (textWidth === 'sm') maxTextWidthLg = 'md';
  if (textWidth === 'md') maxTextWidthLg = 'lg';
  if (textWidth === 'lg') maxTextWidthLg = 'lg';

  const card__text = emoCSS({
    marginBottom: '.7em',

    padding: '.5em',
    [theme.mediaQueries.md]: {
      maxWidth: textWrapperWidth[textWidth], // '480px',
      marginRight: textPosition === 'start' ? '3em' : '',
      marginLeft: textPosition === 'end' ? '3em' : ''
      // margin: '1.25em auto .5em auto'
    },
    [theme.mediaQueries.lg]: {
      marginRight: marginRightLg,
      marginLeft: marginLeftLg,
      maxWidth: textWrapperWidth[maxTextWidthLg]
    }
  });

  return card__text;
};

const textHeader: (theme: Theme) => SerializedStyles = theme => {
  const text__header = emoCSS({
    fontSize: theme.typography.fontSizes[1],
    fontWeight: theme.typography.fontWeights.bold,
    lineHeight: theme.typography.lineHeights.xl,
    letterSpacing: theme.typography.h3.letterSpacing,
    textTransform: 'uppercase',
    [theme.mediaQueries.lg]: {
      fontSize: theme.typography.fontSizes[2]
    },
    [theme.mediaQueries.xl]: {
      fontSize: theme.typography.fontSizes[3]
    }
  });

  return text__header;
};

const headerLine: (theme: Theme) => SerializedStyles = theme => {
  const header__line = emoCSS({
    '::before': {
      content: '" "',
      height: '3px',
      width: '2.25em',
      marginRight: '.5em',
      verticalAalign: 'middle',
      backgroundColor: '#f7f5f5',
      display: 'inline-block'
    }
  });

  return header__line;
};

const textParagraph: (theme: Theme) => SerializedStyles = theme => {
  const text__paragraph = emoCSS({
    fontSize: theme.typography.fontSizes[1],
    fontWeight: theme.typography.fontWeights['medium'],
    letterSpacing: theme.typography.h3.letterSpacing,
    marginTop: '1em',
    [theme.mediaQueries.lg]: {
      fontSize: theme.typography.fontSizes[2]
    },
    [theme.mediaQueries.xl]: {
      fontSize: theme.typography.fontSizes[3]
    }
  });

  return text__paragraph;
};

const cardImg: (theme: Theme) => SerializedStyles = theme => {
  let card__img = emoCSS({
    width: '100%',
    height: 'auto',
    padding: '.5em', // just to prevent margin collapses
    minWidth: '50%',
    [theme.mediaQueries.md]: {
      maxWidth: '712px'
    },
    [theme.mediaQueries.lg]: {
      maxWidth: '60%'
    },
    [theme.mediaQueries.lg]: {
      maxWidth: '46%'
    }
  });

  return card__img;
};

const Card: React.FC<CardProps> = ({
  title1,
  title2,
  text,
  textWidth = 'sm',
  textPosition = 'start',
  imgsrc
}) => {
  const theme = useTheme<Theme>();

  // compute styles:
  const card = cardStyles(theme);
  const card__wrapper = useMemo<SerializedStyles>(
    () => cardWrapper(theme, textPosition),
    [theme]
  );

  const card__text = useMemo<SerializedStyles>(
    () => cardText(theme, textPosition, textWidth),
    [theme, textPosition, textWidth]
  );
  const text__header = useMemo<SerializedStyles>(() => textHeader(theme), [
    theme
  ]);
  const header__line = useMemo<SerializedStyles>(() => headerLine(theme), [
    theme
  ]);
  const text__paragraph = useMemo<SerializedStyles>(
    () => textParagraph(theme),
    [theme]
  );
  const card__img = useMemo<SerializedStyles>(() => cardImg(theme), [theme]);

  return (
    <div className='card' css={card}>
      <figure css={card__wrapper}>
        <div css={card__text}>
          <h3 css={text__header}>
            {title1 && title2 && title1}
            <div css={header__line}>{title2 ? title2 : title1}</div>
          </h3>
          <p css={text__paragraph}>{text}</p>
        </div>
        {imgsrc && <img css={card__img} src={imgsrc}></img>}
      </figure>
    </div>
  );
};

export default Card;

// const computeStyles: (theme: Theme) => SerializedStyles = theme => {
//   // all the styles with different variations. to apply specefic styles add approprate classes to the component
//   const cardCss = emoCSS({
//     color: theme.palette.white.light,
//     fontFamily: 'open-sans,Helvetica,Arial,sans-serif',
//     marginBottom: '20px',
//     width: '100vw',
//     '.card__wrapper': {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       width: '80%',
//       height: 'auto',
//       margin: '.7em auto .7em'
//     },

//     '.text__header': {
//       fontSize: theme.typography.fontSizes[2],
//       fontWeight: theme.typography.fontWeights.bold,
//       lineHeight: theme.typography.lineHeights.xl,
//       letterSpacing: theme.typography.h3.letterSpacing,
//       textTransform: 'uppercase'
//     },
//     '.header__line--default::before': {
//       content: '" "',
//       height: '3px',
//       width: '2.25em',
//       marginRight: '.5em',
//       verticalAalign: 'middle',
//       backgroundColor: '#f7f5f5',
//       display: 'inline-block'
//     },
//     '[class*= "card__text"] ': {
//       marginBottom: '7%',
//       backgroundColor: 'red'
//     },
//     '.card__text--center': { marginLeft: '50%' },
//     '.text__paragraph': {
//       fontSize: theme.typography.fontSizes[2],
//       fontWeight: theme.typography.fontWeights['medium'],
//       letterSpacing: theme.typography.h3.letterSpacing,
//       marginTop: '1em'
//     },

//     '.card__img': {
//       width: '100%',
//       height: 'auto'
//     },
//     // mediaqueries: bp: 700px:
//     [theme.mediaQueries.md]: {
//       '.card_text': {
//         maxWidth: '480px',
//         margin: '1.25em auto 0.25em auto'
//       },
//       '.text__paragraph  , .text__header': {
//         fontSize: theme.typography.fontSizes[3]
//       },
//       '.card__img': {
//         maxWidth: '712px'
//       }
//     },
//     // media query bp: 992
//     [theme.mediaQueries.lg]: {
//       '.card__wrapper': {
//         flexDirection: 'row',
//         maxWidth: '90vw'
//       },

//       '.card__text': {
//         maxWidth: textWrapperWidth['sm'],
//         marginLeft: '.7%',
//         marginRight: '8%'
//       },
//       '.card__text--center': {
//         marginLeft: '50%'
//       },
//       '.card__img': {
//         // minWidth: '500px',
//         maxWidth: '70%' // use percentage instead of fixed width
//       }
//     }
//   });
//   return cardCss;
// };
