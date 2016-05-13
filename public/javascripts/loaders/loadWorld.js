function loadWorld(name, oncomplete, onerror) {

    var path = "/world/";
    load_resources([path + name + ".json"], function (world) {
        var img = new Image();
        img.src = path + name + ".png";
        world = world[0];
        var rawData = getRawDataFromWorld(world);
        img.onload = function () {
            oncomplete(rawData, img, world.triangles_by_frame, world.frame_number);
        };
        img.onerror = function () {
            onerror("error to load image " + name);
        };
    }, onerror);
}

function getRawDataFromWorld(world) {
    var vertexData = world.buffer;
    return createFloatArrayFromVectors(vertexData);
}
