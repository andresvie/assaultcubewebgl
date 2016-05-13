precision mediump float;

uniform sampler2D textureImage;
varying vec2 textureCorOut;
varying vec4 ambientComponentOut;

void main()
{
    float scaleColor = 1.0/255.0;
    vec4 color = ambientComponentOut * scaleColor;
    vec4 finalColor = texture2D(textureImage, textureCorOut) * color;
    gl_FragColor = finalColor;
}