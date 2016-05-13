$(document).ready(function () {
    loadMD3Model("pistol", function (gunModel) {
        loadWord(function (drawCalls, triangleBuffer, textureNames, imageDownloaded, worldPhysic)
        {
            loadShader(triangleBuffer, drawCalls, imageDownloaded, worldPhysic, gunModel);
        });
    });
});


function loadShader(triangleBuffer, drawCalls, imageDownloaded, worldPhysic, gunModel) {
    loader_shader("planeWorld", function (worldVertex, worldFragment) {
        loader_shader("gun", function (gunVertex, gunFragment) {
            loader_shader("worldInfo", function (worldInfoVertex, worldInfoFragment) {
                createScene(triangleBuffer, worldVertex, worldFragment, drawCalls, imageDownloaded, worldPhysic, gunModel, gunVertex, gunFragment, worldInfoVertex, worldInfoFragment);
            });

        });
    });
}

function createScene(worldBuffer, vertexShader, fragmentShader, drawCalls, images, worldPhysic, gunModel, gunVertex, gunFragment, worldInfoVertex, worldInfoFragment) {
    var planeProgram = {};
    var gunRecoil = 2;
    var webgl = getContext();
    setUpAnimationFrame();
    setClearColorAndDepthBuffer(webgl);
    var canvasElement = document.getElementById("viewer");
    planeProgram["worldPhysic"] = new MapPhysic(worldPhysic, 9);
    planeProgram["projection"] = createProjectionMatrix();
    planeProgram["pointHandler"] = new MouseInputHandler(canvasElement);
    planeProgram["camera"] = new Camera();
    planeProgram["keyBoardHandler"] = new KeyBoardHandler();
    planeProgram["gunInfoState"] = new GunInfoState(400, 2000, gunRecoil, 400);
    planeProgram["player"] = new Player(planeProgram.camera, planeProgram["worldPhysic"]);
    planeProgram["gun"] = createGunObject(gunVertex, gunFragment, gunModel, webgl);
    planeProgram["world"] = createWorldObject(images, drawCalls, worldBuffer, vertexShader, fragmentShader, webgl);
    planeProgram["webgl"] = webgl;
    planeProgram["worldInfo"] = createWorldInfoObject(worldInfoVertex, worldInfoFragment, webgl);
    planeProgram["lastTime"] = new Date().getTime();
    window.planeProgram = planeProgram;
    drawScene();
}

