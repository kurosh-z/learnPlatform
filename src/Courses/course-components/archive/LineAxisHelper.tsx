import React, { useMemo } from 'react';
import * as THREE from 'three';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { ReactThreeFiber, extend, Dom } from 'react-three-fiber';
// import Meshline from '../coursComps/Meshline';
import Vector from './VectorOLD';
import Axes from './AxesOLD';

const PI = Math.PI;
const ORIGIN = new THREE.Vector3(0, 0, 0);

extend({ LineMaterial, LineGeometry, Line2 });

// declare global {
//   namespace JSX {
//     interface IntrinsicElements {
//       line2: ReactThreeFiber.Object3DNode<Line2, typeof Line2>;
//       lineMaterial: ReactThreeFiber.Object3DNode<
//         LineMaterial,
//         typeof LineMaterial
//       >;
//       lineGeometry: ReactThreeFiber.Object3DNode<
//         LineGeometry,
//         typeof LineGeometry
//       >;
//     }
//   }
// }
const shaftArr = len => ({
  xAxis: [0, 0, 0, len, 0, 0],
  yAxis: [0, 0, 0, 0, len, 0],
  zAxis: [0, 0, 0, 0, 0, len]
});
const calshaftGeometry: (
  axis: 'xAxis' | 'yAxis' | 'zAxis',
  len: number
) => LineGeometry = (axis, len) =>
  new LineGeometry().setPositions(shaftArr(len)[axis]);

const calheadPoints = (axis: 'xAxis' | 'yAxis' | 'zAxis', len: number) =>
  ({
    xAxis: [ORIGIN, new THREE.Vector3(len, 0, 0)],
    yAxis: [ORIGIN, new THREE.Vector3(0, len, 0)],
    zAxis: [ORIGIN, new THREE.Vector3(0, 0, len)]
  }[axis]);

const calheadPosition = (axis: 'xAxis' | 'yAxis' | 'zAxis', len: number) =>
  ({
    xAxis: [len, 0, 0],
    yAxis: [0, len, 0],
    zAxis: [0, 0, len]
  }[axis]);

const calheadRotation = (axis: 'xAxis' | 'yAxis' | 'zAxis', len: number) =>
  ({
    xAxis: [0, 0, (-1 * Math.PI) / 2],
    yAxis: [0, 0, 0],
    zAxis: [Math.PI / 2, 0, 0]
  }[axis]);

const calshaftPosition = (axis: 'xAxis' | 'yAxis' | 'zAxis', len: number) =>
  ({
    xAxis: [len / 2, 0, 0],
    yAxis: [0, len / 2, 0],
    zAxis: [0, 0, len / 2]
  }[axis]);

const calshaftRotation = (axis: 'xAxis' | 'yAxis' | 'zAxis', len: number) =>
  ({
    xAxis: [0, 0, PI / 2],
    yAxis: [0, 0, 0],
    zAxis: [PI / 2, 0, 0]
  }[axis]);
// arrow :
interface AxisarrowProps {
  axis: 'xAxis' | 'yAxis' | 'zAxis';
  length: number;
  color: ReactThreeFiber.Color;
  shaftwidth: number;
  shaftType?: 'line2' | 'meshline' | 'cylinder'; // experimenting with meshline and line2 ===> cylinder gives the best result!
}
const Axisarrow: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  AxisarrowProps
> = React.forwardRef(
  ({ axis, length, color, shaftwidth, shaftType = 'line2' }, ref) => {
    // const { size, camera } = useThree();

    const { shaftgeometry, points } = useMemo<{
      shaftgeometry: LineGeometry | null;
      points: THREE.Vector3[] | null;
    }>(() => {
      let ret;
      shaftType === 'line2'
        ? (ret = { shaftgeometry: calshaftGeometry(axis, length) })
        : (ret = { points: calheadPoints(axis, length) });
      return ret;
    }, [axis, length, shaftType]);

    const headposition = calheadPosition(axis, length);
    const headrotation = calheadRotation(axis, length);
    const shaftposition = calshaftPosition(axis, length);
    const shaftrotation = calshaftRotation(axis, length);
    // const resolution = [size.width, size.height];

    return (
      <group ref={ref}>
        {/* {shaftType === 'meshline' && (
          <Meshline
            points={points}
            color={color}
            resolution={resolution}
            near={camera.near}
            far={camera.far}
          />
        )} */}
        {shaftType === 'line2' && (
          <line2 geometry={shaftgeometry}>
            <lineMaterial
              attach='material'
              linewidth={1}
              // @ts-ignore
              color={'blue'}
              // @ts-ignore
              resolution={[900, 900]}
            />
          </line2>
        )}
        {shaftType === 'cylinder' && (
          <mesh position={shaftposition} rotation={shaftrotation}>
            <cylinderBufferGeometry
              attach='geometry'
              args={[0.02, 0.02, length, 32]}
            />
            <meshBasicMaterial attach='material' color={color} />
          </mesh>
        )}
        <mesh position={headposition} rotation={headrotation}>
          <cylinderBufferGeometry
            attach='geometry'
            args={[0, 0.1, 0.2, 25, 1]}
          />
          <meshBasicMaterial attach='material' color={color} />
        </mesh>
        <Dom position={headposition}>
          <div className='label' style={{ color: color.toString() }}>
            {axis.charAt(0)}
          </div>
        </Dom>
      </group>
    );
  }
);

interface LineAxisHelperProps {
  length?: number;
  xclolor?: ReactThreeFiber.Color;
  ycolor?: ReactThreeFiber.Color;
  zcolor?: ReactThreeFiber.Color;
  linewidth?: number;
}
const LineAxisHelper: React.FC<LineAxisHelperProps> = ({
  length = 1,
  xclolor = 'rgb(255, 127, 14)',
  ycolor = 'rgb(121, 201, 99)',
  zcolor = 'rgb(25, 144, 227)',
  linewidth = 4
}) => {
  return (
    <group>
      <Axisarrow
        length={length}
        axis='yAxis'
        color={xclolor}
        shaftwidth={linewidth}
      />
      {/* <Axisarrow
        length={length}
        axis='yAxis'
        color={ycolor}
        shaftwidth={linewidth}
      /> */}
      {/* <Axes length={3} axes='yAxes' color={ycolor} thickness={0.02} /> */}
      {/* <Axes length={3} axes='zAxes' color={zcolor} thickness={0.02} /> */}
      {/* <Vector vector={[1, 1, 0]} /> */}
    </group>
  );
};

export default LineAxisHelper;
