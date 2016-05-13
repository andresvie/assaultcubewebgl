function createMorpheusEngineFromScene(scene, projection, webglContext) {
    var graphicEngine = createGraphicEngine(scene["world"], webglContext);
    var playerComponent = createPlayer(scene["world"]);
    return new MorpheusEngine(graphicEngine, playerComponent, projection, webglContext);
}

function createGraphicEngine(world, webglContext) {
    var graphicEngine = new GraphicEngine();
    var worldRenderComponent = createWorldRenderComponent(world, webglContext);
    var staticRenderComponent = createStaticRenderComponent(world[STATICS_MODELS], webglContext);
    graphicEngine.addComponent(worldRenderComponent);
    graphicEngine.addComponent(staticRenderComponent);
    return graphicEngine;
}

function createPlayer(world) {
    var keyboardInput = new KeyBoardInput(window);
    var mouseInput = new MouseInputHandler(document.body);
    var playerIntegrator = createPlayerIntegratorFromWorld(world);
    return new PlayerComponent(playerIntegrator, keyboardInput, mouseInput);
}

function createPlayerIntegratorFromWorld(world) {
    var player = world["player"];
    var speed = player["speed"];
    var lookFriction = player["lookFriction"];
    var lookSpeed = player["lookSpeed"];
    var fpsFriction = player["fpsFriction"];
    var position = player["position"];
    return new PlayerIntegrator(speed, fpsFriction, lookSpeed, lookFriction, position);
}

function createStaticRenderComponent(statics, webglContext) {
    var vertexShader = statics[VERTEX_FIELD_NAME];
    var fragmentShader = statics[FRAGMENT_FIELD_NAME];
    var program = createStaticProgram(vertexShader, fragmentShader, webglContext);
    var positionId = program[STATIC_PROGRAM_POSITION_ATTR_NAME];
    var textureId = program[STATIC_PROGRAM_TEXTURE_ATTR_NAME];
    var models = [];
    for (var i = 0; i < statics["models"].length; i++) {
        models.push(createStaticModel(statics["models"][i], positionId, textureId, webglContext));
    }
    return new StaticRenderComponent(program, models);
}

function createStaticModel(model, positionId, textureId, webglContext) {
    var staticModel = {};
    staticModel[STATIC_MODEL_BUFFER] = createAndSetupStaticModelBuffer(model["buffer"], positionId, textureId, webglContext);
    staticModel[STATIC_MODELS_MATRIX] = createStaticModelsMatrixFromTransforms(model["transforms"]);
    staticModel[STATIC_MODEL_TEXTURE] = createTextureAndActiveFromImage(model["texture"], webglContext);
    staticModel[STATIC_MODEL_DRAW_CALL] = model["drawCalls"];
    return staticModel;
}

function createStaticModelsMatrixFromTransforms(transforms) {
    var models = [];
    for (var i = 0; i < transforms.length; i++) {
        var model = mat4.create();
        var position = vec3.create();
        var scaleMatrix = null;
        var yawMatrix = getRotationMatrix(transforms[i][3] + 270.0, [0, 1, 0]);
        var pitchMatrix = getRotationMatrix(-transforms[i][4], [1, 0, 0]);
        scaleMatrix = getScaleUniformMatrix(0.07);
        var positionMatrix = mat4.create();
        mat4.identity(model);
        mat4.identity(positionMatrix);
        vec3.set(position, -transforms[i][1], transforms[i][2], -transforms[i][0]);
        mat4.translate(positionMatrix, positionMatrix, position);
        mat4.multiply(model, pitchMatrix, yawMatrix);
        mat4.multiply(model, scaleMatrix, model);
        mat4.multiply(model, positionMatrix, model);
        models.push(model);
    }
    return models;
}

function getScaleUniformMatrix(scale) {
    var scaleMatrix = mat4.create();
    mat4.identity(scaleMatrix);
    mat4.scale(scaleMatrix, scaleMatrix, [scale, scale, scale]);
    return scaleMatrix;
}

function getRotationMatrix(angle, axis) {
    var rotationMatrix = mat4.create();
    mat4.identity(rotationMatrix);
    mat4.rotate(rotationMatrix, rotationMatrix, (angle * Math.PI) / 180.0, axis);
    return rotationMatrix;
}

function createWorldRenderComponent(world, webglContext) {
    var worldProgram = createWorldProgram(world, webglContext);
    var textures = createWorldTextures(world[TEXTURES_FIELD_NAME], webglContext);
    var sections = createWorldSections(world, worldProgram, webglContext);
    return new WorldRenderComponent(worldProgram, sections, textures);
}

function createWorldSections(world, worldProgram, webglContext) {
    var sections = world[WORLD_SECTIONS_FIELD_NAME];
    var positionId = worldProgram[WORLD_PROGRAM_POSITION_ATTR_NAME];
    var ambientLightId = worldProgram[WORLD_PROGRAM_LIGHT_AMBIENT_ATTR_NAME];
    var textureCoordinateId = worldProgram[WORLD_PROGRAM_TEXTURE_ATTR_NAME];
    var worldSections = [];
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var worldSection = {};
        var frustumLimits = section["limit"];
        var sectionMesh = section["mesh"];
        var drawCalls = section["drawCalls"];
        var buffer = createAndSetupBuffer(webglContext, sectionMesh, positionId, ambientLightId, textureCoordinateId);
        worldSection[WORLD_SECTION_FRUSTUM_BOX_FIELD_NAME] = createFrustumBox(frustumLimits);
        worldSection[WORLD_SECTION_BUFFER_FIELD_NAME] = buffer;
        worldSection[WORLD_SECTION_DRAW_CALLS_FIELD_NAME] = drawCalls;
        worldSections.push(worldSection);
    }
    return worldSections;
}


