import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from 'react-three-fiber';

const Camera = (props) => {
  const camRef = useRef<THREE.PerspectiveCamera>(null);
  const { setDefaultCamera } = useThree();
  // Make the camera known to the system
  useEffect(() => {
    // gl.setScissorTest(true);
    if (camRef.current) {
      camRef.current.up.set(0, 0, 1);
      void setDefaultCamera(camRef.current);
    }
  }, []);

  const { size } = useThree();
  useEffect(() => {
    if (camRef.current) {
      camRef.current.aspect = size.width / size.height;
      camRef.current.lookAt(0, 0, 0);
    }
  }, [size]);
  useFrame(() => {
    // render the original view
    if (!camRef.current) throw new Error('camera is not defined!');
    {
      camRef.current.updateProjectionMatrix();
    }
  });
  return (
    <perspectiveCamera
      ref={camRef}
      args={[50, 2.4, 0.1, 500]}
      position={[8, 6, 5]}
      {...props}
    />
  );
};

export default Camera;
