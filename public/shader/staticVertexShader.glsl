uniform mediump mat4 model;
uniform mediump mat4 viewProjection;
attribute vec3 pos;
attribute vec2 textureCor;
varying vec2 textureCorOut;
void main()
{
    //vec4 position = vec4(pos.x * 0.1, pos.y * 0.1, pos.z * 0.1,  1.0);
    vec4 position = vec4(pos,  1.0);
    position = viewProjection * model *  position;
    gl_Position = position;
    textureCorOut = textureCor;
}
