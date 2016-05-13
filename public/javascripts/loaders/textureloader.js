function loadTextures(textures, onTexturesCompleted, onTextureFail) {
    var texturesCompleted = {};
    var onError = function () {
        var url = this.src;
        onTextureFail(url);
    };
    for (var i = 0; i < textures.length; i++) {
        var img = new Image();
        img.onload = onTextureCompleted.bind(img, textures.length, texturesCompleted, onTexturesCompleted);
        img.onerror = onError;
        img.src = textures[i];
    }
}

function onTextureCompleted(numberOfTexture, texturesCompleted, onTexturesCompleted) {
    texturesCompleted[this.src.replace(window.location.href, "")] = this;
    if (numberOfTexture != Object.keys(texturesCompleted).length) {
        return;
    }
    onTexturesCompleted(texturesCompleted);
}
