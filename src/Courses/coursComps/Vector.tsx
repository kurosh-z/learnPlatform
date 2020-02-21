import React, { useMemo } from 'react';
import { PI, ORIGIN, I, J, K } from './constants';
import { ReactThreeFiber, Dom } from 'react-three-fiber';
import * as THREE from 'three';
import { scaleLinear } from 'd3-scale';
import { compTickValues } from './compute';
import AxesTick from './AxesTick';
import { Object3D } from 'three';
import { CylinderBufferGeometryB } from './CylinderB';
import { TestBufferCylinder } from './TestCylinder';
import Plane from './Plane';
const HHEIGHT = 0.2; // head width
const HDIAM = 0.1; // head diameter

const calheadPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [len - HHEIGHT / 2, 0, 0],
    yAxes: [0, len - HHEIGHT / 2, 0],
    zAxes: [0, 0, len - HHEIGHT / 2]
  }[axes]);

const calheadRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [0, 0, (-1 * Math.PI) / 2],
    yAxes: [0, 0, 0],
    zAxes: [Math.PI / 2, 0, 0]
  }[axes]);

const calshaftPosition = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [len / 2 - HHEIGHT / 2, 0, 0],
    yAxes: [0, len - HHEIGHT / 2 / 2, 0],
    zAxes: [0, 0, len / 2 - HHEIGHT / 2]
  }[axes]);

const calshaftRotation = (axes: 'xAxes' | 'yAxes' | 'zAxes', len: number) =>
  ({
    xAxes: [0, 0, PI / 2],
    yAxes: [0, 0, 0],
    zAxes: [PI / 2, 0, 0]
  }[axes]);

interface VectorProps {
  vector: THREE.Vector3 | number[];
  thickness?: number;
  color?: ReactThreeFiber.Color;
  showlabel?: boolean;
  label?: string;
  origin?: THREE.Vector3;
  rotation?: number[];
  scaleMag?: number;
}

const Vector: React.RefForwardingComponent<
  JSX.IntrinsicElements,
  VectorProps
> = React.forwardRef(
  (
    {
      vector,
      thickness = 0.02,
      color = 'black',
      origin = ORIGIN,
      rotation,
      scaleMag = 1
    },
    ref
  ) => {
    // const {
    //   headposition,
    //   headrotation,
    //   shaftposition,
    //   shaftrotation
    // } = useMemo(
    //   () => ({
    //     headposition: calheadPosition(axes, length),
    //     headrotation: calheadRotation(axes, length),
    //     shaftposition: calshaftPosition(axes, length),
    //     shaftrotation: calshaftRotation(axes, length)
    //   }),
    //   [axes, length]
    // );

    const { shaft, head, mag, _vector, edges } = useMemo(() => {
      const _vector =
        vector instanceof THREE.Vector3
          ? vector
          : new THREE.Vector3(vector[0], vector[1], vector[2]);
      const mag = _vector.length();
      const dirVec = _vector.clone().normalize(); // not normalizing the vector cause false results!
      const angle = J.angleTo(dirVec); // finding the rotation angle between cylinder geometry(default along J-axes) and actual vector
      const rotAxes = J.cross(dirVec); // cross multiplication gives the axes of rotation between J and actual vector
      // first build the mesh and transfer it so that the cylinder begins at origin ( by defaul applying lenght cause cylinder grows from both side! )
      // height of the shaft is set to 1 unit, the actual size will be applied with scaleMag factor : to make sure that thte size of the shaft is always
      //        a little bit smaller that the actual size of the vector so that it looks better with head!

      // const shaftmesh = new THREE.Mesh(
      //   // @ts-ignore
      //   new CylinderBufferGeometryB(thickness, thickness, mag, 25),
      //   new THREE.MeshBasicMaterial({ color: color })
      // );

      const geom = new CylinderBufferGeometryB(1, 1, 2, 30, 2);
      // prettier-ignore
      // @ts-ignore
      const shaftmesh = new THREE.Mesh(geom,
        new THREE.MeshPhongMaterial({ color:'#4e5cf5'})
      );

      // @ts-ignore
      const edges = new THREE.EdgesGeometry(geom);
      // apply transformation to shaftmesh
      // shaftmesh.position.y = mag / 2;

      // apply rotation to object3d
      const shaft = new THREE.Object3D().add(shaftmesh);
      // .rotateOnWorldAxis(rotAxes, angle);

      return { shaft, head, mag, _vector, edges };
    }, []);

    return (
      <group ref={ref} rotation={rotation}>
        // shaft:
        <primitive object={shaft} />
        <lineSegments geometry={edges}>
          <lineBasicMaterial attach='material' color={'black'} />
        </lineSegments>
        <axesHelper />
        // head:
      </group>
    );
  }
);

export default Vector;
