var STEP_PER_FRAME = 0.1;
var FRAME = 1000.0 / 60.0;
document.addEventListener("DOMContentLoaded", function () {
    var defaultScenePath = "/scene/default.json";
    loadJSonResources([defaultScenePath], function (response) {
        loadScene(response[defaultScenePath], onLoadSceneDone);
    });
});

function onLoadSceneDone(scene) {
    var canvasElement = createCanvasElement();
    var canvasContext = getCanvasContext(canvasElement);
    var lastTime = new Date().getTime();
    setClearColorAndDepthBuffer(canvasContext, canvasElement);
    var projection = createProjectionMatrix(canvasElement);
    var morpheusEngine = createMorpheusEngineFromScene(scene, projection, canvasContext);
    requestAnimationFrame(gameLoop.bind({}, morpheusEngine, canvasElement, lastTime));
    removeLoaderImage();

}

function removeLoaderImage() {
    var image = document.querySelector("img");
    image.parentNode.removeChild(image);
}

function addCanvasToBody(canvasElement) {
    var body = document.querySelector("body");
    body.appendChild(canvasElement);
}

function createCanvasElement() {
    var canvasElement = document.querySelector("canvas");
    var pageSize = getPageSize();
    canvasElement.width = pageSize[0];
    canvasElement.height = pageSize[1];
    return canvasElement;
}

function getCanvasContext(canvasElement) {
    return canvasElement.getContext("webgl") || canvasElement.getContext("experimental-webgl");
}

function setClearColorAndDepthBuffer(webgl, canvasElement) {
    webgl.enable(webgl.DEPTH_TEST);
    webgl.depthFunc(webgl.LESS);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.clearDepth(1.0);
    webgl.viewport(0, 0, canvasElement.width, canvasElement.height);
}

function createProjectionMatrix(canvas) {
    var verticalAngle = (Math.PI / 180.0) * 73.7397919;
    var ratio = canvas.width / canvas.height;
    var near = 0.150000006;
    var far = 200;
    var projection = mat4.create();
    mat4.identity(projection);
    mat4.perspective(projection, verticalAngle, ratio, near, far);
    return projection;
}

function getPageSize() {
    var height = (
        'innerHeight' in window ? window.innerHeight :
            document.compatMode !== 'BackCompat' ? document.documentElement.clientHeight :
                document.body.clientHeight
    );
    var width = document.body.clientWidth;
    return [width, height];
}

function gameLoop(morpheusEngine, canvasElement, lastTime) {
    var newTime = new Date().getTime();
    var deltaTime = newTime - lastTime;
    var timeStep = (deltaTime / FRAME) * STEP_PER_FRAME;
    morpheusEngine.nextStep(timeStep);
    requestAnimationFrame(gameLoop.bind({}, morpheusEngine, canvasElement, newTime));
}