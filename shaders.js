"use strict";

// let vertexShaderSource = `#version 300 es

// // an attribute is an input (in) to a vertex shader.
// // It will receive data from a buffer
// in vec4 a_position;
// // in vec2 a_position;
// in vec2 a_texCoord;

// // Used to pass in the resolution of the canvas
// uniform vec2 u_resolution;

// // Used to pass the texture coordinates to the fragment shader
// out vec2 v_texCoord;
// out vec2 chicken_house;

// // all shaders have a main function
// void main() {

//   vec2 pos = vec2(a_position[0], a_position[1]);
//   vec2 cent = vec2(a_position[2], a_position[3]);

//   vec2 aspect = pos * vec2(u_resolution.y / u_resolution.x, 1.0);
//   gl_Position = vec4(aspect, 0, 1);

//   // pass the texCoord to the fragment shader
//   // The GPU will interpolate this value between points.
//   v_texCoord = a_texCoord;
//   // chicken_house = vec2(0,0);
//   chicken_house = cent;
//   // v_texCoord = vec2(0.0, 0.0);
// }
// `;

// let fragmentShaderSource = `#version 300 es

// // fragment shaders don't have a default precision so we need
// // to pick one. highp is a good default. It means "high precision"
// precision highp float;

// // our texture
// uniform sampler2D u_image;

// // the texCoords passed in from the vertex shader.
// in vec2 v_texCoord;
// in vec2 chicken_house;

// // we need to declare an output for the fragment shader
// out vec4 outColor;

// const float pi = 3.1415926535897;
// // const float[8] pValues = float[](
// //   0.99999999999980993,
// //   676.5203681218851,
// //   -1259.1392167224028,
// //   771.32342877765313,
// //   -176.61502916214059,
// //   12.507343278686905,
// //   -0.13857109526572012,
// //   9.9843695780195716e-6,
// //   1.5056327351493116e-7
// // );

// const float[8] pValues = float[](
//   676.5203681218851,
//   -1259.1392167224028,
//   771.32342877765313,
//   -176.61502916214059,
//   12.507343278686905,
//   -0.13857109526572012,
//   9.9843695780195716e-6,
//   1.5056327351493116e-7
// );

// vec2 poincareToKlein(vec2 z) {
//   // m0
//   return z * 2.0 / (z.x * z.x + z.y * z.y + 1.0);
// }

// float kleinRadius(float p, float q) {
//   float recipCoshA0 = sin(pi / p) * sin(pi / q) / ( cos(pi / p) * cos(pi / q) );
//   return sqrt( 1.0 - recipCoshA0 * recipCoshA0 );
// }

// vec2 squareToTexture(vec2 z) {
//   // m3
//   return (z + vec2(1.0)) / 2.0;
// }

// vec2 clampToBox(vec2 z) {
//   // m4
//   return clamp(z, 0.0, 1.0);
// }

// vec2 complexConj(vec2 z) {
//   return vec2(z.x, -z.y);
// }

// float normSq(vec2 z) {
//   return z.x * z.x + z.y * z.y;
// }

// vec2 complexInv(vec2 z) {
//   return complexConj(z) / normSq(z);
// }

// vec2 complexMult(vec2 z1, vec2 z2) {
//   return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
// }

// vec2 complexDiv(vec2 z1, vec2 z2) {
//   return complexMult(z1, complexInv(z2));
// }

// vec2 complexExp(vec2 z) {
//   return exp(z.x) * vec2(cos(z.y), sin(z.y));
// }

// // sin(z) = (exp(iz)-exp(-iz))/(2i)
// vec2 complexSine(vec2 z) {
//   return complexDiv( complexExp(complexMult(vec2(0.0, 1.0), z)) - complexExp(complexMult(vec2(0.0, -1.0), z)), vec2(0.0, 2.0) );
// }

