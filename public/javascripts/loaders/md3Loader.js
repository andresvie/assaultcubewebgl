
function loadMD3Model(pathModel, onLoad) {
    var modelRequest = new XMLHttpRequest();
    modelRequest.open("GET", pathModel, true);
    modelRequest.responseType = "arraybuffer";
    var loadModel = onLoadMD3Model.bind(modelRequest, modelName, onLoad);
    modelRequest.onload = loadModel;
    modelRequest.send(null);
}

function onLoadMD3Model(modelName, onLoad)
{
    var frames = readMD3Model(this.response);
    var loadTexture = onLoadTexture.bind(null, frames, modelName, onLoad);
    loadMD3Texture(modelName, loadTexture)
}

function onLoadTexture(frames, modelName, onLoad, texture)
{
    var loadIndexAndDrawCallsCallBack = onLoadIndexAndDrawCalls.bind(null, frames, texture, onLoad);
    loadIndexAndDrawCalls(modelName, loadIndexAndDrawCallsCallBack);
}

function loadMD3Texture(modelName, onTexture) {
    var textureHandPath =MODEL_PATH + modelName + "/hands.jpg";
    var textureWeaponPath =MODEL_PATH + modelName + "/weapon.jpg";
    var textureHand = new Image();
    var textureWeapon = new Image();
    textureHand.onload = function()
    {
        textureWeapon.src = textureWeaponPath;
        textureWeapon.onload = function()
        {
            onTexture({"hand":textureHand, "weapon":textureWeapon});
        };
        textureWeapon.onerror = function()
        {
            throw new Error("Error Loading Texture " + textureWeaponPath);
        };
    };
    textureHand.onerror = function()
    {
        throw new Error("Error Loading Texture " + textureHandPath);
    };
    textureHand.src = textureHandPath;
}

function loadIndexAndDrawCalls(modelName, onLoadIndex)
{
    var handPath = MODEL_PATH + modelName + "/hands";
    var weaponPath = MODEL_PATH + modelName + "/weapon";
    loadMD3IndexAndDrawCalls(handPath, function(handIndex, handDrawCalls)
    {
        loadMD3IndexAndDrawCalls(weaponPath, function(weaponIndex, weaponDrawCalls)
        {
            var indexAndDrawCalls = {};
            indexAndDrawCalls["hand"] = {"index":handIndex, "drawCalls": handDrawCalls};
            indexAndDrawCalls["weapon"] = {"index":weaponIndex, "drawCalls": weaponDrawCalls};
            onLoadIndex(indexAndDrawCalls);
        });
    });

}

function loadMD3IndexAndDrawCalls(partName, onLoadIndex)
{
    var indexPath =  partName + ".index.json";
    var drawCallsPath =  partName + ".draw.json";
    $.get(indexPath, function(indexList)
    {
        $.get(drawCallsPath, function(drawCalls)
        {
            onLoadIndex(indexList, drawCalls);
        }).fail(function()
        {
            throw new Error("Can Not Load Draw Calls File " + drawCallsPath);
        });

    }).fail(function()
    {
        throw new Error("Can Not Load Index File " + indexPath);
    });
}

function onLoadIndexAndDrawCalls(frames, textures, onLoad, indexAndDrawCalls)
{
    var handMesh = frames.hands;
    var weaponMesh = frames.weapon;
    var handBuffers = createBufferFromMeshAndIndexFile(handMesh, indexAndDrawCalls.hand.index);
    var weaponBuffers = createBufferFromMeshAndIndexFile(weaponMesh, indexAndDrawCalls.weapon.index);
    var model = {};
    model["hand"] ={"numOfTriangle":handMesh.header.numtriangles, "buffer":handBuffers, "texture":textures.hand, "drawCalls":indexAndDrawCalls.hand.drawCalls};
    model["weapon"] ={"numOfTriangle":weaponMesh.header.numtriangles,"buffer":weaponBuffers, "texture":textures.weapon, "drawCalls":indexAndDrawCalls.weapon.drawCalls};
    onLoad(model);
}

function createBufferFromMeshAndIndexFile(mesh, indexFile) {
    var uvList = mesh["uv"];
    var vertexList = mesh["vertex"];
    var buffer = [];
    var begin = 0;
    var last = mesh.header.numvertices;
    for (var i = begin; i <last; i++)
    {
        Array.prototype.push.apply(buffer, vertexList[i]);
        Array.prototype.push.apply(buffer, uvList[i - begin]);
    }
    return {"index": new Uint16Array(indexFile), "mesh":new Float32Array(buffer)};
}
