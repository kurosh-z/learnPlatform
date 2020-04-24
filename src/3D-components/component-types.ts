import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { ReactThreeFiber, extend } from 'react-three-fiber';
// import { MeshLine, MeshLineMaterial } from 'three.meshline';
import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';

extend({ LineMaterial, LineGeometry, Line2, CustomCylinderBufferGeometry });
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
      customCylinderBufferGeometry: ReactThreeFiber.Object3DNode<
        CustomCylinderBufferGeometry,
        typeof CustomCylinderBufferGeometry
      >;
      //   meshLine: ReactThreeFiber.Object3DNode<MeshLine, any>;
      //   meshLineMaterial: ReactThreeFiber.Object3DNode<MeshLineMaterial, any>;
    }
  }
}
