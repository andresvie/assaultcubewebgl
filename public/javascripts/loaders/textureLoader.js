function loadTextures(textures, onTexturesCompleted, onTextureFail)
{
    var texturesCompleted = {};
    var onError = function()
    {
        var url = this.src;
        onTextureFail(url);
    };
    var textureComplete = onTextureCompleted.bind({}, textures.length, texturesCompleted, onTexturesCompleted);
    for (var i = 0; i < textures.length; i++) {
        var img = new Image();
        img.onload = textureComplete;
        img.onerror = onError;
    }
}

function onTextureCompleted(numberOfTexture, texturesCompleted, onTexturesCompleted) {
    texturesCompleted[this.src] = this;
    if (numberOfTexture != Object.keys(texturesCompleted)) {
        return;
    }
    onTexturesCompleted(texturesCompleted);
}
