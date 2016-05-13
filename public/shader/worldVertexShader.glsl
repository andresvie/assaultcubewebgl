uniform mediump mat4 viewProjection;
attribute vec3 pos;
attribute vec2 textureCor;
attribute vec4 ambientComponent;
varying vec2 textureCorOut;
varying vec4 ambientComponentOut;
void main() {
    vec4 position = vec4(pos, 1.0);
    position = viewProjection   *  position;
    gl_Position = position;
    textureCorOut = textureCor;
    ambientComponentOut = ambientComponent;
}