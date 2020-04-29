import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useSpring, config, animated as a } from 'react-spring';
import { css as emoCSS } from '@emotion/core';
import { useTheme } from 'emotion-theming';
import { Theme } from '../theme/types';
import SidePanel from '../shared/SidePanel';
import HeaderPanel from '../shared/HeaderPanel';
import MastHead from './MastHead';
import Card from './Card';
import NavPanel from '../shared/NavPanel';
import { alpha } from '../theme/colors';
// import { useThemeToggler } from './theme/themeContext';

interface AnimPorps {
  offset: number;
}

// initial offset of videotriger element to top of the windwo , we use this to interpolate opacity of video
var initialOffset: number = 480;

// make animated version of comonents useSpring on it.
const AnimMastHead = a(MastHead);
const AnimHeaderPanel = a(HeaderPanel);

// Homepage component:
const HomePage: React.FC<{}> = () => {
  // reference to the components
  const videobgtriggerEl = useRef<HTMLDivElement>(null);

  // getting theme from emotion
  const theme = useTheme<Theme>();

  // use offset of videotrigger element to top of the window to animate opacity of the video
  const [{ offset }, set] = useSpring<AnimPorps>(() => ({
    offset: initialOffset,
    config: config.molasses,
  }));
  // TODO: is there any better way to set the initialOffset after DOM is loaded?
  useEffect(() => {
    setTimeout(function () {
      if (!videobgtriggerEl.current) return;
      let rect = videobgtriggerEl.current.getBoundingClientRect();
      initialOffset = rect.top;
      // console.log('init', initialOffset);
    }, 1200);
  });
  //  interpolating video opacity
  const opMastHead = offset.interpolate((off) => {
    if (typeof off !== 'number') return;
    // as offset: initialoffset -> 0 ==> opacity goes: 1 -> 0
    if (off < -100) return 0;
    return off >= 0 ? 1 + (off - initialOffset) / (initialOffset - 80) : 0;
  });

  // interpolate navbar opacity
  const opHeaderPanel = offset.interpolate((off) => {
    if (typeof off !== 'number') return;
    // as offset: initialoffset -> 20 ==> opacity goes: 1 -> 0
    return off >= 100 ? (-off + initialOffset) / 80 : 1;
  });

  /* use toggle instead of interpolating offset: 
     by scrolling toggle turns on --> opacit: 1
  */

  const [navOpon, navOptoggle] = useState<Boolean>(false);
  const [{ navBackColor }, setNavBackColor] = useSpring<{
    navBackColor: string;
  }>(() => ({
    navBackColor: alpha(theme.palette.aubergine.dark, 1),
    config: config.stiff,
  }));
  setNavBackColor({
    navBackColor: navOpon
      ? alpha(theme.palette.aubergine.dark, 1)
      : alpha(theme.palette.aubergine.dark, 0),
  });

  // scroll handler function
  const onScrollHandler = useCallback(() => {
    if (!videobgtriggerEl.current) return;
    window.pageYOffset > 0 ? navOptoggle(() => true) : navOptoggle(() => false);

    let rect = videobgtriggerEl.current.getBoundingClientRect();
    let offset = rect.top; //   window.pageYOffset - rect.top; here we actually scrolling on window itself!
    set({ offset: offset });
  }, []);

  // attach event listener to html because with fullscreen video scroll event is not working on page container or even body!!!
  useEffect(() => {
    document.body.style.cssText = `background-color: ${theme.background.primary}`;
    document.addEventListener('scroll', onScrollHandler);
    return () => {
      document.removeEventListener('scroll', onScrollHandler);
    };
  });

  // toggling the sidepanel:
  const [sidepanelOn, sidepaneltoggle] = useState<boolean>(false);
  // callback function to close the sidepanel
  const burgerCB = () => sidepaneltoggle((curr) => !curr);

  // styling:
  const homepageCss = emoCSS({
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'scroll',
    // backgroundColor: theme.palette.aubergine.dark
  });

  return (
    <div className='homepage' css={homepageCss}>
      {/* <SidePanel open={sidepanelOn} />
      <AnimHeaderPanel opacity={navOp} burgerCB={burgerCB} /> */}
      <NavPanel
        background_color={navBackColor}
        textColor_closed={theme.palette.white.base}
        textColor_opened={theme.palette.white.base}
        navCB={burgerCB}
      />
      <section className='mainpage'>
        <AnimMastHead
          videoOpacity={opMastHead}
          overlayColor={sidepanelOn ? theme.palette.aubergine.lightest : null}
        />
        <div className='videobgtrigger' ref={videobgtriggerEl}></div>
        <Card
          title1='Found the Future'
          text=' Entrepreneur First is the world’s leading talent investor. We
                  invest time and money in the world’s most talented and
                  ambitious individuals, helping them to find a co-founder,
                  develop an idea, and start a company. So far, we’ve helped
                  2,000+ people create 300+ companies, worth a combined $2bn
                  '
          textPosition='center'></Card>
        <Card
          title1='Imagination'
          title2='is more important than knowledge'
          text='   “For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution” ―Albert Einstein'
          imgsrc={
            'https://drive.google.com/uc?id=1Y2iLsdxh9xdC4ioEIoSnjVyQOp4eqq1L'
          }></Card>
        <Card
          title1=' “change'
          title2='is the end result'
          text='  of all true learning.” ―Leo Buscaglia
          This last one is mine! You’re always going to encounter a learning curve when 
          you learn something new — it’s one of the requirements to actually learning!
           The frustrations and struggles that come with it are also a requirement.
          The learning curve doesn’t mean that you should quit — as long as you
           face the challenges and work through those frustrations, you will make progress.'
          imgsrc='https://drive.google.com/uc?id=1IryuCDSzc03VVVqmUubwi9gCD31duCBE'
          textPosition='end'></Card>
      </section>
    </div>
  );
};

export default HomePage;
