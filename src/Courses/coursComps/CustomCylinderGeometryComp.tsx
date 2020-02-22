import React, { useMemo } from 'react';
import { PI, ORIGIN, I, J, K } from './constants';
import { ReactThreeFiber } from 'react-three-fiber';
import * as THREE from 'three';
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';
import { Parameter } from './CustomCylinderGeometry';

interface CylinderBufferProps extends Parameter {
  dynamicDrawing?: boolean;
  withEdge?: boolean;
}

// Cylinder BufferGeometry react component
export const CustomCylinderBufferGeometryComp: React.FC<CylinderBufferProps> = ({
  radiusTop = 1,
  radiusBottom = 1,
  height = 2,
  radialSegments = 8,
  heightSegments = 1,
  openEnded = false,
  thetaStart = 0,
  thetaLength = 2 * Math.PI,
  withEdge = false
}) => {
  const { geometry, edges } = useMemo(() => {
    const geometry = new CustomCylinderBufferGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openEnded,
      thetaStart,
      thetaLength
    );
  }, []);
};
