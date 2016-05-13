var GUN_FRAGMENT_SHADER = "fragmentShader";
var GUN_VERTEX_SHADER = "vertexShader";
var GUN_LIST = "guns";
var GUN_MODEL_PATH = "path";
function loadGuns(gunDownloadDescriptor, onGunsLoad, onError) {
    var gunsWithModelPaths = getGunsModelPathMapping(gunDownloadDescriptor[GUN_LIST]);
    var gunModelsPaths = gunsWithModelPaths[1];
    var guns = gunsWithModelPaths[0];
    var fragmentShaderPath = gunDownloadDescriptor[GUN_FRAGMENT_SHADER];
    var vertexShaderPath = gunDownloadDescriptor[GUN_VERTEX_SHADER];
    var shader = [fragmentShaderPath, vertexShaderPath];
    for (var i = 0; i < gunModelsPaths.length; i++) {
        var modelPath = gunModelsPaths[i];
        var onLoad = onGunLoad.bind(this, guns, onGunsLoad, modelPath);
        loadMD3Model(gunModelsPaths[i], onLoad);
    }
    loadTextResources(shader, onGunShaderLoad.bind(this, guns, fragmentShaderPath, vertexShaderPath, onGunsLoad), onError);
}

function onGunLoad(guns, onGunsLoad, gunModelPath, gun) {
    guns["gunsLoaded"] += 1;
    var gunName = guns[gunModelPath]["name"];
    var currentGun = {};
    currentGun[gunName] = gun;
    guns["guns"].push(currentGun);
    if (guns["gunsLoaded"] == guns["numberOfGuns"] && guns["isShaderLoaded"]) {
        onGunsLoad(createGuns(guns));
    }
}

function onGunShaderLoad(guns, fragmentShaderPath, vertexShaderPath, onGunsLoad, resource) {
    guns[GUN_FRAGMENT_SHADER] = resource[fragmentShaderPath];
    guns[GUN_VERTEX_SHADER] = resource[vertexShaderPath];
    guns["isShaderLoaded"] = true;
    if (guns["gunsLoaded"] == guns["numberOfGuns"]) {
        onGunsLoad(createGuns(guns));
    }
}

function getGunsModelPathMapping(gunsModelPath) {
    var guns = {"gunsLoaded": 0, "isShaderLoaded": false, "guns": []};
    var gunsPaths = [];

    for (var gunName in gunsModelPath) {
        var gunModelPath = gunsModelPath[gunName][GUN_MODEL_PATH];
        guns[gunModelPath] = {"name": gunName};
        gunsPaths.push(gunModelPath);
    }
    guns["numberOfGuns"] = gunsPaths.length;
    return [guns, gunsPaths];
}


function createGuns(gunsAux) {
    var guns = {};
    guns["guns"] = gunsAux["guns"];
    guns["shader"] = {};
    guns["shader"][GUN_FRAGMENT_SHADER] = gunsAux[GUN_FRAGMENT_SHADER];
    guns["shader"][GUN_VERTEX_SHADER] = gunsAux[GUN_VERTEX_SHADER];
    return guns;
}