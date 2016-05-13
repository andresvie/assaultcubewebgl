precision mediump float;
uniform sampler2D textureImage;
varying vec2 textureCorOut;
void main()
{
    vec4 finalColor = texture2D(textureImage, vec2(textureCorOut.s, textureCorOut.t));
    gl_FragColor = finalColor;
}