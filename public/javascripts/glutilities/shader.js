function createProgramAndCompileShader(vertex_shader_source, fragment_shader_source, webgl) {
    var fragmentShader = compileShader(fragment_shader_source, webgl.FRAGMENT_SHADER, webgl);
    var vertexShader = compileShader(vertex_shader_source, webgl.VERTEX_SHADER, webgl);
    var program = createProgramAndLinkShaders(vertexShader, fragmentShader, webgl);
    return {program: program, vertex: vertexShader, fragment: fragmentShader};
}

function getUniformLocation(uniformName, program, webgl)
{
    var uniform = webgl.getUniformLocation(program.program, uniformName);
    if(uniform === null)
    {
        throw new Error("uniform not found " + uniformName);
    }
    return uniform;
}

function getAttribElementIdAndEnable(attribName, program, webgl)
{
    var attributeId = getAttribElementId(attribName, program, webgl);
    webgl.enableVertexAttribArray(attributeId);
    return attributeId;
}

function getAttribElementId(attribName, program, webgl)
{
    var attrId = webgl.getAttribLocation(program.program, attribName);
    if(attrId < 0)
    {
        throw new Error("attribute not found");
    }
    return attrId;
}

function createProgramAndLinkShaders(vertex_shader, fragment_shader, webgl) {
    var program = webgl.createProgram();
    webgl.attachShader(program, vertex_shader);
    webgl.attachShader(program, fragment_shader);
    webgl.linkProgram(program);
    var linked = webgl.getProgramParameter(program, webgl.LINK_STATUS);
    if (!linked) {
        throw "error linking program " + webgl.getProgramInfoLog(program);
    }
    return program;
}

function compileShader(shaderSource, shaderType, webgl)
{
    var shader = webgl.createShader(shaderType);
    webgl.shaderSource(shader, shaderSource);
    webgl.compileShader(shader);
    var sucess = webgl.getShaderParameter(shader, webgl.COMPILE_STATUS);
    if (!sucess) {
        throw "could not compile shader:" + webgl.getShaderInfoLog(shader);
    }
    return shader;
}