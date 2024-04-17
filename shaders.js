"use strict";

const PORT = 8000;


function linspace(min, max, n) {
  /* Returns n equally spaced values between min and max (including endpoints) */
  const result = [];
  const range = max - min;
  for (let i=0; i<n; i++) {
    result.push(min + range * i / (n-1));
  }
  return result;
}

function heaviside(x) {
  /* Computes the Heaviside step function of x */
  return (x < 0) ? 0 : 1;
}

function roundTo(x, places) {
  /* Rounds x to the specified number of places after the decimal */
  return Math.round(x * Math.pow(10, places)) / Math.pow(10, places);
}

//******************************************************************************//

let image = new Image();
image.crossOrigin = "";
image.onload = function() {
  Promise.all([
    fetch(`http://localhost:${PORT}/shaders/tiling_vert_shader.vert`, {cache: "no-store"}).then((res) => res.text()),
    fetch(`http://localhost:${PORT}/shaders/tiling_frag_shader.frag`, {cache: "no-store"}).then((res) => res.text())
  ]).then((data) => {
    render(image, data[0], data[1]);
  });
};

// image.src = "https://i.imgur.com/i2E76GG.png";
// image.src = "https://i.imgur.com/hMwpksp.png";
// image.src = "https://i.imgur.com/JQiyVIh.png"  
// image.src = "https://i.imgur.com/ForbHCE.jpg";
// image.src = "https://i.imgur.com/NJ1f3km.png";
// image.src = "https://i.imgur.com/g3qmmll.png"; // cat
// image.src = "https://i.imgur.com/z1nLxpb.png";
image.src = "https://i.imgur.com/Xm7kWSc.png"; // grid
// image.src = "https://i.imgur.com/EjmBVc5.png"; // cat with border
// image.src = "https://i.imgur.com/o9YtKca.png";
// image.src = "https://i.imgur.com/oOmYA9d.png";

function render(image, vertexShaderSource, fragmentShaderSource) {

  const N = 250;
  const p=4;
  const q=8;
  const triangles = generatePQTessellation(p, q);
  console.log("tiling generation complete", p, q);

  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  let imageLocation = gl.getUniformLocation(program, "u_image");

  let vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  let positionBuffer = gl.createBuffer();

  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  let size = 4;
  let type = gl.FLOAT;
  let normalize = false;
  let stride = 0;
  let offset = 0;
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  let texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles.trianglesWithoutCenter), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texCoordAttributeLocation);

  size = 2;
  type = gl.FLOAT;
  normalize = false;
  stride = 0;
  offset = 0;
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

  let texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  let mipLevel = 0;
  let internalFormat = gl.RGBA;
  let srcFormat = gl.RGBA;
  let srcType = gl.UNSIGNED_BYTE;
  gl.texImage2D(gl.TEXTURE_2D,
                mipLevel,
                internalFormat,
                srcFormat,
                srcType,
                image);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  gl.uniform1i(imageLocation, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangles.triangles, gl.STATIC_DRAW);

  let primitiveType = gl.TRIANGLES;
  offset = 0;
  gl.drawArrays(primitiveType, offset, triangles.count);
}

class HyperbolicPolygon {

	constructor(vertices) {
		this.vertices = vertices.slice();
		this.length = this.vertices.length;
		this.euclideanCentroid = Euclid.centroid(this.vertices);
	}

	get(i) {
		return this.vertices[i];
	}

	hash() {
		/*
		Returns the hash of the euclidean centroid of this polygon
		*/
		return this.euclideanCentroid.hash();
	}
}


function generatePQTessellation(p, q, numLayers=null, coverage=0.986) {
  const polygons = [];
  const PI = Math.PI;
  let angle, vertices = [];
  const d = Poincare.regPolyDist(p, q);
  const startingAngle = 0*PI / 4;

  for (let i=0; i<p; i++) {
    angle = 2 * i * PI / p + startingAngle;
    vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
  }

  const initial = new HyperbolicPolygon(vertices);
  polygons.push(initial);
  const centroidTable = new Map();
  centroidTable.set(initial.hash(), 1);

  // let iterations = 12-p;
  let iterations = 5;
  if (p == 3) iterations = 14;
  let lastLayer = [vertices];
  for (let i=0; i<iterations; i++) {
    let layer = [];
    for (let vertexSet of lastLayer) {
      for (let k=0; k<vertexSet.length; k++) {
        const newVerts = Poincare.reflectMultiple(vertexSet, vertexSet[k], vertexSet[(k + 1) % vertexSet.length]);
        const newPoly = new HyperbolicPolygon(newVerts);
        const hash = newPoly.hash();
        if (centroidTable.get(hash) === undefined) {					
          centroidTable.set(hash, 1);
          polygons.push(newPoly);
          layer.push(newVerts);
        }
      }
    }
    lastLayer = layer.slice();
  }

  let tris = [], triCount = 0;
  let trianglesWithoutCenter = [], countWithoutCenter = 0;
  for (let pollie of polygons) {
    const polyTris = hyperbolicPolygonTris(pollie.vertices, pollie.euclideanCentroid);
    tris = tris.concat(polyTris.triangles);
    trianglesWithoutCenter = trianglesWithoutCenter.concat(polyTris.trianglesWithoutCenter);
    triCount += polyTris.count;
    countWithoutCenter += polyTris.countWithoutCenter;
  }

  tris = new Float32Array(tris);

  return {
    "trianglesWithoutCenter": trianglesWithoutCenter,
    "countWithoutCenter": countWithoutCenter,
    "triangles": tris,
    "count": triCount,
  }
}

function hyperbolicPolygonTris(vertices, centroid) {
  const polyData = Poincare.polygon(300, vertices);
  polyData.push(polyData[0]);

  const triangleVertices = [];
  const trisWC = [];
  for (let i=0; i<polyData.length-1; i++) {
    triangleVertices.push(polyData[i].re);
    triangleVertices.push(polyData[i].im);
    triangleVertices.push(centroid.re);
    triangleVertices.push(centroid.im);

    triangleVertices.push(centroid.re);
    triangleVertices.push(centroid.im);
    triangleVertices.push(centroid.re);
    triangleVertices.push(centroid.im);

    triangleVertices.push(polyData[i+1].re);
    triangleVertices.push(polyData[i+1].im);
    triangleVertices.push(centroid.re);
    triangleVertices.push(centroid.im);

    trisWC.push(polyData[i].re);
    trisWC.push(polyData[i].im);

    trisWC.push(centroid.re);
    trisWC.push(centroid.im);

    trisWC.push(polyData[i+1].re);
    trisWC.push(polyData[i+1].im);
  }

  return {
    "trianglesWithoutCenter": trisWC,
    "countWithoutCenter": trisWC.length / 2,
    "triangles": triangleVertices,
    "count": triangleVertices.length / 2,
  };
}