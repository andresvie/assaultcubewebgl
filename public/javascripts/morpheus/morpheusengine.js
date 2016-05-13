function MorpheusEngine(graphicEngine, playerComponent, projection, webglContext) {
    function nextStep(deltaTime) {
        playerComponent.update(deltaTime);
        graphicEngine.draw(getViewProjection(), webglContext);
    }

    function getViewProjection() {
        var view = playerComponent.getView();
        var viewProjection = mat4.create();
        mat4.identity(viewProjection);
        mat4.multiply(viewProjection, projection, view);
        return viewProjection;
    }

    this.nextStep = nextStep;
}
