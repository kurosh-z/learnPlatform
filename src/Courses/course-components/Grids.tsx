import React, { useMemo, useEffect } from 'react';
import { scaleLinear, ScaleLinear } from 'd3-scale';
import * as THREE from 'three';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { ReactThreeFiber, useThree, extend } from 'react-three-fiber';

// extending the line2 to be used in react-fiber
extend({ LineMaterial, LineGeometry, Line2 });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      line2: ReactThreeFiber.Object3DNode<Line2, typeof Line2>;
      lineMaterial: ReactThreeFiber.Object3DNode<
        LineMaterial,
        typeof LineMaterial
      >;
      lineGeometry: ReactThreeFiber.Object3DNode<
        LineGeometry,
        typeof LineGeometry
      >;
    }
  }
}
// Grids
interface GridProps {
  type?: 'xy' | 'xz' | 'yz';
  length?: number;
  scale: ScaleLinear<number, number>;
}

const Grids: React.FC<GridProps> = ({ type = 'xy', length = 20, scale }) => {
  const { pointsArray1, pointsArray2 } = useMemo(() => {
    const pointsArray1 = [];
    const pointsArray2 = [];
    const halfLength = length / 2;
    const values = scale.ticks(10);
    if (type === 'xy') {
      values.forEach(val => {
        // prettier-ignore
        let linePoints1 = [scale(val), scale(halfLength), 0.001, scale(val), scale(-halfLength), 0.001];
        // prettier-ignore
        let linePoints2 = [scale(halfLength), scale(val), 0.001, scale(-halfLength), scale(val), 0.001];
        pointsArray1.push(linePoints1);
        pointsArray2.push(linePoints2);
      });
    }
    return { pointsArray1, pointsArray2 };
  }, [type, length]);
  const { size } = useThree();

  const gridlines1 = pointsArray1.map((linePoints, idx) => {
    return (
      <line2 key={idx}>
        <lineGeometry
          attach='geometry'
          onUpdate={(self: LineGeometry) => {
            self.setPositions(linePoints);
          }}
        />
        <lineMaterial
          attach='material'
          args={[
            {
              color: 0x000000,
              linewidth: 1,
              resolution: new THREE.Vector2(size.width, size.height)
            }
          ]}
        />
      </line2>
    );
  });
  const gridlines2 = pointsArray2.map((linePoints, idx) => {
    return (
      <line2 key={idx}>
        <lineGeometry
          attach='geometry'
          onUpdate={(self: LineGeometry) => {
            self.setPositions(linePoints);
          }}
        />
        <lineMaterial
          attach='material'
          args={[
            {
              color: 0x000000,
              linewidth: 0.5,
              resolution: new THREE.Vector2(size.width, size.height)
            }
          ]}
        />
      </line2>
    );
  });
  return (
    <group>
      {gridlines1}
      {gridlines2}
    </group>
  );
};

export default Grids;
