import React, { useMemo } from 'react';
import { ReactThreeFiber, Dom } from 'react-three-fiber';
import { PI } from '../constants';
import { scaleLinear } from 'd3-scale';

const calTicksRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes') =>
  ({
    xAxes: [0, 0, PI / 2],
    yAxes: [0, 0, 0],
    zAxes: [0, 0, PI / 2]
  }[axes]);

interface TickProps {
  axes: 'xAxes' | 'yAxes' | 'zAxes';
  thickness?: number;
  length?: number;
  color?: ReactThreeFiber.Color;
  tickValues: number[];
  axesLength?: number;
}

const AxesTick: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  TickProps
> = React.forwardRef(
  (
    {
      thickness = 0.005,
      color,
      length = 0.3,
      axesLength = 3,
      axes,
      tickValues
    },
    ref
  ) => {
    const tickRotation = useMemo(() => calTicksRotation(axes), [axes]);
    const min = -100;
    const max = 100;
    const scale = scaleLinear();
    //   .domain([min, max])
    //   .rangeRound([-axesLength, axesLength]);
    // console.log('max scaled:', scale(max));
    // tickValues = range(scale(min), scale(max), 0.2, false, false);
    // console.log(tickValues);

    const ticks = tickValues.map((val, index) => {
      return (
        <group key={index}>
          <mesh position={[0, 0, val]} rotation={tickRotation}>
            <cylinderBufferGeometry
              attach='geometry'
              args={[thickness, thickness, length, 20]}
            />
            <meshBasicMaterial attach='material' color={color} />
          </mesh>
          <Dom position={[0, 0, val]}>
            <div>{val}</div>
          </Dom>
        </group>
      );
    });
    return <group>{ticks}</group>;
  }
);

export default AxesTick;
