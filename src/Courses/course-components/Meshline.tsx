import React, { useMemo } from 'react';
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { Vector3, Vec2, Vector2 } from 'three';
import { ReactThreeFiber } from 'react-three-fiber';

interface MeshlineProps {
  points: Vector3[];
  color?: ReactThreeFiber.Color;
  resolution: Vector2 | number[];
  lineWidth?: number;
  near?: number;
  far?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  rest?: any;
}

const Meshline: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  MeshlineProps
> = React.forwardRef(
  (
    {
      points,
      color = 'blue',
      resolution,
      lineWidth = 0.009,
      near,
      far,
      position,
      rotation,
      rest
    },
    ref
  ) => {
    // use MeshLine to create a geometry and material
    const { geometry, material } = useMemo(() => {
      const linegeo = new THREE.Geometry().setFromPoints(points);
      const line = new MeshLine();
      line.setGeometry(linegeo);
      const material = new MeshLineMaterial({
        useMap: false,
        color: new THREE.Color(color),
        resolution:
          resolution instanceof Vector2
            ? resolution
            : new THREE.Vector2(resolution[0], resolution[1]),
        sizeAttenuation: 1,
        lineWidth: lineWidth,
        near: -100,
        far: 100,
        // dashArray: 0.1,
        // dashOffset: 0,
        // dashRatio: 1,
        transparent: true,
        depthWrite: false
      });

      return { geometry: line.geometry, material: material };
    }, []);

    return (
      <mesh
        geometry={geometry}
        material={material}
        rotaton={rotation}
        position={position}
        ref={ref}
        {...rest}></mesh>
    );
  }
);

export default Meshline;
