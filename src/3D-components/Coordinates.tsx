import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { format as d3format } from 'd3-format';
import { scaleLinear } from 'd3-scale';
import { useTheme } from 'emotion-theming';
import Axes from './Axes';

const Coordinates = (props) => {
  const n = 10;
  const range = [-3, 3];
  const domain = [-10, 10];
  const { tickValues, scale, format } = useMemo(() => {
    const scale = scaleLinear().domain(domain).range(range);

    const format = d3format('.0f');
    const tickValues = scale.ticks(n);

    return { scale, tickValues, format };
  }, []);

  return (
    <>
      <Axes
        axes='zAxes'
        scale={scale}
        tickValues={tickValues}
        format={format}
      />
      <Axes
        axes='yAxes'
        scale={scale}
        tickValues={tickValues}
        format={format}
      />
      <Axes
        axes='xAxes'
        scale={scale}
        tickValues={tickValues}
        format={format}
      />
    </>
  );
};
export default Coordinates;
