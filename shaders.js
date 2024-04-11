"use strict";

let vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec4 a_position;
// in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;
out vec2 chicken_house;

// all shaders have a main function
void main() {

  vec2 pos = vec2(a_position[0], a_position[1]);
  vec2 cent = vec2(a_position[2], a_position[3]);

  vec2 aspect = pos * vec2(u_resolution.y / u_resolution.x, 1.0);
  gl_Position = vec4(aspect, 0, 1);

  // pass the texCoord to the fragment shader
  // The GPU will interpolate this value between points.
  v_texCoord = a_texCoord;
  // chicken_house = vec2(0,0);
  chicken_house = cent;
  // v_texCoord = vec2(0.0, 0.0);
}
`;

let fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;
in vec2 chicken_house;

// we need to declare an output for the fragment shader
out vec4 outColor;

const float pi = 3.1415926535897;
// const float[8] pValues = float[](
//   0.99999999999980993,
//   676.5203681218851,
//   -1259.1392167224028,
//   771.32342877765313,
//   -176.61502916214059,
//   12.507343278686905,
//   -0.13857109526572012,
//   9.9843695780195716e-6,
//   1.5056327351493116e-7
// );

const float[8] pValues = float[](
  676.5203681218851,
  -1259.1392167224028,
  771.32342877765313,
  -176.61502916214059,
  12.507343278686905,
  -0.13857109526572012,
  9.9843695780195716e-6,
  1.5056327351493116e-7
);

vec2 poincareToKlein(vec2 z) {
  // m0
  return z * 2.0 / (z.x * z.x + z.y * z.y + 1.0);
}

float kleinRadius(float p, float q) {
  float recipCoshA0 = sin(pi / p) * sin(pi / q) / ( cos(pi / p) * cos(pi / q) );
  return sqrt( 1.0 - recipCoshA0 * recipCoshA0 );
}

vec2 squareToTexture(vec2 z) {
  // m3
  return (z + vec2(1.0)) / 2.0;
}

vec2 clampToBox(vec2 z) {
  // m4
  return clamp(z, 0.0, 1.0);
}

vec2 complexConj(vec2 z) {
  return vec2(z.x, -z.y);
}

float normSq(vec2 z) {
  return z.x * z.x + z.y * z.y;
}

vec2 complexInv(vec2 z) {
  return complexConj(z) / normSq(z);
}

vec2 complexMult(vec2 z1, vec2 z2) {
  return vec2(z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x);
}

vec2 complexDiv(vec2 z1, vec2 z2) {
  return complexMult(z1, complexInv(z2));
}

vec2 complexExp(vec2 z) {
  return exp(z.x) * vec2(cos(z.y), sin(z.y));
}

// sin(z) = (exp(iz)-exp(-iz))/(2i)
vec2 complexSine(vec2 z) {
  return complexDiv( complexExp(complexMult(vec2(0.0, 1.0), z)) - complexExp(complexMult(vec2(0.0, -1.0), z)), vec2(0.0, 2.0) );
}

// Lanczos approximation
// https://en.wikipedia.org/wiki/Lanczos_approximation
// use of the reflection formula isn't strictly necessary for practical purposes here, but we include it for "correctness"
// vec2 complexGamma(vec2 z) {
//   if (z.x < 0.5) {
//     // gamma(1-z)gamma(z) = pi / sin(pi*z)
//     return complexDiv( vec2(pi, 0.0), complexMult(complexSine( pi * z ), complexGamma(vec2(1.) - z)) );
//   } else {
//     z = z - vec2(1.0, 0.0); // account for stupid shift by 1
//     vec2 x = vec2(pValues[0], 0);
//     for (int i=0; i<pValues.length; i++) {
//       x = x + complexDiv( vec2(pValues[i], 0.0), z + vec2(float(i), 0.0) );
//     }
//     vec2 t = z + vec2(7.5, 0); // g=7, g+0.5
//     return sqrt(2.0 * pi) * t 
//   }
// }

// no need for reflection formula (it's close enough anyway)
float gamma(float z) {
  z -= 1.0;
  float x = 0.99999999999980993; // Unnecessary precision
  for (int i = 0; i < 8; i++) {
    x += pValues[i] / (z + float(i + 1));
  }
  float t = z + 8.0 - 0.5; // g = 7
  return sqrt(2.0 * pi) * pow(t, z + 0.5) * exp(-t) * x;
}

float beta(float a, float b) {
  return (gamma(a) * gamma(b)) / gamma(a + b);
}

float nCr(float n, float k) {
  return gamma( n + 1.0 ) / (gamma( k + 1.0 ) * gamma( n - k + 1.0 ));
}

vec2 intPow(vec2 z, int power) {
  vec2 result = z;
  for (int i=1; i<power; i++) {
    result = complexMult(result, z);
  }
  return result;
}

vec2 rotate(vec2 z, float angle) {
  return complexMult(complexExp(vec2(0, angle)), z);
}

vec2 complexPow(vec2 z1, vec2 z2) {
  float sub_ang = atan(z1.y, z1.x);
  float ang = 0.5 * z2.y * log(z1.x * z1.x + z1.y * z1.y) + z2.x * sub_ang;
  float norm = exp(-z2.y * sub_ang) * pow( z1.x * z1.x + z1.y * z1.y, 0.5 * z2.x );
  return vec2( norm * cos(ang), norm * sin(ang) );
}

vec2 inverseSchwarzChristoffel(vec2 z, float p) {
  // p-gon -> disk
  float z_max = pow(beta(1.0 / p, 1.0 - 2.0 / p), p);
  float[5] taylorCoefs = float[5](0., 0., 0., 0., 0.);
  float[5] coefs = float[5](0., 0., 0., 0., 0.);
  for (int i=0; i<5; i++) {
    coefs[i] = nCr( float(i) - 1.0 + 2.0 / p, float(i) );
  }

  taylorCoefs[0] = -coefs[0];
  taylorCoefs[1] = -coefs[1] + (p + 1.0) * coefs[0] * coefs[0];
  taylorCoefs[2] = -coefs[2] + (3.0 * p + 2.0) * ( coefs[0] * coefs[1] - 0.5 * (p + 1.0) * coefs[0] * coefs[0] * coefs[0] );
  taylorCoefs[3] = -coefs[3] + (2.0 * p + 1.0) * ( 2.0 * coefs[0] * coefs[2] + coefs[1] * coefs[1] - (4.0 * p + 3.0) * (coefs[0] * coefs[0] * coefs[1] - (1.0 / 3.0) * (p + 1.0) * pow(coefs[0], 4.0) ) );
  taylorCoefs[4] = -coefs[4] + (5.0 * p + 2.0) * ( coefs[0] * coefs[3] + coefs[1] * coefs[2] + (5.0 * p + 3.0) * (-0.5 * coefs[0] * coefs[0] * coefs[2] - 0.5 * coefs[0] * coefs[1] * coefs[1] + (5.0 * p + 4.0) * (coefs[0] * coefs[0] * coefs[0] * coefs[1] / 6.0 - (p + 1.0) * pow(coefs[0], 5.0) / 24.0) ) );

  vec2 term0 = taylorCoefs[0] * intPow(z, int(p));
  vec2 term1 = taylorCoefs[1] * intPow(z, int(2.0 * p));
  vec2 term2 = taylorCoefs[2] * intPow(z, int(3.0 * p));
  vec2 term3 = taylorCoefs[3] * intPow(z, int(4.0 * p));
  vec2 term4 = taylorCoefs[4] * complexDiv( intPow(z, int(5.0 * p)), vec2(1.0, 0.0) + intPow(z, int(p)) / z_max );

  return complexMult(z, vec2(1.0, 0.0) - term0 + term1 + term2 + term3 + term4 );
}

// this is messy because we have to compute an integral
vec2 schwarzChristoffel(vec2 z, float p) {
  // disk -> p-gon
  vec2 coef = complexExp( vec2(0.0, pi / p) );
  const int steps = 1000;
  
  // compute integral
  const float step = 1.0 / float(steps);
  vec2 integral = vec2(0.0, 0.0);
  for (int i=0; i<steps+1; i++) {
    float t = step * float(i);
    integral += step * complexMult( z, complexPow( vec2(1.0, 0.0) - intPow(t * z, int(p)), vec2(-2.0 / p) ) );
  }
  return complexMult(coef, integral);
}

vec2 poincareToTexture(vec2 z, float p, float q) {
  z = rotate(z, -pi / p);
  z = poincareToKlein(z);
  z = z / kleinRadius(p, q );
  // z = z * 1.45534669023;
  // z = z * (1.0 / kleinRadius(p, q));
  z = schwarzChristoffel(z, p);
  float z_normSq = normSq(z);
  // if (z_normSq > 1.0) {
  //   z = z / sqrt(z_normSq);
  // }
  z = inverseSchwarzChristoffel(z, 4.0);
  // // z = (z + 1.0) / 2.0; // normalize to texture coordinates // might not have to do this
  z = squareToTexture(z);
  return z;
}

vec2 translatePToOrigin(vec2 z, vec2 P) {
  return complexDiv(z - P, vec2(1.0, 0.0) - complexMult(complexConj(P), z));
}

void main() {
  // vec2 texCoord = clampToBox(squareToTexture(poincareToKlein(
  //   translatePToOrigin(v_texCoord, chicken_house)
  // )));

  vec2 texCoord = clampToBox(poincareToTexture(
    translatePToOrigin(v_texCoord, chicken_house), 4.0, 7.0
  ));
  
  outColor = texture(u_image, vec2(texCoord.x, 1. - texCoord.y));
}
`;

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

