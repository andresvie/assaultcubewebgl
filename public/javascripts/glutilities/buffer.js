function createBuffer(buffer_type, data, webgl) {
    var buffer = webgl.createBuffer();
    webgl.bindBuffer(buffer_type, buffer);
    webgl.bufferData(buffer_type, data, webgl.STATIC_DRAW);
    return buffer;
}