precision mediump float;

uniform sampler2D textureImage;
varying vec2 textureCorOut;
varying vec4 ambientComponentOut;

void main()
{
    vec4 color = ambientComponentOut;
    textureCor.s = textureCorOut.s;
    textureCor.t = textureCorOut.t;
    vec4 finalColor = texture2D(text.textureImage, textureCor) * color;
    gl_FragColor = finalColor;
}