class Euclid {

  /*
  Collection of Euclidean geometry functions
  */

  static lineIntersection(p1, v1, p2, v2) {
    /*
    Computes the intersection of the lines p1 + v1 * t and p2 + v2 * t.
    Returns null if the lines do not intersect.
    */
    const x1 = p1.re, y1 = p1.im;
    const x2 = p1.re + v1.re, y2 = p1.im + v1.im;
    const x3 = p2.re, y3 = p2.im;
    const x4 = p2.re + v2.re, y4 = p2.im + v2.im;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom == 0) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    return p1.add(v1.scale(t));
  }

  static midpoint(p1, p2) {
    /*
    Computes the midpoint of p1 and p2
    */
    return p1.add(p2).scale(0.5);
  }

  static circleCenter(p1, p2, p3) {
    /*
    Computes the center of the circle passing through the three points p1, p2, p3
    */
    return Euclid.lineIntersection(Euclid.midpoint(p1, p2), p2.sub(p1).perp(),
                    Euclid.midpoint(p2, p3), p3.sub(p2).perp());
  }

  static centroid(P) {
    /*
    Computes the centroid of the points in P
    */
    let xTotal = 0, yTotal = 0;
    for (let point of P) {
      xTotal += point.re;
      yTotal += point.im;
    }
    return complex(xTotal / P.length, yTotal / P.length);
  }

  static distance(p1, p2) {
    /*
    Computes the distance between p1 and p2
    */
    return p2.sub(p1).norm();
  }

  static project(p1, p2) {
    return p2.scale(p1.dot(p2) / p2.normSq());
  }

}


