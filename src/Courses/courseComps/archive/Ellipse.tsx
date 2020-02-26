import React, { useMemo } from 'react';
import { useThree, extend } from 'react-three-fiber';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import * as THREE from 'three';

extend({ LineMaterial, LineGeometry, Line2 });

const Ellipse = () => {
  const { size } = useThree();

  const ellipse = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      100,
      30,
      0,
      2 * Math.PI,
      false,
      0
    );
    console.log(curve.getPoints(190));
    const points = curve
      .getPoints(100)
      .reduce((acc, { x, y }) => [...acc, x, y, 0], []);

    return new LineGeometry().setPositions(points);
  }, []);

  return (
    <line2 geometry={ellipse}>
      <lineMaterial
        attach='material'
        color='blue'
        linewidth={3}
        resolution={[size.width, size.height]}
      />
    </line2>
  );
};

export default Ellipse;
