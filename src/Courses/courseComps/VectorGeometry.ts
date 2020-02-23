import { BufferGeometry, BufferGeometryUtils } from 'three';

import { CustomCylinderBufferGeometry } from './CustomCylinderGeometry';

interface VectorBuffGeometry {
  thickness: number;
  magnitude: number;
}
export class CustomVectorBufferGeometry {
  vectorParam: { thickness: number; magnitude: number };
  shaft: CustomCylinderBufferGeometry;
  head: CustomCylinderBufferGeometry;
  constructor({ thickness, magnitude }: VectorBuffGeometry) {
    super();
    this.vectorParam = { thickness, magnitude };

    // building the shaft
    this.shaft = new CustomCylinderBufferGeometry({
      radiusTop: thickness,
      radiusBottom: thickness,
      height: magnitude,
      radialSegments: 30,
      heightSegments: 4,
      drawingMode: 'dynamic',
      openTop: true
    });
    this.head = new CustomCylinderBufferGeometry({
      radiusTop: 0,
      radiusBottom: thickness,
      height: magnitude,
      radialSegments: 30,
      heightSegments: 4,
      openBottom: false,
      openTop: false,
      drawingMode: 'dynamic'
    });

    this.head.translate(0, magnitude, 0);
    this.geometry = BufferGeometryUtils.mergeBufferGeometries([
      this.shaft,
      this.head
    ]);
  }
}
