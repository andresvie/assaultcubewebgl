function createTextureAndActiveFromImage(image, webgl) {

    var texture = webgl.createTexture();
    bindTexture(texture, webgl);
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 1);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, image);
    webgl.generateMipmap(webgl.TEXTURE_2D);
    return texture;
}

function createTextureNPOTAndActiveFromImage(image, webgl) {
    var texture = webgl.createTexture();
    bindNPOTTexture(texture, webgl);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, image);
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 1);
    return texture;
}


function bindTexture(texture, webgl)
{
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.GL_LINEAR_MIPMAP_NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.REPEAT);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.REPEAT);

}

function bindNPOTTexture(texture, webgl)
{
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
}

