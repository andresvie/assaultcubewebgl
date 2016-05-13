var RAW_WORLD_FIELD_NAME = "raw";
var WORLD_SECTIONS_FIELD_NAME = "sections";
var GUNS_FIELD_NAME = "guns";
var PHYSIC_FIELD_NAME = "physic";
var TEXTURES_FIELD_NAME = "textures";
var VERTEX_FIELD_NAME = "vertexShader";
var FRAGMENT_FIELD_NAME = "fragmentShader";
var STATICS_MODELS = "statics";
var WORLD_TEXTURE_PREFIX = "images/worldtexture/";

function loadWorld(worldDownloaderDescriptor, onWorldLoaded) {

    var rawWorld = worldDownloaderDescriptor[RAW_WORLD_FIELD_NAME];
    var physicPath = worldDownloaderDescriptor[PHYSIC_FIELD_NAME];
    var fragmentShaderPath = worldDownloaderDescriptor[FRAGMENT_FIELD_NAME];
    var vertexShaderPath = worldDownloaderDescriptor[VERTEX_FIELD_NAME];
    var shaderToDownload = [fragmentShaderPath, vertexShaderPath];
    var jsonToDownload = [physicPath];
    var staticsModelRequests = worldDownloaderDescriptor["statics"];
    var world = {};
    var physicJsonDone = onLoadPhysicDone.bind({}, world, worldDownloaderDescriptor, onWorldLoaded);
    var loadShaderDone = onLoadWorldShaderDone.bind({}, world, worldDownloaderDescriptor, onWorldLoaded);
    var loadWorldDone = onLoadWorldDone.bind({}, world, worldDownloaderDescriptor, onWorldLoaded);
    var loadStaticsDone = onLoadStaticModels.bind({}, world, onWorldLoaded);
    loadJSonResources(jsonToDownload, physicJsonDone);
    loadTextResources(shaderToDownload, loadShaderDone);
    loadBinaryResources([rawWorld], loadWorldDone);
    loadStaticsModels(staticsModelRequests, loadStaticsDone);
}

function onLoadStaticModels(world, onWorldLoaded, statics) {
    world[STATICS_MODELS] = statics;
    if (isWorldDownload(world)) {
        onWorldLoaded(world);
    }
}

function onWorldLoadGuns(world, onWorldLoaded, guns) {
    world[GUNS_FIELD_NAME] = guns;
    if (isWorldDownload(world)) {
        onWorldLoaded(world);
    }
}

function onLoadPhysicDone(world, worldDownloaderDescriptor, onWorldLoaded, response) {
    var physicPath = worldDownloaderDescriptor[PHYSIC_FIELD_NAME];
    world[PHYSIC_FIELD_NAME] = response[physicPath];
    if (isWorldDownload(world)) {
        onWorldLoaded(world);
    }
}

function onLoadWorldDone(world, worldDownloaderDescriptor, onWorldLoaded, response) {
    var rawWorldPath = worldDownloaderDescriptor[RAW_WORLD_FIELD_NAME];
    var rawWorld = response[rawWorldPath];
    var worldWithTextureAndSections = readRawWorld(rawWorld);
    var textures = getTexturesPathsFromWorld(worldWithTextureAndSections);
    var texturesPaths = textures[1];
    var texturesPathsMapping = textures[0];
    var texturesImages = new Map();
    loadTextures(texturesPaths, function (texturesResponse) {
        for (var textureId of texturesPathsMapping.keys()) {
            var texturePath = texturesPathsMapping.get(textureId);
            var texture = texturesResponse[texturePath];
            texturesImages.set(textureId, texture);
        }
        world[WORLD_SECTIONS_FIELD_NAME] = worldWithTextureAndSections[WORLD_SECTIONS_FIELD_NAME];
        world[TEXTURES_FIELD_NAME] = texturesImages;
        if (isWorldDownload(world)) {

            onWorldLoaded(world);
        }
    });

}

function onLoadWorldShaderDone(world, worldDownloaderDescriptor, onWorldLoaded, shaders) {
    var fragmentShaderPath = worldDownloaderDescriptor[FRAGMENT_FIELD_NAME];
    var vertexShaderPath = worldDownloaderDescriptor[VERTEX_FIELD_NAME];
    world[FRAGMENT_FIELD_NAME] = shaders[fragmentShaderPath];
    world[VERTEX_FIELD_NAME] = shaders[vertexShaderPath];
    if (isWorldDownload(world)) {
        onWorldLoaded(world);
    }
}


function getTexturesPathsFromWorld(world) {
    var textures = world[TEXTURES_FIELD_NAME];
    var texturesPathMapping = new Map();
    var texturePaths = [];
    var texturesIds = textures.keys();
    for (var textureId of texturesIds) {
        var textureName = textures.get(textureId);
        var texturePath = WORLD_TEXTURE_PREFIX + textureName;
        texturesPathMapping.set(textureId, texturePath);
        texturePaths.push(texturePath);
    }
    return [texturesPathMapping, texturePaths];
}

function isWorldDownload(world) {
    var isLoaded = world[PHYSIC_FIELD_NAME] && world[FRAGMENT_FIELD_NAME] && world[TEXTURES_FIELD_NAME];
    return isLoaded && world[STATICS_MODELS];
}