import { BreakPoints, MediaQueries } from './types';

export const breakpoints: BreakPoints = {
  sm: '550px',
  md: '700px',
  lg: '992px',
  xl: '1200px'
};

export const generateMediaQueries = (points: BreakPoints): MediaQueries => ({
  sm: `@media (min-width: ${points.sm})`,
  md: `@media (min-width: ${points.md})`,
  lg: `@media (min-width: ${points.lg})`,
  xl: `@media (min-width: ${points.xl})`,
  hover: '@media (hover: hover)'
});
