var STATIC_PROGRAM_ID = "program";
var STATIC_MODEL_BUFFER = "buffer";
var STATIC_MODELS_MATRIX = "models";
var STATIC_MODEL_TEXTURE = "texture";
var STATIC_MODEL_DRAW_CALL = "drawCalls";
var STATIC_PROGRAM_POSITION_ATTR_NAME = "pos";
var STATIC_PROGRAM_TEXTURE_ATTR_NAME = "textureCor";
var STATIC_PROGRAM_TEXTURE_UNIFORM_SAMPLE_NAME = "textureImage";
var STATIC_PROGRAM_MODEL_UNIFORM_NAME = "model";
var STATIC_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME = "viewProjection";

function StaticRenderComponent(staticProgram, staticsModels) {
    var programId = staticProgram[STATIC_PROGRAM_ID];
    var positionId = staticProgram[STATIC_PROGRAM_POSITION_ATTR_NAME];
    var textureId = staticProgram[STATIC_PROGRAM_TEXTURE_ATTR_NAME];
    var viewProjectionUniformId = staticProgram[STATIC_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME];
    var textureSample = staticProgram[STATIC_PROGRAM_TEXTURE_UNIFORM_SAMPLE_NAME];
    var modelUniformId = staticProgram[STATIC_PROGRAM_MODEL_UNIFORM_NAME];

    function draw(viewProjection, webglContext) {
        setUpDraw(viewProjection, webglContext);
        for (var i = 0; i < staticsModels.length; i++) {
            drawStaticModel(staticsModels[i], webglContext);
        }
    }

    function drawStaticModel(staticModel, webglContext) {
        var drawCalls = staticModel[STATIC_MODEL_DRAW_CALL];
        var buffer = staticModel[STATIC_MODEL_BUFFER];
        var texture = staticModel[STATIC_MODEL_TEXTURE];
        var models = staticModel[STATIC_MODELS_MATRIX];
        bindBuffer(buffer, webglContext);
        bindTexture(texture, webglContext);
        for (var i = 0; i < models.length; i++) {
            webglContext.uniformMatrix4fv(modelUniformId, false, models[i]);
            for (var j = 0; j < drawCalls.length; j++) {
                if (drawCalls[j][0] == 5) {
                    webglContext.drawElements(webglContext.TRIANGLE_STRIP, drawCalls[j][2], webglContext.UNSIGNED_SHORT, drawCalls[j][1] * 2);
                }
                else {
                    webglContext.drawElements(webglContext.TRIANGLES, drawCalls[j][2], webglContext.UNSIGNED_SHORT, drawCalls[j][1] * 2);
                }
            }
        }

    }


    function bindBuffer(buffer, webglContext) {
        webglContext.bindBuffer(webglContext.ARRAY_BUFFER, buffer.vertexBuffer);
        webglContext.vertexAttribPointer(positionId, 3, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, 0);
        webglContext.vertexAttribPointer(textureId, 2, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 5, Float32Array.BYTES_PER_ELEMENT * 3);
        webglContext.bindBuffer(webglContext.ELEMENT_ARRAY_BUFFER, buffer.indexBuffer);
    }

    function setUpDraw(viewProjection, webglContext) {
        webglContext.useProgram(programId);
        webglContext.uniformMatrix4fv(viewProjectionUniformId, false, viewProjection);
        webglContext.uniform1i(textureSample, 0);
    }

    this.draw = draw;
}
