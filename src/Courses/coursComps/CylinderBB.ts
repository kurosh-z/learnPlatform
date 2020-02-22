/**
 * ORIGINAL class from threejs : CylinderBufferGeometry
 * changed to the dynamic drawing mode and typescript
 * @author : Kurosh Zamani https://github.com/kurosh-z
 */
import {
  Geometry,
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  Vector2,
  DynamicDrawUsage
} from 'three';

interface Parameter {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
  heightSegments: number;
  openEnded: boolean;
  thetaStart: number;
  thetaLength: number;
}

// CylinderGeometry
class CylinderGeometryB extends Geometry {
  parameters: Parameter;

  constructor(
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 2,
    radialSegments: number = 8,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = 2 * Math.PI
  ) {
    super();
    this.type = 'CylinderGeometry';
    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };
    this.fromBufferGeometry(
      new CylinderBufferGeometryB(
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        openEnded,
        thetaStart,
        thetaLength
      )
    );
    this.mergeVertices();
  }
}
/* ======================================================================================== */
// CylinderBufferGeometry
class CylinderBufferGeometryB extends BufferGeometry {
  parameters: Parameter;
  verIdx: number = 0;
  indexArray: Array<number[]> = [];
  groupStart: number = 0;
  groupCount: number = 0;
  indices: number[] = [];
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  positionAttr: Float32BufferAttribute;

  numVertices: number;
  positionNumComponents: number = 3;
  normalNumComponents: number = 3;
  uvNumComponents: number = 2;