class Complex {

  /*
  Class for representing complex numbers of the form a + bi
  */

  static HASH_REALLENGTH = 11; // half the length of the hash of a single complex number
  static HASH_WEIGHT = 1265055685;
  static HASH_OFFSET = 81913;

  constructor(real, imaginary) {
    this.re = real;
    this.im = imaginary;
  }

  conj() {
    /* Computes the complex conjugate */
    return new Complex(this.re, -this.im);
  }

  norm() {
    /* Computes the norm (modulus), as a real number */
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  normSq() {
    /* Computes the square of the norm (modulus), as a real number */
    return this.re * this.re + this.im * this.im;
  }

  arg() {
    /*
    Computes the angle (argument), as a real number measured in radians
    0 <= arg(z) < 2 * pi
    */
    return (Math.atan2(this.im, this.re) + 2 * Math.PI) % (2 * Math.PI);
  }

  unit() {
    /* Computes a unit modulus complex number in the direction of this complex number */
    return this.scale(1 / this.norm());
  }

  scale(k) {
    /* Scales each component by the real constant k */
    return new Complex(this.re * k, this.im * k);
  }

  add(z) {
    /* Computes the sum of this complex number and z */
    return new Complex(this.re + z.re, this.im + z.im);
  }

  sub(z) {
    /* Computes the difference of this complex number and z */
    return new Complex(this.re - z.re, this.im - z.im); 
  }

  mult(z) {
    /* Computes the product of this complex number and z */
    return new Complex(this.re * z.re - this.im * z.im, this.re * z.im + this.im * z.re);
  }

  inv() {
    /* Computes the reciprocal (inverse) */
    return this.conj().scale(1 / this.normSq());
  }

  div(z) {
    /* Computes the quotient of this complex number and z */
    return this.mult(z.inv());
  }

  perp() {
    /* Computes an orthogonal complex number of the same magnitude */
    return new Complex(-this.im, this.re);
  }

  sqrt() {
    /* Computes the principal branch of the square root */
    const normSqrt = Math.sqrt(this.norm());
    const halfArg = 0.5 * this.arg();
    return new Complex(normSqrt * Math.cos(halfArg), normSqrt * Math.sin(halfArg));
  }

  square() {
    /* Computes the square */
    return new Complex(this.re * this.re - this.im * this.im, 2 * this.re * this.im);
  }

  exp() {
    /* Computes the exponential function of this complex number */
    const mag = Math.exp(this.re);
    return new Complex(mag * Math.cos(this.im), mag * Math.sin(this.im));
  }

  ln() {
    /* Computes the principal branch of the natural log */
    return new Complex(Math.log(this.norm()), this.arg());
  }

  acos() {
    /* Computes the principal branch of the inverse cosine */
    this.add(this.square().sub(new Complex(1, 0)).sqrt()).ln().div(complex(0, 1));
  }

  rotate(angle) {
    /* Computes this complex number rotated by angle radians */
    return this.mult((new Complex(0, angle)).exp());
  }

  dot(z) {
    /* Computes the Euclidean dot product of the coefficients of this complex number and z */
    return this.re * z.re + this.im * z.im;
  }

  angleTo(z) {
    /* Computes the angle between this complex number and z */
    /*
    acos u*v/uv = uvcos(t)
    */
    return Math.acos(this.dot(z) / (this.norm() * z.norm()));
  }

  toString() {
    /* Returns the string representation of the complex number as an ordered pair (re(z), im(z)) */
    return `(${this.re},${this.im})`;
  }

  equals(z) {
    /* Returns true iff z equals this complex number, exactly */
    return (this.re == z.re && this.im == z.im);
  }

  equalsEps(z) {
    /*
    Returns true iff z equals this complex number, within numerical tolerance EPSILON
    For floating point rounding purposes
    */
    return (Math.abs(this.re - z.re) < EPSILON && Math.abs(this.im - z.im) < EPSILON);
  }

  static realHash(x) {
    /*
    helper function for hash(). Returns a (non-unique) has representing the real number x
    */
    x = (x + Complex.HASH_OFFSET) * Complex.HASH_WEIGHT; // ensure e.g. 12 and 120 get different hashes
    let repr = x.toFixed(Complex.HASH_REALLENGTH); // ensure the hash is at at least the required length
    // keep decimal point, if applicable, as an extra measure to distinguish e.g. 12.5 and 1.25. i.e. do not do repr.replace(".", "")
    return repr.slice(0, Complex.HASH_REALLENGTH); // cut the hash to the required length
  }

  hash() {
    /*
    Returns a string hash representing the complex number
    This hash is by no means unique, but it should be sufficient for the purposes of this program.
    It is very unlikely that two distinct complex numbers return the same hash during execution.
    If a hash collision occurs, the program will still produce correct output, but it may experience
    performance hits.

    Obviously, it is not possible to construct an injection from C to the set of fixed length strings
    with a countable (finite) character set, so this is as good as one can expect from a hash function
    */
    // compute the hashes of the real and complex parts as real numbers
    let re = Complex.realHash(this.re), im = Complex.realHash(this.im);

    // interleave the hashes of the real and imaginary parts
    // let result = "";
    // for (let i=0; i < re.length; i++) {
    //  result += re[i];
    //  result += im[i];
    // }
    // return result;

    // concatenate the hashes of the real and imaginary parts
    return re + im;
  }

}


function complex(real, imaginary) {
  /* instantiate a Complex without new keyword */
  return new Complex(real, imaginary);
}


class Poincare {

