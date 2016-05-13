uniform mediump mat4 model;
uniform mediump mat4 view;
uniform mediump mat4 projection;
attribute vec3 pos;
attribute vec2 textureCor;
varying vec2 textureCorOut;

void main() {
    vec4 position = vec4(pos, 1.0);
    position = projection * view * model *  position;
    gl_Position = position;
    textureCorOut = textureCor;
}