  constructor(
    radiusTop: number = 1,
    radiusBottom: number = 1,
    height: number = 2,
    radialSegments: number = 8,
    heightSegments: number = 1,
    openEnded: boolean = false,
    thetaStart: number = 0,
    thetaLength: number = 2 * Math.PI
  ) {
    super();
    this.type = 'CylinderBufferGeometry';
    this.parameters = {
      radiusTop: radiusTop,
      radiusBottom: radiusBottom,
      height: height,
      radialSegments: radialSegments,
      heightSegments: heightSegments,
      openEnded: openEnded,
      thetaStart: thetaStart,
      thetaLength: thetaLength
    };

    this.numVertices =
      (heightSegments + 1) * (radialSegments + 1) +
      2 * (2 * radialSegments + 1);

    this.positions = new Float32Array(
      this.numVertices * this.positionNumComponents
    );
    // do the same for UVS and normals

    this.normals = new Float32Array(
      this.numVertices * this.normalNumComponents
    );
    this.uvs = new Float32Array(this.numVertices * this.uvNumComponents);

    // generate geometry
    this.generateTorso();
    if (!openEnded) {
      if (radiusTop > 0) this.generateCap(true);
      if (radiusBottom > 0) this.generateCap(false);
    }

    // build geometry
    this.setIndex(this.indices);
    this.positionAttr = new Float32BufferAttribute(
      this.positions,
      this.positionNumComponents
    );
    // this.positionAttr.setUsage(DynamicDrawUsage);
    this.setAttribute('position', this.positionAttr);
    // this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute(
      'normal',
      new Float32BufferAttribute(this.normals, this.normalNumComponents)
    );
    // this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    this.setAttribute(
      'uv',
      new Float32BufferAttribute(this.uvs, this.uvNumComponents)
    );
  }
  generateTorso(): void {
    var x, y;
    var normal = new Vector3();
    var vertex = new Vector3();
    // var groupCount = 0;
    // this will be used to calculate the normal
    var slope =
      (this.parameters.radiusBottom - this.parameters.radiusTop) /
      this.parameters.height;
    // generate vertices, normals and uvs
    for (y = 0; y <= this.parameters.heightSegments; y++) {
      var indexRow = [];
      var v = y / this.parameters.heightSegments;
      // calculate the radius of the current row
      // var radius = v * (radiusBottom - radiusTop) + radiusTop;
      var radius =
        v *
          this.parameters.height *
          (this.parameters.radiusTop - this.parameters.radiusBottom) +
        this.parameters.radiusBottom;
      for (x = 0; x <= this.parameters.radialSegments; x++) {
        var u = x / this.parameters.radialSegments;
        var theta =
          u * this.parameters.thetaLength + this.parameters.thetaStart;
        // console.log('theta', (theta * 180) / Math.PI);
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        // vertex
        vertex.x = radius * cosTheta;
        // vertex.y = -v * height + halfHeight;
        vertex.y = v * this.parameters.height;
        vertex.z = radius * sinTheta;
        // vertices.push(vertex.x, vertex.y, vertex.z);
        this.positions.set(
          [vertex.x, vertex.y, vertex.z],
          this.verIdx * this.positionNumComponents
        );
        // console.log('xy: x,y,z : ', x, y, [vertex.x, vertex.y, vertex.z]);
        // normal
        normal.set(sinTheta, slope, cosTheta).normalize();
        // normals.push(normal.x, normal.y, normal.z);
        this.normals.set(
          [normal.x, normal.y, normal.z],
          this.verIdx * this.normalNumComponents
        );
        // uv
        // uvs.push(u, 1 - v);
        this.uvs.set([u, 1 - v], this.verIdx * this.uvNumComponents);
        // save index of vertex in respective row
        indexRow.push(this.verIdx++);
      }
      // console.log(indexRow);
      // now save vertices of the row in our index array
      this.indexArray.push(indexRow);
    }
    // generate indices
    for (x = 0; x < this.parameters.radialSegments; x++) {
      for (y = 0; y < this.parameters.heightSegments; y++) {
        // we use the index array to access the correct indices
        var a = this.indexArray[y][x];
        var b = this.indexArray[y][x + 1];
        var c = this.indexArray[y + 1][x];
        var d = this.indexArray[y + 1][x + 1];
        // console.log('a,b,c,d', a, b, c, d);
        // console.log('a', a, vertices.slice(a, a + 3));
        // console.log('b', b, vertices.slice(b * 3, 3 * (b + 1)));
        // console.log('c', c, vertices.slice(c * 3, (c + 1) * 3));
        // console.log('d', d, vertices.slice(d * 3, (d + 1) * 3));
        // faces
        // indices.push(a, b, d);
        this.indices.push(a, c, b);
        this.indices.push(c, d, b);
        // indices.push(b, a, c);
        //   console.log('--------------');
        //   console.log(a, d, b);
        //   console.log(b, d, c);
        // update group counter
        this.groupCount += 6;
      }
    }
    // add a group to the geometry. this will ensure multi material support
    // scope.addGroup(groupStart, groupCount, 0);
    this.addGroup(this.groupStart, this.groupCount, 0);

    // calculate new start value for groups
    this.groupStart += this.groupCount;
  }
  generateCap(top: boolean = true): void {
    var x, centerIndexStart, centerIndexEnd;
    var uv = new Vector2();
    var vertex = new Vector3();
    // var groupCount = 0;
    var radius = top ? this.parameters.radiusTop : this.parameters.radiusBottom;
    // var sign = top === true ? 1 : -1;
    // var sign = top === true ? 0 : 1;
    var capY = top ? 0 : this.parameters.height;
    var sign = top ? 1 : -1;
    // save the index of the first center vertex
    centerIndexStart = this.verIdx;
    // first we generate the center vertex data of the cap.
    // because the geometry needs one set of uvs per face,
    // we must generate a center vertex per face/segment
    for (x = 1; x <= this.parameters.radialSegments; x++) {
      // vertex
      // vertices.push(0, height * sign, 0);
      // vertices.push(0, capY, 0);
      this.positions.set([0, capY, 0], this.verIdx * 3);
      // normal
      // normals.push(0, sign, 0);
      this.normals.set([0, sign, 0], this.verIdx * 3);
      // uv
      // uvs.push(0.5, 0.5);
      this.uvs.set([0.5, 0.5], this.verIdx * 2);
      // increase index
      this.verIdx++;
    }
    // save the index of the last center vertex
    centerIndexEnd = this.verIdx;
    // now we generate the surrounding vertices, normals and uvs
    for (x = 0; x <= this.parameters.radialSegments; x++) {
      var u = x / this.parameters.radialSegments;
      var theta = u * this.parameters.thetaLength + this.parameters.thetaStart;
      var cosTheta = Math.cos(theta);
      var sinTheta = Math.sin(theta);
      // vertex
      vertex.x = radius * cosTheta;
      vertex.y = capY;
      vertex.z = radius * sinTheta;
      // vertices.push(vertex.x, vertex.y, vertex.z);
      this.positions.set([vertex.x, vertex.y, vertex.z], this.verIdx * 3);
      // normal
      // normals.push(0, sign, 0);
      this.normals.set([0, sign, 0], this.verIdx * 3);
      // uv
      uv.x = cosTheta * 0.5 + 0.5;
      uv.y = sinTheta * 0.5 * sign + 0.5;
      // uvs.push(uv.x, uv.y);
      this.uvs.set([uv.x, uv.y], this.verIdx * 2);
      // increase index
      this.verIdx++;
    }
    // generate indices
    for (x = 0; x < this.parameters.radialSegments; x++) {
      var c = centerIndexStart + x;
      var i = centerIndexEnd + x;
      if (top === true) {
        // face top
        this.indices.push(i, i + 1, c);
      } else {
        // face bottom
        this.indices.push(i + 1, i, c);
      }
      this.groupCount += 3;
    }
    // add a group to the geometry. this will ensure multi material support
    // scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
    this.addGroup(this.groupStart, this.groupCount, top === true ? 1 : 2);

    // calculate new start value for groups
    this.groupStart += this.groupCount;
  }
}

export { CylinderGeometryB, CylinderBufferGeometryB };
