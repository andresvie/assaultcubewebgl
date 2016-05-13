var MODEL_PATH = "model";
var TEXTURE_PATH = "texture";
var INDEX_PATH = "index";
var DRAW_CALL_PATH = "drawCalls";
var MD3_MESH_NAME = "name";

function loadMD3Model(modelRequest, onLoad, onError) {
    var pathModel = modelRequest[MODEL_PATH];
    var request = new XMLHttpRequest();
    request.open("GET", pathModel, true);
    request.responseType = "arraybuffer";
    request.onload = onLoadMD3Model.bind(request, modelRequest, onLoad, onError);
    request.send(null);
}

function onLoadMD3Model(modelRequest, onLoad, onError) {
    var frames = readMD3Model(this.response);
    loadMD3Texture(modelRequest, frames, onLoad, onError);
}

function loadMD3Texture(modelRequest, frames, onLoad, onError) {
    var texturePath = modelRequest[TEXTURE_PATH];
    var texture = new Image();
    texture.onload = function () {
        loadIndexAndDrawCalls(modelRequest, frames, texture, onLoad, onError);
    };
    texture.onerror = function () {
        onError("Error Loading Texture " + texturePath);
    };
    texture.src = texturePath;
}

function loadIndexAndDrawCalls(modelRequest, frames, texture, onLoad, onError) {
    var indexPath = modelRequest[INDEX_PATH];
    var drawCallsPath = modelRequest[DRAW_CALL_PATH];
    loadMD3IndexAndDrawCalls(indexPath, drawCallsPath, function (index, drawCalls) {
        var name = modelRequest[MD3_MESH_NAME];
        var mesh = frames[name];
        var buffers = createBufferFromMeshAndIndexFile(mesh, index);
        var model = {
            "numOfTriangle": mesh.header.numtriangles,
            "buffer": buffers,
            "texture": texture,
            "drawCalls": drawCalls
        };
        onLoad(model);
    });

}

function loadMD3IndexAndDrawCalls(indexPath, drawCallsPath, onLoadIndex) {
    loadJSonResources([indexPath, drawCallsPath], function (resources) {
        var indexList = resources[indexPath];
        var drawCalls = resources[drawCallsPath];
        onLoadIndex(indexList, drawCalls);
    });
}


function createBufferFromMeshAndIndexFile(mesh, indexFile) {
    var uvList = mesh["uv"];
    var vertexList = mesh["vertex"];
    var buffer = [];
    var begin = 0;
    var last = mesh.header.numvertices;
    for (var i = begin; i < last; i++) {
        Array.prototype.push.apply(buffer, vertexList[i]);
        Array.prototype.push.apply(buffer, uvList[i - begin]);
    }
    return {"index": new Uint16Array(indexFile), "mesh": new Float32Array(buffer)};
}