function createWorldTextures(textures, webglContext) {
    var textureIds = textures.keys();
    var worldTextures = {};
    for (var textureId of textureIds) {
        var textureImage = textures.get(textureId);
        if(isPowerOf2(textureImage))
        {
            worldTextures[textureId] = createTextureAndActiveFromImage(textureImage, webglContext);
        }
        else
        {
            console.log(textureImage.src);
            worldTextures[textureId] = createTextureNPOTAndActiveFromImage(textureImage, webglContext);
        }

    }
    return worldTextures;
}

function isPowerOf2(image) {
    var width = image.width;
    var height = image.height;
    return (width & (width - 1)) == 0 && (height & (height - 1)) == 0;
}

function createStaticProgram(vertexShader, fragmentShader, webglContext) {
    var staticProgram = {};
    var program = createProgramAndCompileShader(vertexShader, fragmentShader, webglContext);
    webglContext.useProgram(program.program);
    var positionId = getAttribElementIdAndEnable(STATIC_PROGRAM_POSITION_ATTR_NAME, program, webglContext);
    var textureId = getAttribElementIdAndEnable(STATIC_PROGRAM_TEXTURE_ATTR_NAME, program, webglContext);
    staticProgram[STATIC_PROGRAM_POSITION_ATTR_NAME] = positionId;
    staticProgram[STATIC_PROGRAM_TEXTURE_ATTR_NAME] = textureId;
    staticProgram[STATIC_PROGRAM_TEXTURE_UNIFORM_SAMPLE_NAME] = getUniformLocation(STATIC_PROGRAM_TEXTURE_UNIFORM_SAMPLE_NAME, program, webglContext);
    staticProgram[STATIC_PROGRAM_MODEL_UNIFORM_NAME] = getUniformLocation(STATIC_PROGRAM_MODEL_UNIFORM_NAME, program, webglContext);
    staticProgram[STATIC_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME] = getUniformLocation(STATIC_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME, program, webglContext);
    staticProgram[STATIC_PROGRAM_ID] = program.program;
    return staticProgram;
}

function createWorldProgram(world, webglContext) {
    var worldProgram = {};
    var vertexShader = world[VERTEX_FIELD_NAME];
    var fragmentShader = world[FRAGMENT_FIELD_NAME];
    var program = createProgramAndCompileShader(vertexShader, fragmentShader, webglContext);
    webglContext.useProgram(program.program);
    var positionId = getAttribElementIdAndEnable(WORLD_PROGRAM_POSITION_ATTR_NAME, program, webglContext);
    var colorId = getAttribElementIdAndEnable(WORLD_PROGRAM_LIGHT_AMBIENT_ATTR_NAME, program, webglContext);
    var textureId = getAttribElementIdAndEnable(WORLD_PROGRAM_TEXTURE_ATTR_NAME, program, webglContext);
    worldProgram[WORLD_PROGRAM_POSITION_ATTR_NAME] = positionId;
    worldProgram[WORLD_PROGRAM_LIGHT_AMBIENT_ATTR_NAME] = colorId;
    worldProgram[WORLD_PROGRAM_TEXTURE_ATTR_NAME] = textureId;
    worldProgram[WORLD_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME] = getUniformLocation(WORLD_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME, program, webglContext);
    worldProgram[WORLD_PROGRAM_TEXTURE_SAMPLE_UNIFORM_NAME] = getUniformLocation(WORLD_PROGRAM_TEXTURE_SAMPLE_UNIFORM_NAME, program, webglContext);
    worldProgram[WORLD_PROGRAM_ID_NAME] = program.program;
    return worldProgram;
}

function createAndSetupBuffer(webglContext, buffer, positionId, colorId, textureId) {
    var vertexBuffer = createBuffer(webglContext.ARRAY_BUFFER, buffer, webglContext);
    webglContext.bindBuffer(webglContext.ARRAY_BUFFER, vertexBuffer);
    webglContext.vertexAttribPointer(positionId, 3, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, 0);
    webglContext.vertexAttribPointer(colorId, 4, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 3);
    webglContext.vertexAttribPointer(textureId, 2, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 7);
    return vertexBuffer;
}

function createAndSetupStaticModelBuffer(buffer, positionId, textureId, webglContext) {
    webglContext.bindBuffer(webglContext.ARRAY_BUFFER, null);
    webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, null);
    var vertexBuffer = createBuffer(webglContext.ARRAY_BUFFER, buffer.mesh, webglContext);
    var indexBuffer = createBuffer(webglContext.ELEMENT_ARRAY_BUFFER, buffer.index, webglContext);
    webglContext.bindBuffer(webglContext.ARRAY_BUFFER, vertexBuffer);
    webglContext.vertexAttribPointer(positionId, 3, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 0);
    webglContext.vertexAttribPointer(textureId, 2, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 3);
    return {
        "vertexBuffer": vertexBuffer,
        "indexBuffer": indexBuffer
    };


}