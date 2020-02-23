import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';
import { ReactThreeFiber, useUpdate, extend } from 'react-three-fiber';
import { useSpring, a } from 'react-spring/three';

extend({ CustomCylinderBufferGeometry });
declare global {
  namespace JSX {
    interface IntrinsicElements {
      customCylinderBufferGeometry: ReactThreeFiber.Object3DNode<
        CustomCylinderBufferGeometry,
        typeof CustomCylinderBufferGeometry
      >;
    }
  }
}

const Cylinder = ({ newH, onPointerDown }) => {
  return (
    <mesh onPointerDown={onPointerDown}>
      <customCylinderBufferGeometry
        attach='geometry'
        args={[1, 1, 0.4, 30, 4]}
        onUpdate={self => {
          self.updateHeight(newH);
        }}
      />
      <meshPhongMaterial attach='material' color='blue' opacity={0.5} />
    </mesh>
  );
};