function createWorldInfoObject(vertexShader, fragmentShader, webgl) {
    var program = createProgramAndCompileShader(vertexShader, fragmentShader, webgl);
    webgl.useProgram(program.program);
    var positionId = getAttribElementIdAndEnable("pos", program, webgl);
    var modelUniform = getUniformLocation("model", program, webgl);
    var viewUniform = getUniformLocation("view", program, webgl);
    var projectionUniform = getUniformLocation("projection", program, webgl);
    var typeUniform = getUniformLocation("type", program, webgl);
    var worldInfoVertex = createWorldInfoVertex();
    var vertexBuffer = createBuffer(webgl.ARRAY_BUFFER, worldInfoVertex, webgl);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.vertexAttribPointer(positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var worldInfo = {};
    worldInfo["positionId"] = positionId;
    worldInfo["modelUniform"] = modelUniform;
    worldInfo["projectionUniform"] = projectionUniform;
    worldInfo["typeUniform"] = typeUniform;
    worldInfo["viewUniform"] = viewUniform;
    worldInfo["program"] = program;
    worldInfo["vertexBuffer"] = vertexBuffer;
    return worldInfo;
}

function createWorldInfoVertex() {
    var leftFrontPoint = [0, 0, 1];
    var rightFrontPoint = [1, 0, 1];
    var leftBackPoint = [0, 0, -1];
    var rightBackPoint = [1, 0, -1];
    var worldInfoVertex = [];
    Array.prototype.push.apply(worldInfoVertex, leftFrontPoint);
    Array.prototype.push.apply(worldInfoVertex, rightFrontPoint);
    Array.prototype.push.apply(worldInfoVertex, leftBackPoint);
    Array.prototype.push.apply(worldInfoVertex, leftBackPoint);
    Array.prototype.push.apply(worldInfoVertex, rightFrontPoint);
    Array.prototype.push.apply(worldInfoVertex, rightBackPoint)
    return new Float32Array(worldInfoVertex);
}


function createGunObject(vertexShader, fragmentShader, gunModel, webgl) {
    var program = createProgramAndCompileShader(vertexShader, fragmentShader, webgl);
    setUpAnimationFrame();
    webgl.useProgram(program.program);
    var hand = gunModel.hand;
    var weapon = gunModel.weapon;
    var positionId = getAttribElementIdAndEnable("pos", program, webgl);
    var textureId = getAttribElementIdAndEnable("textureCor", program, webgl);
    var handObject = createPlayerObject(webgl, hand.buffer, hand.texture, positionId, textureId, hand.numOfTriangle, hand.drawCalls);
    var weaponObject = createPlayerObject(webgl, weapon.buffer, weapon.texture, positionId, textureId, weapon.numOfTriangle, weapon.drawCalls);
    var gunObject = {};
    gunObject["drawList"] = [handObject, weaponObject];
    gunObject["textureId"] = textureId;
    gunObject["positionId"] = positionId;
    gunObject["program"] = program;
    gunObject["projectionUniform"] = getUniformLocation("projection", program, webgl);
    gunObject["viewUniform"] = getUniformLocation("view", program, webgl);
    gunObject["modelUniform"] = getUniformLocation("model", program, webgl);
    gunObject["textureUniform"] = getUniformLocation("textureImage", program, webgl);
    return gunObject;
}

function createPlayerObject(webgl, buffer, textureImage, positionId, textureId, triangleSize, drawCalls) {
    webgl.bindTexture(webgl.TEXTURE_2D, null);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, null);
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, null);
    var vertexBuffer = createBuffer(webgl.ARRAY_BUFFER, buffer.mesh, webgl);
    var indexBuffer = createBuffer(webgl.ELEMENT_ARRAY_BUFFER, buffer.index, webgl);
    var texture = createTextureAndActiveFromImage(textureImage, webgl);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.vertexAttribPointer(positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 0);
    webgl.vertexAttribPointer(textureId, 2, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 3);
    return {
        "vertexBuffer": vertexBuffer,
        "indexBuffer": indexBuffer,
        "texture": texture,
        "triangleSize": triangleSize,
        "drawCalls": drawCalls
    };
}


function createWorldObject(worldImages, drawCalls, worldBuffer, vertexShader, fragmentShader, webgl) {
    var world = {};

    var program = createProgramAndCompileShader(vertexShader, fragmentShader, webgl);
    webgl.useProgram(program.program);
    var positionId = getAttribElementIdAndEnable("pos", program, webgl);
    var colorId = getAttribElementIdAndEnable("ambientComponent", program, webgl);
    var textureId = getAttribElementIdAndEnable("textureCor", program, webgl);
    var worldVertexBuffer = createAndSetupBuffer(webgl, worldBuffer, positionId, colorId, textureId);
    world["buffer"] = worldVertexBuffer;
    world["textures"] = createTextures(worldImages, webgl);
    world["positionId"] = positionId;
    world["colorId"] = colorId;
    world["drawCalls"] = drawCalls;
    world["projectionUniform"] = getUniformLocation("projection", program, webgl);
    world["viewUniform"] = getUniformLocation("view", program, webgl);
    world["modelUniform"] = getUniformLocation("model", program, webgl);
    world["sampleUniform"] = getUniformLocation("text.textureImage", program, webgl);
    world["imageSizeUniform"] = getUniformLocation("text.imageSize", program, webgl);
    world["program"] = program;
    return world;


}

function createTextures(images, webgl) {
    var textures = {};
    var image;
    var texture;
    var imageSize;
    for (var imageName in images) {
        image = images[imageName];
        imageSize = new Float32Array([image.width, image.height]);
        if(isPowerOf2(image))
        {
            texture = createTextureAndActiveFromImage(image, webgl);
            textures[imageName] = [texture, true, imageSize];
            continue;
        }
        texture = createTextureNPOTAndActiveFromImage(image, webgl);
        textures[imageName] = [texture, false, imageSize];
    }
    return textures;
}

