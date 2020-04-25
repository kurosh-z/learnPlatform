import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { ReactThreeFiber, useThree, extend } from 'react-three-fiber';
import { Dom } from './Dom';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import { format as d3format } from 'd3-format';
import Vector from './Vector';
import { ORIGIN, I, J, K, PI } from './constants';

// axes tick component
const calTicksRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes') =>
  ({
    xAxes: [0, 0, 0],
    yAxes: [0, 0, PI / 2],
    zAxes: [0, 0, PI / 2],
  }[axes]);

const calTickPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', val: number) =>
  ({
    xAxes: [val, 0, 0],
    yAxes: [0, val, 0],
    zAxes: [0, 0, val],
  }[axes]);

const calAxesVector = (axes: 'xAxes' | 'yAxes' | 'zAxes', val: number) =>
  ({
    xAxes: [val, 0, 0],
    yAxes: [0, val, 0],
    zAxes: [0, 0, val],
  }[axes]);

const defaultcolors = {
  xAxes: 'rgb(255, 127, 14)', // orange
  yAxes: 'rgb(23, 227, 57)', //green
  zAxes: 'rgb(0,128,255)', // blue
};

interface TickProps {
  axes: 'xAxes' | 'yAxes' | 'zAxes';
  thickness?: number;
  length?: number;
  color?: ReactThreeFiber.Color;
  tickValues: number[];
  axesLength?: number;
  format: (
    n:
      | number
      | {
          valueOf(): number;
        }
  ) => string;
  scale: ScaleLinear<number, number>; // TODO: for now its okay, but probably you should make it more general than jsut numbers!
}
// TODO: I used cylincergeometry for ticks becuase fat lines are pretty hacky in threejs and Meshline disapears when it gets zoomed in!

const AxesTick: React.FC<TickProps> = ({
  axes,
  thickness = 0.002,
  length = 0.15,
  tickValues,
  color = 'black',
  scale,
  format,
}) => {
  const tickrotation = useMemo(() => calTicksRotation(axes), [axes]);

  const ticks = tickValues.map((val, idx) => {
    return (
      <group key={idx}>
        <mesh
          position={calTickPosition(axes, scale(val))}
          rotation={tickrotation}>
          <cylinderBufferGeometry
            attach='geometry'
            args={[thickness, thickness, length, 20]}
          />
          <meshBasicMaterial attach='material' color={color} />
        </mesh>
        {/* <Dom position={calTickPosition(axes, scale(val))}>
          <div className='tick'>{format(val)}</div>
        </Dom> */}
      </group>
    );
  });

  return <group>{ticks}</group>;
};

// Axes component:

interface AxesProps {
  axes: 'xAxes' | 'yAxes' | 'zAxes';
  length?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  origin?: THREE.Vector3;
  scale: ScaleLinear<number, number>;
  tickValues: number[];
  format: (
    n:
      | number
      | {
          valueOf(): number;
        }
  ) => string;
}

const directionVectors: (axes: 'xAxes' | 'yAxes' | 'zAxes') => THREE.Vector3 = (
  axes
) =>
  ({
    xAxes: I,
    yAxes: J,
    zAxes: K,
  }[axes]);

const Axes: React.FC<AxesProps> = ({
  axes,
  color,
  origin = ORIGIN,
  scale,
  tickValues,
  format,
}) => {
  return (
    <group>
      <Vector
        vector={calAxesVector(axes, scale(tickValues.slice(-1)[0]))}
        color={defaultcolors[axes]}
        origin={origin}
      />
      <AxesTick
        tickValues={tickValues.slice(
          tickValues.length / 2 + 1,
          tickValues.length - 1
        )}
        axes={axes}
        scale={scale}
        format={format}
      />
      <Dom position={calAxesVector(axes, scale(tickValues.slice(-1)[0]))}>
        <div>{axes}</div>
      </Dom>
    </group>
  );
};

export default Axes;
