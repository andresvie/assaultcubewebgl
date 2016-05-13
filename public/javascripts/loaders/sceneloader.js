function loadScene(sceneLoaderDescriptor, onSceneLoaderDone) {
    var scene = {};
    var worldDownloaderDescriptor = sceneLoaderDescriptor["world"];
    var player = worldDownloaderDescriptor["player"];
    loadWorld(worldDownloaderDescriptor, function (world) {
        world["player"] = player;
        scene["world"] = world;
        onSceneLoaderDone(scene);
    });
}
