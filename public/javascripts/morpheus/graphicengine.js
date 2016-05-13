function GraphicEngine() {
    var graphicComponents = [];

    function draw(viewProjection, webglContext) {
        webglContext.clear(webglContext.COLOR_BUFFER_BIT | webglContext.DEPTH_BUFFER_BIT);
        for (var i = 0; i < graphicComponents.length; i++) {
            graphicComponents[i].draw(viewProjection, webglContext);
        }
    }

    function addComponent(graphicComponent) {
        graphicComponents.push(graphicComponent);
    }

    function removeComponent(graphicComponent)
    {
        for (var i = 0; i < graphicComponents.length; i++) {
            if (graphicComponents[i] == graphicComponent) {
                graphicComponents.splice(i, 1);
            }
        }
    }

    this.addComponent = addComponent;
    this.removeComponent = removeComponent;
    this.draw = draw;
}
