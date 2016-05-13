function Camera()
{
    var z = 0.0;
    var x = 0.0;
    var y = 0.0;
    var pitch = 0.0;
    var yaw = 0.0;
    this.getMatrix = function () {
        var matrix = mat4.create();
        var matY = mat4.create();
        var matX = mat4.create();
        var translation = mat4.create();
        mat4.identity(matrix);
        mat4.identity(translation);
        mat4.identity(matX);
        mat4.identity(matY);
        mat4.rotate(matX, _getDeg(pitch), [1, 0, 0]);
        mat4.rotate(matY, _getDeg(yaw), [0, 1, 0]);
        mat4.multiply(matrix, matX);
        mat4.multiply(matrix, matY);
        mat4.translate(matrix, _getPosition());

        return matrix;
    };

    this.setPosition = function(newX, newY ,newZ)
    {
        x  = newX;
        y  = newY;
        z  = newZ;
    };

    this.updateView = function(newYaw, newPitch)
    {
        yaw = newYaw;
        pitch = newPitch;
    };

    var _getPosition = function () {
        var position = vec3.create();
        position[0] = x;
        position[1] = y;
        position[2] = z;
        return position;
    };

    var _getDeg = function (angle) {
        return angle * Math.PI / 180;
    }
}
