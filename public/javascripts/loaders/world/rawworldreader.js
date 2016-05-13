function readRawWorld(rawWorld) {
    var world = {};
    var dataViewRawWorld = new DataView(rawWorld);
    var texturesWithOffset = readTextureEntry(dataViewRawWorld);
    world["textures"] = texturesWithOffset[0];
    var textureEndOffset = texturesWithOffset[1];
    world["sections"] = readWorldSections(dataViewRawWorld, textureEndOffset);
    return world;

}


function readWorldSections(rawWorld, textureEndOffset) {
    var numberOfWorldSections = rawWorld.getUint32(textureEndOffset);
    var worldSections = [];
    var nextWorldSectionOffset = textureEndOffset + 4;
    for (var i = 0; i < numberOfWorldSections; i++) {
        var worldSectionWithNextWorldSectionOffset = readWorldSection(rawWorld, nextWorldSectionOffset);
        var worldSection = worldSectionWithNextWorldSectionOffset[0];
        nextWorldSectionOffset = worldSectionWithNextWorldSectionOffset[1];
        worldSections.push(worldSection);
    }
    return worldSections;
}

function readWorldSection(rawWorld, boxOffset) {
    var worldSection = {};
    var numberOfDrawCalls = rawWorld.getUint32(boxOffset);
    var meshSize = rawWorld.getUint32(boxOffset + 4);
    var boxLimitOffset = boxOffset + 8;
    var drawCallsOffset = boxLimitOffset + 24;
    var meshOffset = drawCallsOffset + (numberOfDrawCalls * 12);
    var nextWorldSectionOffset = meshOffset + (meshSize * 4);
    worldSection["limit"] = readBoxLimit(rawWorld, boxLimitOffset);
    worldSection["drawCalls"] = readDrawCalls(rawWorld, numberOfDrawCalls, drawCallsOffset);
    worldSection["mesh"] = readMesh(rawWorld, meshSize, meshOffset);
    return [worldSection, nextWorldSectionOffset];
}

function readMesh(rawWorld, numberOfMeshItems, meshOffset) {
    var meshBuffer = new Float32Array(numberOfMeshItems);
    var nextMeshItemOffset = meshOffset;
    for (var i = 0; i < numberOfMeshItems; i++) {
        meshBuffer[i] = rawWorld.getFloat32(nextMeshItemOffset);
        nextMeshItemOffset += 4;
    }
    return meshBuffer;
}

function readDrawCalls(rawWorld, numberOfDrawCalls, drawCallsOffset) {
    var drawCalls = [];
    var nextDrawCallsOffset = drawCallsOffset;
    for (var i = 0; i < numberOfDrawCalls * 3; i += 3) {
        var textureId = rawWorld.getUint32(nextDrawCallsOffset);
        var offsetVertex = rawWorld.getUint32(nextDrawCallsOffset + 4);
        var numberOfVertices = rawWorld.getUint32(nextDrawCallsOffset + 8);
        drawCalls.push([textureId, offsetVertex, numberOfVertices]);
        nextDrawCallsOffset += 12;
    }
    return drawCalls;
}

function readBoxLimit(rawWorld, boxOffset) {
    var xLimit = [rawWorld.getFloat32(boxOffset), rawWorld.getFloat32(boxOffset + 4)];
    boxOffset += 8;
    var yLimit = [rawWorld.getFloat32(boxOffset), rawWorld.getFloat32(boxOffset + 4)];
    boxOffset += 8;
    var zLimit = [rawWorld.getFloat32(boxOffset), rawWorld.getFloat32(boxOffset + 4)];
    return [xLimit, yLimit, zLimit];
}

function readTextureEntry(rawWorld) {
    var textures = new Map();
    var texturesLength = rawWorld.getInt32(0);
    var textureOffset = 4;
    var textureId;
    var textureNameLength;
    var textureName;
    for (var i = 0; i < texturesLength; i++) {
        textureId = rawWorld.getUint32(textureOffset);
        textureNameLength = rawWorld.getUint32(textureOffset + 4);
        textureName = getStringFromBuffer(rawWorld, textureOffset + 8, textureNameLength);
        textureOffset += 8 + textureNameLength;
        textures.set(textureId, textureName);
    }
    return [textures, textureOffset];
}


function getStringFromBuffer(buffer, index, length) {
    var text = "";
    for (var i = 0; i < length; i++) {
        if (buffer.getInt8(i + index) == 0) {
            break;
        }
        text += String.fromCharCode(buffer.getInt8(i + index));
    }
    return text;
}
