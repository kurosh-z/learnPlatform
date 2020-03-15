import React, { useMemo } from 'react';
import { PI, ORIGIN } from '../constants';
import { ReactThreeFiber, Dom } from 'react-three-fiber';
import { Vector3 } from 'three';
import { scaleLinear } from 'd3-scale';
import { compTickValues } from '../compute';
import AxesTick from './AxesTick';

const HWIDTH = 0.2; // head width
const HDIAM = 0.1; // head diameter

const calheadPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [len - HWIDTH / 2, 0, 0],
    yAxes: [0, len - HWIDTH / 2, 0],
    zAxes: [0, 0, len - HWIDTH / 2]
  }[axes]);

const calheadRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [0, 0, (-1 * Math.PI) / 2],
    yAxes: [0, 0, 0],
    zAxes: [Math.PI / 2, 0, 0]
  }[axes]);

const calshaftPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [len / 2 - HWIDTH / 2, 0, 0],
    yAxes: [0, len - HWIDTH / 2 / 2, 0],
    zAxes: [0, 0, len / 2 - HWIDTH / 2]
  }[axes]);

const calshaftRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [0, 0, PI / 2],
    yAxes: [0, 0, 0],
    zAxes: [PI / 2, 0, 0]
  }[axes]);

interface AxesProps {
  axes: 'xAxes' | 'yAxes' | 'zAxes';
  length?: number;
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  label?: string;
  origin?: Vector3;
  rotation?: number[];
}

const Axes: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  AxesProps
> = React.forwardRef(
  (
    {
      axes,
      length = 1,
      thickness = 0.02,
      color = 'black',
      showlabel = true,
      label,
      origin = ORIGIN,
      rotation
    },
    ref
  ) => {
    const {
      headposition,
      headrotation,
      shaftposition,
      shaftrotation
    } = useMemo(
      () => ({
        headposition: calheadPosition(axes, length),
        headrotation: calheadRotation(axes, length),
        shaftposition: calshaftPosition(axes, length),
        shaftrotation: calshaftRotation(axes, length)
      }),
      [axes, length]
    );

    const dataMin = -100;
    const dataMax = 100;
    const axScale = scaleLinear()
      .domain([dataMin, dataMax])
      .rangeRound([-length, length]);

    const tickValues = useMemo(
      () => compTickValues(axScale(dataMin), axScale(dataMax), 0.2, 0),
      []
    );

    return (
      <group ref={ref} position={origin} rotation={rotation}>
        // shaft:
        <mesh position={shaftposition} rotation={shaftrotation}>
          <cylinderBufferGeometry
            attach='geometry'
            args={[thickness, thickness, length - HWIDTH, 32]}
          />
          <meshBasicMaterial attach='material' color={color} />
        </mesh>
        // head:
        <mesh position={headposition} rotation={headrotation}>
          <cylinderBufferGeometry
            attach='geometry'
            args={[0, HDIAM, HWIDTH, 25, 1]}
          />
          <meshBasicMaterial attach='material' color={color} />
        </mesh>
        // axes label:
        {showlabel && (
          <Dom position={headposition}>
            <div className='label' style={{ color: color.toString() }}>
              {label ? label : axes.charAt(0)}
            </div>
          </Dom>
        )}
        <AxesTick axes={'zAxes'} color={'black'} tickValues={tickValues} />
      </group>
    );
  }
);

export default Axes;
