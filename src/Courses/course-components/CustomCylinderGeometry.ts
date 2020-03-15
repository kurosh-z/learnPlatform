/**
 * ORIGINAL class from threejs : CylinderBufferGeometry
 * changed to the dynamic drawing mode and typescript
 *
 */
// TODO: add material double sided and different calculation for NumVertices to the case there is no cap!
import {
  Geometry,
  BufferGeometry,
  Float32BufferAttribute,
  BufferAttribute,
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
  openTop: boolean;
  openBottom: boolean;
  thetaStart: number;
  thetaLength: number;
}

interface CustomCylBuffGeo {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  drawingMode?: 'dynamic' | 'static';
  openTop?: boolean;
  openBottom?: boolean;
  thetaStart?: number;
  thetaLength?: number;
}
/* ======================================================================================== */
// CylinderBufferGeometry
export class CustomCylinderBufferGeometry extends BufferGeometry {
  parameters: Parameter;
  verIdx: number = 0;
  indexArray: Array<number[]> = [];
  groupStart: number = 0;
  indices: number[] = [];
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  positionAttr: Float32BufferAttribute;

  numVertices: number;
  positionNumComponents: number = 3;
  normalNumComponents: number = 3;
  uvNumComponents: number = 2;
  drawingMode: 'static' | 'dynamic';

