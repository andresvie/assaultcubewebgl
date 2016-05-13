function PlayerIntegrator(speed, fpsFriction, lookVelocity, lookFriction, worldInitPosition) {
    var yaw = 0.0;
    var pitch = 0.0;
    var time = 0.2;
    var position = cloneVector3d(worldInitPosition);


    function getPosition() {
        return position;
    }

    function getOrientation() {
        return [yaw, pitch];
    }

    function update(deltaStep) {


    }

    function updateView(dx, dy) {

        yaw += (lookVelocity * dx / lookFriction);
        yaw = yaw % 360.0;
        pitch += (lookVelocity * dy / lookFriction);
        if (pitch > 90) {
            pitch = 90.0;
        }
        if (pitch < -90.0) {
            pitch = -90.0;
        }

    }

    function move(dir) {
        var px = (time * dir) * ( Math.sin(-convertToRadians(yaw)));
        var pz = ((time * dir) * (Math.cos(-convertToRadians(yaw))));
        vec3.add(position, position, createVector3d(px, 0.0, pz));
    }

    function upDown(dir)
    {
        var py = time * dir;
        vec3.add(position, position, createVector3d(0.0, py, 0.0));
    }

    function strafe(dir) {
        var px = (time * dir) * (Math.cos(-convertToRadians(yaw)));
        var pz = (time * dir) * -( Math.sin(-convertToRadians(yaw)));
        vec3.add(position, position, createVector3d(-px, 0.0, -pz));
    }


    function createVector3d(x, y, z) {
        var vec = vec3.create();
        vec3.set(vec, x, y, z);
        return vec;
    }

    function cloneVector3d(vector) {
        return vec3.clone(vector);
    }

    function convertToRadians(angle) {
        return angle * Math.PI / 180.0;
    }

    this.update = update;
    this.updateView = updateView;
    this.move = move;
    this.strafe = strafe;
    this.upDown = upDown;
    this.getPosition = getPosition;
    this.getOrientation = getOrientation;
}