function isPowerOf2(image)
{
    var width = image.width;
    var height = image.height;
    return (width & (width - 1)) ==0 && (height & (height - 1)) ==0;
}


function createAndSetupBuffer(webgl, buffer, positionId, colorId, textureId) {
    var vertexBuffer = createBuffer(webgl.ARRAY_BUFFER, buffer, webgl);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.vertexAttribPointer(positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, 0);
    webgl.vertexAttribPointer(colorId, 4, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 3);
    webgl.vertexAttribPointer(textureId, 2, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 7);
    return vertexBuffer;
}


function createProjectionMatrix() {
    var projection = mat4.create();
    mat4.identity(projection);
    mat4.perspective(73.7397919, document.body.clientWidth / document.body.clientHeight, 0.150000006, 200, projection);
    return projection;
}


function setUpAnimationFrame() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
}

function setClearColorAndDepthBuffer(webgl) {
    webgl.enable(webgl.DEPTH_TEST);
    webgl.depthFunc(webgl.LESS);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clearDepth(1.0);
    webgl.viewport(0, 0, document.body.clientWidth, document.body.clientHeight);

}

function getContext() {
    var canvas = $("canvas").get(0);
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    return canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
}

function drawScene() {
    var lastTime = planeProgram["lastTime"];
    var currentTime = new Date().getTime() - lastTime;
    var player = planeProgram.player;
    var gunInfoState = planeProgram.gunInfoState;
    var gun = planeProgram.gun;
    gunInfoState.update();
    moveView(player, planeProgram["pointHandler"]);
    var webgl = window.planeProgram.webgl;
    var view = window.planeProgram.camera.getMatrix();
    var projection = window.planeProgram.projection;
    var world = planeProgram.world;
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
    renderWorld(world, view, projection, webgl);
    drawGun(gun, gunInfoState, player, view, projection, lastTime, webgl);
    renderWorldInfo(planeProgram.worldInfo, player, view, projection, webgl);
    movePlayer(player, window.planeProgram.keyBoardHandler, currentTime);
    planeProgram["lastTime"] = new Date().getTime();
    requestAnimationFrame(drawScene);
}

function renderWorldInfo(worldInfo, player, view, projection, webgl) {
    var program = worldInfo.program;
    webgl.useProgram(program.program);
    var worldEntities = player.getWorldEntities();
    var vertexBuffer = worldInfo.vertexBuffer;
    var positionId = worldInfo.positionId;
    var viewUniform = worldInfo.viewUniform;
    var typeUniform = worldInfo.typeUniform;
    var projectionUniform = worldInfo.projectionUniform;
    var modelUniform = worldInfo.modelUniform;
    webgl.bindBuffer(webgl.ARRAY_BUFFER, vertexBuffer);
    webgl.vertexAttribPointer(positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 3, 0);
    var model = mat4.create();
    var worldEntity;
    webgl.uniformMatrix4fv(viewUniform, false, view);
    webgl.uniformMatrix4fv(projectionUniform, false, projection);
    for (var i = 0; i < worldEntities.length; i++) {
        worldEntity = worldEntities[i];
        model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, worldEntity.position);
        webgl.uniformMatrix4fv(modelUniform, false, model);
        webgl.uniform1i(typeUniform, worldEntity.type);
        webgl.drawArrays(webgl.TRIANGLES, 0 ,6);
    }

}


function renderWorld(world, view, projection, webgl) {
    var projectionUniform = world.projectionUniform;
    var viewUniform = world.viewUniform;
    var modelUniform = world.modelUniform;
    var drawCalls = world.drawCalls;
    var textures = world.textures;
    var sampleUniform = world.sampleUniform;
    var imageSizeUniform = world.imageSizeUniform;
    var model = mat4.create();
    webgl.useProgram(world.program.program);
    bindWorldBuffer(world, webgl);
    mat4.identity(model);
    webgl.uniformMatrix4fv(viewUniform, false, view);
    webgl.uniformMatrix4fv(projectionUniform, false, projection);
    webgl.uniformMatrix4fv(modelUniform, false, model);
    var drawCall;
    var texture;
    for (var textureName in drawCalls) {
        webgl.uniform1i(sampleUniform, 0);
        drawCall = drawCalls[textureName];
        texture = textures[textureName][0];
        webgl.uniform2fv(imageSizeUniform, textures[textureName][2]);

        if(textures[textureName][1])
        {
            bindTexture(texture, webgl);
        }
        else
        {
            bindNPOTTexture(texture, webgl);
        }
        webgl.drawArrays(webgl.TRIANGLES, drawCall[0], drawCall[2]);
    }
}