// // Lanczos approximation
// // https://en.wikipedia.org/wiki/Lanczos_approximation
// // use of the reflection formula isn't strictly necessary for practical purposes here, but we include it for "correctness"
// // vec2 complexGamma(vec2 z) {
// //   if (z.x < 0.5) {
// //     // gamma(1-z)gamma(z) = pi / sin(pi*z)
// //     return complexDiv( vec2(pi, 0.0), complexMult(complexSine( pi * z ), complexGamma(vec2(1.) - z)) );
// //   } else {
// //     z = z - vec2(1.0, 0.0); // account for stupid shift by 1
// //     vec2 x = vec2(pValues[0], 0);
// //     for (int i=0; i<pValues.length; i++) {
// //       x = x + complexDiv( vec2(pValues[i], 0.0), z + vec2(float(i), 0.0) );
// //     }
// //     vec2 t = z + vec2(7.5, 0); // g=7, g+0.5
// //     return sqrt(2.0 * pi) * t 
// //   }
// // }

// // no need for reflection formula (it's close enough anyway)
// float gamma(float z) {
//   z -= 1.0;
//   float x = 0.99999999999980993; // Unnecessary precision
//   for (int i = 0; i < 8; i++) {
//     x += pValues[i] / (z + float(i + 1));
//   }
//   float t = z + 8.0 - 0.5; // g = 7
//   return sqrt(2.0 * pi) * pow(t, z + 0.5) * exp(-t) * x;
// }

// float beta(float a, float b) {
//   return (gamma(a) * gamma(b)) / gamma(a + b);
// }

// float nCr(float n, float k) {
//   return gamma( n + 1.0 ) / (gamma( k + 1.0 ) * gamma( n - k + 1.0 ));
// }

// vec2 intPow(vec2 z, int power) {
//   vec2 result = z;
//   for (int i=1; i<power; i++) {
//     result = complexMult(result, z);
//   }
//   return result;
// }

// vec2 rotate(vec2 z, float angle) {
//   return complexMult(complexExp(vec2(0, angle)), z);
// }

// vec2 complexPow(vec2 z1, vec2 z2) {
//   float sub_ang = atan(z1.y, z1.x);
//   float ang = 0.5 * z2.y * log(z1.x * z1.x + z1.y * z1.y) + z2.x * sub_ang;
//   float norm = exp(-z2.y * sub_ang) * pow( z1.x * z1.x + z1.y * z1.y, 0.5 * z2.x );
//   return vec2( norm * cos(ang), norm * sin(ang) );
// }

// vec2 inverseSchwarzChristoffel(vec2 z, float p) {
//   // p-gon -> disk
//   float z_max = pow(beta(1.0 / p, 1.0 - 2.0 / p), p);
//   float[5] taylorCoefs = float[5](0., 0., 0., 0., 0.);
//   float[5] coefs = float[5](0., 0., 0., 0., 0.);
//   for (int i=0; i<5; i++) {
//     coefs[i] = nCr( float(i) - 1.0 + 2.0 / p, float(i) );
//   }

//   taylorCoefs[0] = -coefs[0];
//   taylorCoefs[1] = -coefs[1] + (p + 1.0) * coefs[0] * coefs[0];
//   taylorCoefs[2] = -coefs[2] + (3.0 * p + 2.0) * ( coefs[0] * coefs[1] - 0.5 * (p + 1.0) * coefs[0] * coefs[0] * coefs[0] );
//   taylorCoefs[3] = -coefs[3] + (2.0 * p + 1.0) * ( 2.0 * coefs[0] * coefs[2] + coefs[1] * coefs[1] - (4.0 * p + 3.0) * (coefs[0] * coefs[0] * coefs[1] - (1.0 / 3.0) * (p + 1.0) * pow(coefs[0], 4.0) ) );
//   taylorCoefs[4] = -coefs[4] + (5.0 * p + 2.0) * ( coefs[0] * coefs[3] + coefs[1] * coefs[2] + (5.0 * p + 3.0) * (-0.5 * coefs[0] * coefs[0] * coefs[2] - 0.5 * coefs[0] * coefs[1] * coefs[1] + (5.0 * p + 4.0) * (coefs[0] * coefs[0] * coefs[0] * coefs[1] / 6.0 - (p + 1.0) * pow(coefs[0], 5.0) / 24.0) ) );

//   vec2 term0 = taylorCoefs[0] * intPow(z, int(p));
//   vec2 term1 = taylorCoefs[1] * intPow(z, int(2.0 * p));
//   vec2 term2 = taylorCoefs[2] * intPow(z, int(3.0 * p));
//   vec2 term3 = taylorCoefs[3] * intPow(z, int(4.0 * p));
//   vec2 term4 = taylorCoefs[4] * complexDiv( intPow(z, int(5.0 * p)), vec2(1.0, 0.0) + intPow(z, int(p)) / z_max );

