#version 300 es

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