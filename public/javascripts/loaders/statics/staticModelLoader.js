function loadStaticsModels(staticModelsDescriptors, onComplete, onError) {
    var fragmentShaderPath = staticModelsDescriptors[FRAGMENT_FIELD_NAME];
    var vertexShaderPath = staticModelsDescriptors[VERTEX_FIELD_NAME];
    var shaderToDownload = [fragmentShaderPath, vertexShaderPath];
    var staticModelsToDownload = staticModelsDescriptors["models"];
    loadTextResources(shaderToDownload, function (shaders) {
        var staticModels = {};
        staticModels["models"] = [];
        staticModels[FRAGMENT_FIELD_NAME] = shaders[fragmentShaderPath];
        staticModels[VERTEX_FIELD_NAME] = shaders[vertexShaderPath];
        for (var i = 0; i < staticModelsToDownload.length; i++) {
            var staticModelRequest = staticModelsToDownload[i];
            var onLoad = onLoadStaticModel.bind(null, staticModelRequest, staticModels, staticModelsToDownload.length, onComplete);
            loadMD3Model(staticModelRequest, onLoad, onError);
        }
    });
}

function onLoadStaticModel(staticModelRequest, staticModels, numberOfRequest, onComplete, staticModel) {
    staticModel["transforms"] = getTransforms(staticModelRequest);
    staticModels["models"].push(staticModel);
    if (numberOfRequest == staticModels["models"].length) {
        onComplete(staticModels);
    }
}

function getTransforms(staticModelRequest) {
    var transforms = staticModelRequest["transforms"];
    if (staticModelRequest["name"] == "streetlamp" || staticModelRequest["name"] == "strahler") {
        for (var i = 0; i < transforms.length; i++) {
            var transform = transforms[i];
            transform[3] -= 180;
        }
    }
    return transforms;
}