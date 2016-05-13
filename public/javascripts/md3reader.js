function readMD3Model(data) {
    var buffer = new DataView(data);
    var header = getHeader(buffer);
    var meshes = getMeshes(buffer, header);
    return meshes;
}

function getHeader(buffer)
{
    var header = {};
    header["id"] = getStringFromBuffer(buffer, 0, 4);
    header["version"] = buffer.getInt32(4, true);
    header["name"] = getStringFromBuffer(buffer, 8, 64);
    header["flags"] = buffer.getInt32(72, true);
    header["numframes"] = buffer.getInt32(76, true);
    header["numtags"] = buffer.getInt32(80, true);
    header["nummeshes"] = buffer.getInt32(84, true);
    header["numskins"] = buffer.getInt32(88, true);
    header["ofs_frames"] = buffer.getInt32(92, true);
    header["ofs_tags"] = buffer.getInt32(96, true);
    header["ofs_meshes"] = buffer.getInt32(100, true);
    header["ofs_eof"] = buffer.getInt32(104, true);
    return header;
}

function getMeshes(buffer, header) {
    var meshes = {};
    var meshOffset = header.ofs_meshes;
    var numberOfMesh = header.nummeshes;
    var meshHeader = null;
    var triangles = null;
    var coordinatesUv = [];
    var vertexOffset = 0;
    var numVertex = 0;
    var vertex = null;
    var numTriangles = 0;
    var triangleOffset = 0;
    var uvOffset = 0;
    var meshObject = {};
    for (var i = 0; i < numberOfMesh; i++) {
        meshObject = {};
        meshHeader = getMeshHeader(buffer, meshOffset);
        numTriangles = meshHeader.numtriangles;
        triangleOffset = meshOffset + meshHeader.ofs_triangles;
        uvOffset = meshOffset + meshHeader.ofs_uv;
        vertexOffset = meshOffset + meshHeader.ofs_vertices;
        numVertex = meshHeader.numvertices * header.numframes;
        triangles = getTriangles(buffer, numTriangles, triangleOffset);
        coordinatesUv = getUV(buffer, meshHeader.numvertices, uvOffset);
        vertex = getVertexs(buffer, numVertex, vertexOffset);
        meshOffset += meshHeader.meshsize;
        meshObject["triangles"] = triangles;
        meshObject["uv"] = coordinatesUv;
        meshObject["vertex"] = vertex;
        meshObject["header"] = meshHeader;
        meshes[meshHeader.name] = meshObject;

    }
    return meshes;

}

function getMeshHeader(buffer, meshOffset) {
    var header = {};
    header["id"] = getStringFromBuffer(buffer, meshOffset, 4);
    header["name"] = getStringFromBuffer(buffer, meshOffset + 4, 64);
    header["flag"] = buffer.getInt32(meshOffset + 68, true);
    header["numframes"] = buffer.getInt32(meshOffset + 72, true);
    header["numshaders"] = buffer.getInt32(meshOffset + 76, true);
    header["numvertices"] = buffer.getInt32(meshOffset + 80, true);
    header["numtriangles"] = buffer.getInt32(meshOffset + 84, true);
    header["ofs_triangles"] = buffer.getInt32(meshOffset + 88, true);
    header["ofs_shaders"] = buffer.getInt32(meshOffset + 92, true);
    header["ofs_uv"] = buffer.getInt32(meshOffset + 96, true);
    header["ofs_vertices"] = buffer.getInt32(meshOffset + 100, true);
    header["meshsize"] = buffer.getInt32(meshOffset + 104, true);
    return header;
}


function getTriangles(buffer, numTriangles, triangleOffset) {
    var triangles = [];
    var coordinateIndex = [];
    var currentOffset = triangleOffset;
    for (var i = 0; i < numTriangles; i++) {
        coordinateIndex = [];
        for (var j = 0; j < 3; j++) {
            coordinateIndex.push(buffer.getInt32(currentOffset, true));
            currentOffset += 4;
        }
        triangles.push(coordinateIndex);
    }
    return triangles;
}

function getUV(buffer, numVertex, uvOffset) {
    var coordinatesUv = [];
    var currentOffset = uvOffset;
    var u = 0;
    var v = 0;
    for (var i = 0; i < numVertex; i++) {
        u = buffer.getFloat32(currentOffset, true);
        v = -buffer.getFloat32(currentOffset + 4, true);
        coordinatesUv.push([u, v]);
        currentOffset += 8;
    }
    return coordinatesUv;
}

function getVertexs(buffer, numVertex, vertexOffset) {
    var vertexList = [];
    var x = 0;
    var y = 0;
    var z = 0;
    var currentOffset = vertexOffset;
    for (var i = 0; i < numVertex; i++) {

        x = buffer.getInt16(currentOffset + 2,  true) / 64.0;
        y = buffer.getInt16(currentOffset + 4, true) / 64.0;
        z = buffer.getInt16(currentOffset , true) / 64.0;
        vertexList.push([x, y, z]);
        currentOffset += 8;
    }
    return vertexList;
}

function getStringFromBuffer(buffer, index, length) {
    var text = "";
    for (var i = 0; i < length; i++) {
        if (buffer.getInt8(i + index) == 0) {
            break;
        }
        text += String.fromCharCode(buffer.getInt8(i + index));
    }
    return text;
}