//   return complexMult(z, vec2(1.0, 0.0) - term0 + term1 + term2 + term3 + term4 );
// }

// // this is messy because we have to compute an integral
// vec2 schwarzChristoffel(vec2 z, float p) {
//   // disk -> p-gon
//   vec2 coef = complexExp( vec2(0.0, pi / p) );
//   const int steps = 1000;
  
//   // compute integral
//   const float step = 1.0 / float(steps);
//   vec2 integral = vec2(0.0, 0.0);
//   for (int i=0; i<steps+1; i++) {
//     float t = step * float(i);
//     integral += step * complexMult( z, complexPow( vec2(1.0, 0.0) - intPow(t * z, int(p)), vec2(-2.0 / p) ) );
//   }
//   return complexMult(coef, integral);
// }

// vec2 poincareToTexture(vec2 z, float p, float q) {
//   z = rotate(z, -pi / p);
//   z = poincareToKlein(z);
//   z = z / kleinRadius(p, q );
//   // z = z * 1.45534669023;
//   // z = z * (1.0 / kleinRadius(p, q));
//   z = schwarzChristoffel(z, p);
//   float z_normSq = normSq(z);
//   // if (z_normSq > 1.0) {
//   //   z = z / sqrt(z_normSq);
//   // }
//   z = inverseSchwarzChristoffel(z, 4.0);
//   // // z = (z + 1.0) / 2.0; // normalize to texture coordinates // might not have to do this
//   z = squareToTexture(z);
//   return z;
// }

// vec2 translatePToOrigin(vec2 z, vec2 P) {
//   return complexDiv(z - P, vec2(1.0, 0.0) - complexMult(complexConj(P), z));
// }

// void main() {
//   // vec2 texCoord = clampToBox(squareToTexture(poincareToKlein(
//   //   translatePToOrigin(v_texCoord, chicken_house)
//   // )));

//   // vec2 texCoord = clampToBox(poincareToTexture(
//   //   translatePToOrigin(v_texCoord, chicken_house), 4.0, 7.0
//   // ));

//   vec2 texCoord = squareToTexture(translatePToOrigin(v_texCoord, chicken_house) * 3.0);
  
//   outColor = texture(u_image, vec2(texCoord.x, 1. - texCoord.y));
// }
// `;

//******************************************************************************//

/* Library functions from the poincaré tiling thingy */

const EPSILON = 0.000001;

function sortCounterclockwise(points) {
  // this can likely be simplified to checking whether the difference of the args is
  // greater / less than pi but the goal now is to get it working.
  const cent = Euclid.centroid(points);
  const f = (A, B) => {
    const originA = A.sub(cent), originB = B.sub(cent);
    const reverseAngle = -originA.arg();
    // transform so A is on the positive x axis (arg 0)
    const B2 = originB.rotate(reverseAngle);
    return B2.arg() <= Math.PI;
  }
  return points.slice().sort(f);
}

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
    fetch("http://localhost:8000/shaders/tiling_vert_shader.vert").then((res) => res.text()),
    fetch("http://localhost:8000/shaders/tiling_frag_shader.frag").then((res) => res.text())
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
// image.src = "https://i.imgur.com/Xm7kWSc.png"; // grid
image.src = "https://i.imgur.com/EjmBVc5.png"; // cat with border

