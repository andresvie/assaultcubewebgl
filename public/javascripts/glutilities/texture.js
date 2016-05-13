function createTextures(images, webgl) {
    var textures = {};
    var image;
    var texture;
    for (var imageName in images) {
        image = images[imageName];
        texture = createTextureAndActiveFromImage(image, webgl);
        textures[imageName] = texture;
    }
    return textures;
}
function createTextureAndActiveFromImage(image, webgl) {
    var texture = webgl.createTexture();
    bindTexture(texture, webgl);
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 1);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, image);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
    return texture;
}

function createTextureNPOTAndActiveFromImage(image, webgl) {
    var texture = webgl.createTexture();
    bindNPOTTexture(texture, webgl);
    webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, image);
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, 1);
    return texture;
}


function bindTexture(texture, webgl) {
    webgl.activeTexture(webgl.TEXTURE0);
    webgl.bindTexture(webgl.TEXTURE_2D, texture);


}

function bindNPOTTexture(texture, webgl) {
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
    webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
}

