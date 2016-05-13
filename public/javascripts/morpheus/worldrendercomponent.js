var WORLD_PROGRAM_POSITION_ATTR_NAME = "pos";
var WORLD_PROGRAM_LIGHT_AMBIENT_ATTR_NAME = "ambientComponent";
var WORLD_PROGRAM_TEXTURE_ATTR_NAME = "textureCor";
var WORLD_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME = "viewProjection";
var WORLD_PROGRAM_MODEL_UNIFORM_NAME = "model";
var WORLD_PROGRAM_TEXTURE_SAMPLE_UNIFORM_NAME = "textureImage";
var WORLD_PROGRAM_ID_NAME = "programHandler";
var WORLD_SECTION_FRUSTUM_BOX_FIELD_NAME = "frustumBox";
var WORLD_SECTION_DRAW_CALLS_FIELD_NAME = "drawCalls";
var WORLD_SECTION_BUFFER_FIELD_NAME = "buffer";
var WORLD_TEXTURES_FIELD_NAME = "textures";

function WorldRenderComponent(worldProgram, sections, textures) {
    var programId = worldProgram[WORLD_PROGRAM_ID_NAME];
    var ambientLightId = worldProgram[WORLD_PROGRAM_LIGHT_AMBIENT_ATTR_NAME];
    var positionId = worldProgram[WORLD_PROGRAM_POSITION_ATTR_NAME];
    var textureCoordinateId = worldProgram[WORLD_PROGRAM_TEXTURE_ATTR_NAME];
    var viewProjectionUniformId = worldProgram[WORLD_PROGRAM_VIEW_PROJECTION_UNIFORM_NAME];
    var textureSample = worldProgram[WORLD_PROGRAM_TEXTURE_SAMPLE_UNIFORM_NAME];
    var sectionsOcclusionStates = [];

    function draw(viewProjection, webglContext) {
        var frustum = createFrustumFromViewProjection(viewProjection);
        runOcclusionQuery(frustum);
        setUpDraw(viewProjection, webglContext);
        drawWorld(webglContext);
    }

    function runOcclusionQuery(frustum) {
        sectionsOcclusionStates = [];
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var frustumBox = section[WORLD_SECTION_FRUSTUM_BOX_FIELD_NAME];
            sectionsOcclusionStates.push(isCubeInterceptingFrustum(frustumBox, frustum));
        }
    }

    function drawWorld(webglContext) {
        for (var i = 0; i < sections.length; i++) {
            var section = sections[i];
            var isVisible = sectionsOcclusionStates[i];
            if (!isVisible) {
                continue;
            }
            drawWorldSection(section, webglContext);
        }
    }

    function drawWorldSection(section, webglContext) {
        var drawCalls = section[WORLD_SECTION_DRAW_CALLS_FIELD_NAME];
        var buffer = section[WORLD_SECTION_BUFFER_FIELD_NAME];
        bindBuffer(buffer, webglContext);
        for (var i = 0; i < drawCalls.length; i++) {
            var drawCall = drawCalls[i];
            var textureId = drawCall[0];
            var texture = textures[textureId];
            bindTexture(texture, webglContext);
            webglContext.drawArrays(webglContext.TRIANGLES, drawCall[1], drawCall[2]);
        }

    }

    function bindBuffer(buffer, webglContext) {
        webglContext.bindBuffer(webglContext.ARRAY_BUFFER, buffer);
        webglContext.vertexAttribPointer(positionId, 3, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, 0);
        webglContext.vertexAttribPointer(ambientLightId, 4, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 3);
        webglContext.vertexAttribPointer(textureCoordinateId, 2, webglContext.FLOAT, false, Float32Array.BYTES_PER_ELEMENT * 9, Float32Array.BYTES_PER_ELEMENT * 7);
    }

    function setUpDraw(viewProjection, webglContext) {
        webglContext.useProgram(programId);
        webglContext.uniformMatrix4fv(viewProjectionUniformId, false, viewProjection);
        webglContext.uniform1i(textureSample, 0);
    }

    this.draw = draw;
}
