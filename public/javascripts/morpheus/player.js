function PlayerComponent(playerIntegrator, keyboardInput, mouseInput) {
    function draw(view, projection, webgl) {
    }

    function update(deltaTime) {
        updateIntegratorStateByPlayerInput();
        playerIntegrator.update(deltaTime);
        var orientation = mouseInput.getOrientation();
        playerIntegrator.updateView(orientation[0], orientation[1]);
    }

    function updateIntegratorStateByPlayerInput() {
        if (keyboardInput.isBack()) {
            playerIntegrator.move(-1);
        }
        if (keyboardInput.isForward()) {
            playerIntegrator.move(1);
        }
        if (keyboardInput.isLeft()) {
            playerIntegrator.strafe(-1);
        }
        if (keyboardInput.isRight()) {
            playerIntegrator.strafe(1);
        }
        if (keyboardInput.isDown()) {
            playerIntegrator.upDown(-1);
        }
        if (keyboardInput.isUp()) {
            playerIntegrator.upDown(1);
        }

    }

    function getView() {
        var orientation = playerIntegrator.getOrientation();
        var yaw = orientation[0];
        var pitch = orientation[1];
        var view = mat4.create();
        var matY = mat4.create();
        var matX = mat4.create();
        var xAxis = vec3.create();
        var yAxis = vec3.create();
        vec3.set(xAxis, 1, 0, 0);
        vec3.set(yAxis, 0, 1, 0);
        var translation = mat4.create();
        mat4.identity(view);
        mat4.identity(translation);
        mat4.identity(matX);
        mat4.identity(matY);
        mat4.rotate(matX, matX, convertToRadians(pitch), xAxis);
        mat4.rotate(matY, matY, convertToRadians(yaw), yAxis);
        mat4.multiply(view, view, matX);
        mat4.multiply(view, view, matY);
        mat4.translate(view, view, playerIntegrator.getPosition());
        return view;
    }


    function convertToRadians(angle) {
        return angle * Math.PI / 180.0;
    }

    this.update = update;
    this.getView = getView;
    this.draw = draw;
}


