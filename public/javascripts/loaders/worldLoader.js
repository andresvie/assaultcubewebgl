function loadWord(onFinishLoadWorld) {
    loadJSonResources(["/world/world_draw_calls.json", "/world/world.json", "/world/world.physic.json"], function (world_data)
    {
        var drawCalls = world_data[0];
        var triangleBuffer = world_data[1];
        var worldPhysic = world_data[2];
        var textureNames = getImageNamesFromDrawCalls(drawCalls);
        triangleBuffer = new Float32Array(triangleBuffer);
        downloadImages(textureNames, function(imageDownloaded)
        {
            onFinishLoadWorld(drawCalls, triangleBuffer, textureNames, imageDownloaded, worldPhysic);
        });

    });
}

function downloadImages(imageNames, onImageDownloaded) {
    var imagesDownloaded = 0;
    var imageDownloaded = {};
    for (var i = 0; i < imageNames.length; i++) {
        loadImage(imageNames[i], function(image, imageName)
        {
            imagesDownloaded += 1;
            imageDownloaded[imageName] = image;
            if(imagesDownloaded == imageNames.length)
            {
                onImageDownloaded(imageDownloaded);
            }
        })
    }
}

function getImageNamesFromDrawCalls(drawCalls) {
    var textures = [];
    for (var textureName in drawCalls) {
        textures.push(textureName);
    }
    return textures;
}
