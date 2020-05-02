import * as THREE from 'three';
import React, { forwardRef, useMemo } from 'react';
import { useLoader, useUpdate } from 'react-three-fiber';
import { ReactThreeFiber } from 'react-three-fiber/three-types';
import bold from './bold.blob';

// /resources/fonts/bold.blob'
type TextrefProps = {
  children: string;
  vAlign: 'center' | 'top';
  hAlign: 'center' | 'right';
  size: number;
  color: string;
};
const Textref: React.FC<TextrefProps> = (
  {
    children,
    vAlign = 'center',
    hAlign = 'center',
    size = 1,
    color = '#000000',
    ...rest
  },
  ref: React.Ref<ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>>
) => {
  const font = useLoader(THREE.FontLoader, bold);
  const config = useMemo(() => ({ font, size: 40, height: 50 }), [font]);
  const mesh = useUpdate(
    (self: THREE.Mesh) => {
      const size = new THREE.Vector3();
      self.geometry.computeBoundingBox();
      self.geometry.boundingBox.getSize(size);
      self.position.x =
        hAlign === 'center' ? -size.x / 2 : hAlign === 'right' ? 0 : -size.x;
      self.position.y =
        vAlign === 'center' ? -size.y / 2 : vAlign === 'top' ? 0 : -size.y;
    },
    [children]
  );
  return (
    <group ref={ref} {...rest} scale={[0.1 * size, 0.1 * size, 0.1]}>
      <mesh ref={mesh}>
        <textGeometry attach='geometry' args={[children, config]} />
        <meshNormalMaterial attach='material' />
      </mesh>
    </group>
  );
};

const Text: React.RefForwardingComponent<
  typeof Textref,
  ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>
> = forwardRef(Textref);

export default Text;