  constructor({
    radiusTop = 1,
    radiusBottom = 1,
    height = 2,
    radialSegments = 8,
    heightSegments = 1,
    drawingMode = 'dynamic',
    openTop = false,
    openBottom = false,
    thetaStart = 0,
    thetaLength = 2 * Math.PI
  }: CustomCylBuffGeo) {
    super();
    this.type = 'CustomCylinderBufferGeometry';
    this.parameters = {
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openTop,
      openBottom,
      thetaStart,
      thetaLength
    };

    this.drawingMode = drawingMode;

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
    this._generateTorso();
    if (!openTop) {
      if (radiusTop > 0) this._generateCap(true);
    }
    if (!openBottom) {
      if (radiusBottom > 0) this._generateCap(false);
    }

    // build geometry
    this.setIndex(this.indices);
    this.positionAttr = new BufferAttribute(
      this.positions,
      this.positionNumComponents
    );
    if (drawingMode === 'dynamic') this.positionAttr.setUsage(DynamicDrawUsage);

    this.setAttribute('position', this.positionAttr);
    // this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute(
      'normal',
      new BufferAttribute(this.normals, this.normalNumComponents)
    );
    // this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    this.setAttribute(
      'uv',
      new BufferAttribute(this.uvs, this.uvNumComponents)
    );
  }

  updateHeight(newHeight: number): void {
    if (this.drawingMode === 'static')
      throw new Error('darwMode should be set to dynamic!');
    if (this.parameters.height === newHeight) return;
    this.parameters.height = newHeight;
    this.clearGroups();
    this.groupStart = 0;
    this.verIdx = 0;
    this.indexArray = [];
    this.indices = [];
    this._generateTorso();
    if (!this.parameters.openTop) {
      if (this.parameters.radiusTop > 0) this._generateCap(true);
    }
    if (!this.parameters.openBottom) {
      if (this.parameters.radiusBottom > 0) this._generateCap(false);
    }

    this.positionAttr.needsUpdate = true;

    this.computeBoundingSphere();
  }
  set height(newHeight: number) {
    this.updateHeight(newHeight);
  }
  get height(): number {
    return this.parameters.height;
  }
  _generateTorso(): void {
    const {
      radiusBottom,
      radiusTop,
      height,
      heightSegments,
      radialSegments,
      thetaLength,
      thetaStart
    } = this.parameters;
    var x, y;
    var normal = new Vector3();
    var vertex = new Vector3();
    var groupCount = 0;
    // this will be used to calculate the normal
    var slope = (radiusBottom - radiusTop) / height;
    // generate vertices, normals and uvs
    for (y = 0; y <= heightSegments; y++) {
      var indexRow = [];
      var v = y / heightSegments;
      // calculate the radius of the current row
      // var radius = v * (radiusBottom - radiusTop) + radiusTop;
      var radius = (1 - v) * (radiusBottom - radiusTop) + radiusTop;
      // console.log('torso r:', radius);
      for (x = 0; x <= radialSegments; x++) {
        var u = x / radialSegments;
        var theta = u * thetaLength + thetaStart;
        // console.log('theta', (theta * 180) / Math.PI);
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);
        // vertex
        vertex.x = radius * cosTheta;
        // vertex.y = -v * height + halfHeight;
        vertex.y = v * height;
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
    for (x = 0; x < radialSegments; x++) {
      for (y = 0; y < heightSegments; y++) {
        // we use the index array to access the correct indices
        let a = this.indexArray[y][x];
        let b = this.indexArray[y][x + 1];
        let c = this.indexArray[y + 1][x];
        let d = this.indexArray[y + 1][x + 1];
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
        groupCount += 6;
      }
    }
    // add a group to the geometry. this will ensure multi material support
    this.addGroup(this.groupStart, groupCount, 0);
    // calculate new start value for groups
    this.groupStart += groupCount;
  }

  _generateCap(top: boolean = true): void {
    const {
      radiusBottom,
      radiusTop,
      height,
      radialSegments,
      thetaLength,
      thetaStart
    } = this.parameters;
    // console.log('cap:top?, rtop, rbottm', top, radiusTop, radiusBottom);
    var x, centerIndexStart, centerIndexEnd;
    var uv = new Vector2();
    var vertex = new Vector3();
    var groupCount = 0;
    var radius = top === true ? radiusTop : radiusBottom;
    // console.log('cap radius:', radius);
    // var sign = top === true ? 1 : -1;
    // var sign = top === true ? 0 : 1;
    var capY = top ? height : 0;
    var sign = top ? 1 : -1;
    // save the index of the first center vertex
    centerIndexStart = this.verIdx;
    // first we generate the center vertex data of the cap.
    // because the geometry needs one set of uvs per face,
    // we must generate a center vertex per face/segment
    for (x = 1; x <= radialSegments; x++) {
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
    for (x = 0; x <= radialSegments; x++) {
      var u = x / radialSegments;
      var theta = u * thetaLength + thetaStart;
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
    for (x = 0; x < radialSegments; x++) {
      var c = centerIndexStart + x;
      var i = centerIndexEnd + x;
      if (top) {
        // face top
        this.indices.push(i + 1, i, c);
      } else {
        // face bottom
        this.indices.push(i, i + 1, c);
      }
      groupCount += 3;
    }
    // add a group to the geometry. this will ensure multi material support
    this.addGroup(this.groupStart, groupCount, top ? 1 : 2);
    // calculate new start value for groups
    this.groupStart += groupCount;
  }
}

/* ======================================================================================== */
// CylinderGeometry
interface CustomCylGeo {
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  radialSegments?: number;
  heightSegments?: number;
  openTop?: boolean;
  openBottom?: boolean;
  thetaStart?: number;
  thetaLength?: number;
}
export class CustomCylinderGeometry extends Geometry {
  parameters: Parameter;

  constructor({
    radiusTop = 1,
    radiusBottom = 1,
    height = 2,
    radialSegments = 8,
    heightSegments = 1,
    openTop = false,
    openBottom = false,
    thetaStart = 0,
    thetaLength = 2 * Math.PI
  }: CustomCylGeo) {
    super();
    this.type = 'CylinderGeometry';
    this.parameters = {
      radiusTop,
      radiusBottom,
      height,
      radialSegments,
      heightSegments,
      openTop,
      openBottom,
      thetaStart,
      thetaLength
    };
    this.fromBufferGeometry(
      new CustomCylinderBufferGeometry({
        radiusTop,
        radiusBottom,
        height,
        radialSegments,
        heightSegments,
        drawingMode: 'static', // dynamicDrawing
        openTop,
        openBottom,
        thetaStart,
        thetaLength
      })
    );
    this.mergeVertices();
  }
}
