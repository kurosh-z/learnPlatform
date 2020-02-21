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
  openEnded?: boolean;
  thetaStart?: number;
  thetaLength?: number;
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

// CylinderBufferGeometry
class CylinderBufferGeometryB extends BufferGeometry {
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
    var scope = this;
    // radiusTop = radiusTop !== undefined ? radiusTop : 1;
    // radiusBottom = radiusBottom !== undefined ? radiusBottom : 1;
    // height = height || 1;
    // radialSegments = Math.floor(radialSegments) || 8;
    // heightSegments = Math.floor(heightSegments) || 1;
    // openEnded = openEnded !== undefined ? openEnded : false;
    // thetaStart = thetaStart !== undefined ? thetaStart : 0.0;
    // thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;
    // buffers
    var indices: number[] = [];
    // we aret going to define them as a typed array!
    // var vertices = [];
    // var normals = [];
    // var uvs = [];
    // change to typed arrays to be able to change the size dynamically!
    // calcualte the lenght of vertecies array (first expression for body and the next is for caps)
    var numVertices =
      (heightSegments + 1) * (radialSegments + 1) +
      2 * (2 * radialSegments + 1);
    var positionNumComponents = 3;
    var positions = new Float32Array(numVertices * positionNumComponents);
    // do the same for UVS and normals
    const normalNumComponents = 3;
    const uvNumComponents = 2;
    var normalsTyped = new Float32Array(numVertices * normalNumComponents);
    var uvsTyped = new Float32Array(numVertices * uvNumComponents);
    // helper variables
    var index = 0;
    var indexArray: Array<number[]> = [];
    // var halfHeight = height / 2;
    var groupStart = 0;
    // generate geometry
    generateTorso();
    if (!openEnded) {
      if (radiusTop > 0) generateCap(true);
      if (radiusBottom > 0) generateCap(false);
    }
    // console.log('nvert :', vertices.length);
    // console.log(
    //   3 * ((heightSegments + 1) * (radialSegments + 1)) +
    //     2 * 3 * (2 * radialSegments + 1)
    // );
    // build geometry
    this.setIndex(indices);
    // this.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    const positionAttr = new Float32BufferAttribute(
      positions,
      positionNumComponents
    );
    positionAttr.setUsage(DynamicDrawUsage);
    this.setAttribute('position', positionAttr);
    // this.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.setAttribute(
      'normal',
      new Float32BufferAttribute(normalsTyped, normalNumComponents)
    );
    // this.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
    this.setAttribute(
      'uv',
      new Float32BufferAttribute(uvsTyped, uvNumComponents)
    );
    function generateTorso() {
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
        var radius = v * height * (radiusTop - radiusBottom) + radiusBottom;
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
          positions.set([vertex.x, vertex.y, vertex.z], index * 3);
          // console.log('xy: x,y,z : ', x, y, [vertex.x, vertex.y, vertex.z]);
          // normal
          normal.set(sinTheta, slope, cosTheta).normalize();
          // normals.push(normal.x, normal.y, normal.z);
          normalsTyped.set([normal.x, normal.y, normal.z], index * 3);
          // uv
          // uvs.push(u, 1 - v);
          uvsTyped.set([u, 1 - v], index * 2);
          // save index of vertex in respective row
          indexRow.push(index++);
        }
        // console.log(indexRow);
        // now save vertices of the row in our index array
        indexArray.push(indexRow);
      }
      // generate indices
      for (x = 0; x < radialSegments; x++) {
        for (y = 0; y < heightSegments; y++) {
          // we use the index array to access the correct indices
          var a = indexArray[y][x];
          var b = indexArray[y][x + 1];
          var c = indexArray[y + 1][x];
          var d = indexArray[y + 1][x + 1];
          // console.log('a,b,c,d', a, b, c, d);
          // console.log('a', a, vertices.slice(a, a + 3));
          // console.log('b', b, vertices.slice(b * 3, 3 * (b + 1)));
          // console.log('c', c, vertices.slice(c * 3, (c + 1) * 3));
          // console.log('d', d, vertices.slice(d * 3, (d + 1) * 3));
          // faces
          // indices.push(a, b, d);
          indices.push(a, c, b);
          indices.push(c, d, b);
          // indices.push(b, a, c);
          //   console.log('--------------');
          //   console.log(a, d, b);
          //   console.log(b, d, c);
          // update group counter
          groupCount += 6;
        }
      }
      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, 0);
      // calculate new start value for groups
      groupStart += groupCount;
    }
    function generateCap(top: boolean = true): void {
      var x, centerIndexStart, centerIndexEnd;
      var uv = new Vector2();
      var vertex = new Vector3();
      var groupCount = 0;
      var radius = top === true ? radiusTop : radiusBottom;
      // var sign = top === true ? 1 : -1;
      // var sign = top === true ? 0 : 1;
      var capY = top ? 0 : height;
      var sign = top === true ? 1 : -1;
      // save the index of the first center vertex
      centerIndexStart = index;
      // first we generate the center vertex data of the cap.
      // because the geometry needs one set of uvs per face,
      // we must generate a center vertex per face/segment
      for (x = 1; x <= radialSegments; x++) {
        // vertex
        // vertices.push(0, height * sign, 0);
        // vertices.push(0, capY, 0);
        positions.set([0, capY, 0], index * 3);
        // normal
        // normals.push(0, sign, 0);
        normalsTyped.set([0, sign, 0], index * 3);
        // uv
        // uvs.push(0.5, 0.5);
        uvsTyped.set([0.5, 0.5], index * 2);
        // increase index
        index++;
      }
      // save the index of the last center vertex
      centerIndexEnd = index;
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
        positions.set([vertex.x, vertex.y, vertex.z], index * 3);
        // normal
        // normals.push(0, sign, 0);
        normalsTyped.set([0, sign, 0], index * 3);
        // uv
        uv.x = cosTheta * 0.5 + 0.5;
        uv.y = sinTheta * 0.5 * sign + 0.5;
        // uvs.push(uv.x, uv.y);
        uvsTyped.set([uv.x, uv.y], index * 2);
        // increase index
        index++;
      }
      // generate indices
      for (x = 0; x < radialSegments; x++) {
        var c = centerIndexStart + x;
        var i = centerIndexEnd + x;
        if (top === true) {
          // face top
          indices.push(i, i + 1, c);
        } else {
          // face bottom
          indices.push(i + 1, i, c);
        }
        groupCount += 3;
      }
      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, top === true ? 1 : 2);
      // calculate new start value for groups
      groupStart += groupCount;
    }
  }
}

export { CylinderGeometryB, CylinderBufferGeometryB };