function bindWorldBuffer(world, webgl) {
    webgl.bindBuffer(webgl.ARRAY_BUFFER, world.buffer);
    webgl.vertexAttribPointer(world.positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, 0);
    webgl.vertexAttribPointer(world.colorId, 4, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 3);
    webgl.vertexAttribPointer(world.textureId, 2, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 7);
}

function drawGun(gun, gunInfoState, player, view, projection, lastTime, webgl) {
    var aimDir = getAimDirection(view);
    var program = gun.program;
    webgl.useProgram(program.program);
    var projectionUniform = gun.projectionUniform;
    var viewUniform = gun.viewUniform;
    var modelUniform = gun.modelUniform;
    var positionId = gun.positionId;
    var textureId = gun.textureId;
    var drawList = gun.drawList;
    var textureUniform = gun.textureUniform;
    var gunPart;
    var drawCalls;
    var gunRecoilInterpolation = gunInfoState.getGunAttackRecoilInterpolation(lastTime);
    var gunAngleInterpolation = gunInfoState.getInterpolationAnimationValue(lastTime);
    var model = player.getGunModelMatrix(lastTime, gunAngleInterpolation, aimDir, gunRecoilInterpolation);
    webgl.uniformMatrix4fv(projectionUniform, false, projection);
    webgl.uniformMatrix4fv(viewUniform, false, view);
    for (var i = 0; i < drawList.length; i++) {
        gunPart = drawList[i];
        drawCalls = gunPart.drawCalls;
        bindTextureBuffer(gunPart.vertexBuffer, gunPart.indexBuffer, positionId, textureId, gunPart.texture, webgl);
        webgl.uniformMatrix4fv(modelUniform, false, model);
        webgl.uniform1i(textureUniform, 0);
        renderFromDrawCalls(drawCalls, webgl);
    }
}

function renderFromDrawCalls(drawCalls, webgl) {
    for (var j = 0; j < drawCalls.length; j++) {

        if (drawCalls[j][0] == 5) {
            webgl.drawElements(webgl.TRIANGLE_STRIP, drawCalls[j][2], webgl.UNSIGNED_SHORT, drawCalls[j][1] * 2);
        }
        else {
            webgl.drawElements(webgl.TRIANGLES, drawCalls[j][2], webgl.UNSIGNED_SHORT, drawCalls[j][1] * 2);
        }

    }
}

function bindTextureBuffer(buffer, index, positionId, textureId, texture, webgl) {
    webgl.activeTexture(webgl.TEXTURE0);
    webgl.bindTexture(webgl.TEXTURE_2D, texture);
    webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
    webgl.vertexAttribPointer(positionId, 3, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 0);
    webgl.vertexAttribPointer(textureId, 2, webgl.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 3);
    webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, index);

}

function moveView(player, pointHandler) {
    var relativeMovement = pointHandler.getMouseRelativeMovement();
    var dx = relativeMovement[0];
    var dy = relativeMovement[1];
    player.updateLook(dx, dy);
}

function movePlayer(player, handler, currentTime) {
    var dz = 0;
    var dx = 0;
    if (handler.isForwardEnable()) {
        dz = 1;
    }

    if (handler.isBackwardEnable()) {
        dz = -1;
    }

    if (handler.isLeftEnable()) {
        dx = -1;
    }

    if (handler.isRightEnable()) {
        dx = 1;
    }
    if (handler.shouldJump()) {
        player.jump();
    }
    player.movePlayer(dx, dz, currentTime);
}


function createFloatArrayFromVectors()
{
    var allVectors = joinAllVectorOnOne(arguments);
    return new Float32Array(allVectors);
}

function joinAllVectorOnOne(vectors)
{
    var allVectors = [];
    for (var i = 0; i < vectors.length; i++)
    {
        allVectors.push.apply(allVectors, vectors[i]);
    }
    return allVectors;
}