  /* Collection of functions for computations in the poincare disk model of the hyperbolic plane */

  static translatePToOrigin(z, P) {
    /*
    Computes a mobius transformation on z that takes P to 0 and preserves the unit disk
    */
    return z.sub(P).div(complex(1, 0).sub(P.conj().mult(z)));
  }

  static translateOriginToP(z, P) {
    /*
    Computes a mobius transformation on z taking 0 to P and preserves the unit disk
    (inverse of translatePToOrigin) */
    return z.add(P).div(complex(1, 0).add(P.conj().mult(z)));
  }

  static segment(t, A, B) {
    /*
    Evaluates a parameterization of the geodesic segment between A and B at time t.
    segment(0, A, B) = A.
    segment(1, A, B) = B.
    */
    return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).scale(t), A);
  }

  static line(t, A, B) {
    /*
    Evaluates a parameterization of the geodesic through A and B at time t.
    line(0, A, B) = start of line (beginning point on circle at infinity)
    line(1, A, B) = end of line (terminal point on circle at infinity)
    Note that line(0, A, B) and line(1, A, B) are not actually points on the geodesic.
    */
    return Poincare.translateOriginToP(Poincare.translatePToOrigin(B, A).unit().scale(2 * t - 1), A); 
  }

  static regPolyDist(p, q) {
    /*
    Computes the (Euclidean) distance to vertices of a regular p-gon with interior
    angle 2*pi/q (for (p, q) tessellation).
    Note: (p-2) * (q-2) must be greater than 4
    */
    if ((p-2) * (q-2) <= 4) {
      console.error(`Error: cannot compute regular polygon distance for p=${p}, q=${q}`);
      return;
    }

    const tan1 = Math.tan(Math.PI / 2 - Math.PI / q);
    const tan2 = Math.tan(Math.PI / p);
    return Math.sqrt((tan1 - tan2) / (tan1 + tan2));
  }

  static polygon(T, verts) {
    /*
    Evaluates a parameterization of the hyperbolic polygon with given vertices at
    the times in list T.
    let n be the number of vertices.
    polygon(0, verts) = first vertex
    polygon(1 / n, verts) = second vertex
    polygon(2 / n, verts) = third vertex
    ...
    polygon(1, verts) = first vertex
    */
    if (verts.length < 2) {
      console.error("Error: cannot draw polygon with fewer than 2 points");
      return;
    }

    const result = [];
    const n = verts.length;
    verts = verts.slice();
    verts.push(verts[0]);
    let endpoint1, endpoint2, index, proportion, t;
    for (let i=0; i<T.length; i++) {
      t = T[i];
      if (t != 1) {
        index = Math.floor(n * t); // floor(t / (1/n))
        proportion = n * (t % (1 / n));
        // console.log(index, n, t);
        result.push(Poincare.segment(proportion, verts[index], verts[index + 1]));
      } else {
        result.push(verts[0]);
      }
    }
    return result;
  }

  static rotate(z, P, angle) {
    /* Computes the hyperbolic rotation of z about P by angle radians */
    return Poincare.translateOriginToP(Poincare.translatePToOrigin(z, P, true).rotate(angle), P, true);
  }

  static rotateMultiple(Z, P, angle) {
    /* Computes the hyperbolic rotation of all the points in Z about P by angle radians */
    const result = [];
    for (let vert of Z) {
      result.push(this.rotate(vert, P, angle));
    }
    return result;
  }

  static unitCircleInvert(z) {
    /* Computes the inversion of z through the unit circle */
    return z.conj().inv();
  }

  static circleInvert(z, r, P) {
    /* Computes the inversion of z through the circle of radius r centered at P */
    return P.add(complex(r * r, 0).div(z.sub(P).conj()));
  }

  static reflect(z, p1, p2) {
    /* Computes the inversion of z through the geodesic passing through p1 and p2 */
    const center = Euclid.circleCenter(p1, p2, Poincare.unitCircleInvert(p1));

    if (center == null || center.norm() > 1000) {
      // the points are presumably on a radial line through the origin
      return p1.add(Euclid.project(z.sub(p1), p2.sub(p1))).scale(2).sub(z);
    }
    return Poincare.circleInvert(z, Euclid.distance(p1, center), center);
  }

  static reflectMultiple(Z, p1, p2) {
    /* Computes the inversion of all points in Z through the geodesic passing through p1 and p2 */
    const result = [];
    for (let vert of Z) {
      result.push(this.reflect(vert, p1, p2));
    }
    return result;
  }

  static inverseCayley(z) {
    /*
    Inverse of the Cayley transform (map from upper half plane to unit disk)
    See https://en.wikipedia.org/wiki/Cayley_transform#Complex_homography
    and https://www.desmos.com/calculator/ucug6yw6bh
    */
    const one = complex(1, 0);
    return one.add(z).div(one.sub(z)).mult(complex(0, 1));
  }

  static hypDistance(z1, z2) {
    /*
    Given two points, compute the hyperbolic distance between them according to the Poincare metric
    */
    const z = z1.sub(z2);
    const euclideanDistanceToOrigin = z.norm();
    return Math.log((1 + euclideanDistanceToOrigin) / (1 - euclideanDistanceToOrigin));
  }

}



//******************************************************************************//

let image = new Image();
image.crossOrigin = "";
image.onload = function() {
  render(image);
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

function render(image) {

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
  const T = linspace(0, 1, 300);
  const polyData = Poincare.polygon(T, vertices);
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
