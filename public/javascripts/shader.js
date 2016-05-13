function createProgramAndCompileShader(vertex_shader_source, fragment_shader_source, webgl) {
    var fragment_shader = compileShader(fragment_shader_source, webgl.FRAGMENT_SHADER, webgl);
    var vertex_shader = compileShader(vertex_shader_source, webgl.VERTEX_SHADER, webgl);
    var program = createProgramAndLinkShaders(vertex_shader, fragment_shader, webgl);
    return {program: program, vertex: vertex_shader, fragment: fragment_shader};
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
    var attribId = getAttribElementId(attribName, program, webgl);
    webgl.enableVertexAttribArray(attribId);
    return attribId;
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

function compileShader(shader_source, shader_type, webgl)
{
    var shader = webgl.createShader(shader_type);
    webgl.shaderSource(shader, shader_source);
    webgl.compileShader(shader);
    var sucess = webgl.getShaderParameter(shader, webgl.COMPILE_STATUS);
    if (!sucess) {
        throw "could not compile shader:" + webgl.getShaderInfoLog(shader);
    }
    return shader;
}