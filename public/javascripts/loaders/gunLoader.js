function loadGuns(guns, onGunsLoadCompleted, onGunsLoadError)
{
    var gunResourcesCompleted = {};
    var texturesPath = getTexturesPathFromGuns(guns);
    var md3ModelsPath = getMD3ModelsPathFromGuns(guns);
    var loadGunTextures = onLoadGunResource.bind({}, "textures", guns, onGunsLoadCompleted, gunResourcesCompleted);
    var loadGunModels = onLoadGunResource.bind({}, "models", guns, onGunsLoadCompleted, gunResourcesCompleted);
    loadTextures(texturesPath, loadGunTextures, onGunsLoadError);
    loadBinaryResources(md3ModelsPath, loadGunModels, onGunsLoadError);
}

function onLoadGunResource(gunResourceType, guns, onGunsLoadCompleted, gunResourcesCompleted, gunResource) {
    gunResourcesCompleted[gunResourceType] = gunResource;
    if (Object.keys(gunResourcesCompleted).length != 2) {
        return;
    }
    var gunsResponse = createGunsResponse(gunResourcesCompleted, guns);
    onGunsLoadCompleted(gunsResponse);
}


function getTexturesPathFromGuns(guns) {
    var textures = [];
    for (var gunName in guns) {
        textures.push(guns[gunName].handTexture);
        textures.push(guns[gunName].gunTexture);
    }
    return textures;
}

function getMD3ModelsPathFromGuns(guns) {
    var modelsPath = [];
    for (var gunName in guns) {
        modelsPath.push(guns[gunName].hand);
        modelsPath.push(guns[gunName].gun);
    }
    return modelsPath;
}


function createGunsResponse(gunsLoaderInfo, guns) {
    var gunsResponse = {};
    for(var gun in guns)
    {
        gunsResponse[gun] = createGunResponse(gunsLoaderInfo, guns[gun]);
    }
    return gunsResponse;
}


function createGunResponse(gunsLoaderInfo, gun)
{

    var gunResponse = {};
    gunResponse["handTexture"] = gunsLoaderInfo.textures[gun.handTexture];
    gunResponse["gunTexture"] = gunsLoaderInfo.textures[gun.gunTexture];
    gunResponse["gunModel"] = gunsLoaderInfo.models[gun.gun];
    gunResponse["handModel"] = gunsLoaderInfo.models[gun.hand];
    return gunResponse;
}