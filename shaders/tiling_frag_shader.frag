#version 300 es

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

  return complexMult(z, vec2(1.0, 0.0) +  term0 + term1 + term2 + term3 + term4 );
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
  z = z / kleinRadius(p, q);
  z = schwarzChristoffel(z, p);
  z = inverseSchwarzChristoffel(z, 4.0);
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

//   vec2 texCoord = squareToTexture(translatePToOrigin(v_texCoord, chicken_house) * 3.0);
  
  outColor = texture(u_image, vec2(texCoord.x, 1. - texCoord.y));
}