function render(image, vertexShaderSource, fragmentShaderSource) {

  const N = 250;
  // const triangles = hyperbolicPolygonTris(12, 12, N, 0);
  // const triangles = hyperbolicPolygonTris(12, 12, N, 0, complex(0.0, 0.0));
  const p=4;
  const q=7;
  const triangles = generatePQTessellation(p, q);
  console.log("tiling generation complete", p, q);

  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  // setup GLSL program
  let program = webglUtils.createProgramFromSources(gl,
      [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  let positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  let texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

  // lookup uniforms
  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  let imageLocation = gl.getUniformLocation(program, "u_image");

  // Create a vertex array object (attribute state)
  let vao = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Create a buffer and put a single pixel space rectangle in
  // it (2 triangles)
  let positionBuffer = gl.createBuffer();

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  let size = 4;          // 2 components per iteration
  let type = gl.FLOAT;   // the data is 32bit floats
  let normalize = false; // don't normalize the data
  let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  let offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

  // provide texture coordinates for the rectangle.
  let texCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

  // const coords = [];
  // for (let i=0; i<triangles.triangles.length; i++) {
  //   coords.push((triangles.triangles[i] + 1) / 2);
  // }

  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  //     0.0,  0.0,
  //     1.0,  0.0,
  //     0.0,  1.0,
  //     0.0,  1.0,
  //     1.0,  0.0,
  //     1.0,  1.0,
  // ]), gl.STATIC_DRAW);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles.trianglesWithoutCenter), gl.STATIC_DRAW);

  // Turn on the attribute
  gl.enableVertexAttribArray(texCoordAttributeLocation);

  // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
  size = 2;          // 2 components per iteration
  type = gl.FLOAT;   // the data is 32bit floats
  normalize = false; // don't normalize the data
  stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
      texCoordAttributeLocation, size, type, normalize, stride, offset);

  // Create a texture.
  let texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat at the edges
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  let mipLevel = 0;               // the largest mip
  let internalFormat = gl.RGBA;   // format we want in the texture
  let srcFormat = gl.RGBA;        // format of data we are supplying
  let srcType = gl.UNSIGNED_BYTE; // type of data we are supplying
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

  // Tell the shader to get the texture from texture unit 0
  gl.uniform1i(imageLocation, 0);

  // Bind the position buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, triangles.triangles, gl.STATIC_DRAW);

  let primitiveType = gl.TRIANGLES;
  offset = 0;
  gl.drawArrays(primitiveType, offset, triangles.count);
}

class HyperbolicPolygon {

	constructor(vertices) {
		// this.vertices = sortCounterclockwise(vertices.slice());
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

  for (let i=0; i<p; i++) {
    angle = 2 * i * PI / p;
    vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d));
  }

  const initial = new HyperbolicPolygon(vertices);
  polygons.push(initial);
  const centroidTable = new Map();
  centroidTable.set(initial.hash(), 1);

  // let iterations = 12-p;
  let iterations=4;
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
  // const T = linspace(0, 1, 300);
  const polyData = Poincare.polygon(300, vertices);
  polyData.push(polyData[0]);
  // for (let i=0; i<polyData.length-1; i++) {
  //   polyData[i] = polyData[i];
  // }

  const triangleVertices = [];
  const trisWC = [];
  for (let i=0; i<polyData.length-1; i++) {
    // const triCenter = Euclid.centroid([polyData[i], centroid, polyData[i+1]]);
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


// function hyperbolicPolygonTris(p, q, N=100, startingAngle=0, tessellationCenter=null) {
//   if (tessellationCenter === null) tessellationCenter = complex(0, 0);

//   const pixelTransform = (z) => {
//     return Poincare.translateOriginToP(z, tessellationCenter);
//   }

//   let angle, vertices = [];
//   const d = Poincare.regPolyDist(p, q);
//   for (let i=0; i<p; i++) {
//     angle = 2 * i * Math.PI / p + startingAngle;
//     vertices.push(complex(Math.cos(angle), Math.sin(angle)).scale(d))
//   }
//   const euclideanCentroid = pixelTransform(Euclid.centroid(vertices));
//   const T = linspace(0, 1, N);
//   const polyData = Poincare.polygon(T, vertices);
//   polyData.push(polyData[0]);
//   for (let i=0; i<polyData.length-1; i++) {
//     polyData[i] = pixelTransform(polyData[i]);
//   }

//   const triangleVertices = [];
//   for (let i=0; i<polyData.length-1; i++) {
//     triangleVertices.push(polyData[i].re);
//     triangleVertices.push(polyData[i].im);

//     triangleVertices.push(euclideanCentroid.re);
//     triangleVertices.push(euclideanCentroid.im);

//     triangleVertices.push(polyData[i+1].re);
//     triangleVertices.push(polyData[i+1].im);
//   }
//   const triangles = new Float32Array(triangleVertices);

//   return {
//     "triangles": triangles,
//     "count": triangles.length / 2,
//   };
// }
