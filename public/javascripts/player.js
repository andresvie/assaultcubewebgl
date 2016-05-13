function Player(camera, mapPhysic) {

    var pitch = 0;
    var jumpVelocity = 10.0;
    var gravity = 20.0;
    var playerRadius = 1.1;
    var playerHeight = 4.5;
    var playerAboveEye = 0.7;
    var lookResistance = 33;
    var lookVelocity = 3;
    var timeOnAir = 0;
    var friction = 24.0;
    var speed = 0.040;
    var lastGunMovement = 0.0;
    var maxSpeed = 16.0;
    var gunMovementDirX = 0.0;
    var gunMovementDirY = 0.0;
    var gunMovementDirZ = 0.0;
    var gunMovementMillis = 0.0;
    var x = 209;
    var y = -12.5;
    var z = 270;
    var onFloor = true;
    var yaw = 0;
    var vx = 0.0;
    var vz = 0.0;
    var vy = 0.0;
    var gunPitch = 0;
    var gunYaw = 0;
    //var gunScaleFactor = 0.05;
    var gunScaleFactor = 0.03;
    var clampFloorHeight = 0.01;

    this.updateLook = function (dx, dy) {
        yaw += (lookVelocity * dx / lookResistance);
        yaw = yaw % 360.0;
        pitch += (lookVelocity * dy / lookResistance);
        if (pitch > 90) {
            pitch = 90.0;
        }
        if (pitch < -90.0) {
            pitch = -90.0;
        }
        gunYaw = (-yaw) + 90;
        gunPitch = -pitch;
        camera.updateView(yaw, pitch);
    };

    this.getGunModelMatrix = function (lastTime, gunAngleAnimation, aimDir, gunRecoil) {
        return getGunModel(lastTime, gunAngleAnimation, aimDir, gunRecoil);
    };

    this.jump = function () {
        if (!onFloor) {
            return;
        }
        onFloor = false;
        timeOnAir = 0;
        vy += jumpVelocity;
    };

    function getGunModel(lastTime, gunAngleAnimation, aimDir, gunRecoil) {
        var model = mat4.create();
        mat4.identity(model);
        mat4.translate(model, calculateGunPosition(lastTime, aimDir, gunRecoil));
        mat4.rotate(model, _getDeg(gunYaw), [0, 1, 0]);
        mat4.rotate(model, _getDeg(gunPitch + gunAngleAnimation), [0, 0, 1]);
        mat4.scale(model, [gunScaleFactor, gunScaleFactor, gunScaleFactor]);
        return model;
    }

    function calculateGunPosition(lastTime, aimDir, gunRecoil) {
        gunMovementMillis += clamp(lastTime - lastGunMovement, 0, 200);
        lastGunMovement = lastTime;
        updateAndDecreaseGunMovement(lastTime);
        var px = x;
        var py = y;
        var pz = z;
        var swapX = aimDir[0];
        var swapY = aimDir[1];
        var swapZ = aimDir[2];
        var gunMovementSpeed = getGunMovementSpeed();
        var gunSpeedMove = Math.sin(gunMovementSpeed) / 10.0;
        var gunUpSpeed = Math.cos(gunMovementSpeed) / 10.0;
        var playerSpeed = getPlayerSpeed();
        gunSpeedMove *= (playerSpeed * 0.5);
        gunUpSpeed *= (playerSpeed * 0.5);
        gunUpSpeed = Math.abs(gunUpSpeed);
        var auxSwap = swapX;
        swapX = swapZ;
        swapZ = auxSwap;
        swapY = gunUpSpeed;
        swapX *= gunSpeedMove;
        swapZ *= gunSpeedMove;
        px += (aimDir[0] * gunRecoil) + swapX;
        py += (aimDir[1] * gunRecoil) + swapY;
        pz += (aimDir[2] * gunRecoil) + swapZ;
        return [-px, -py, -pz];

    }

    function updateAndDecreaseGunMovement(lastTime) {
        var k = Math.pow(0.7, (lastTime - lastGunMovement) / 10.0);
        var gunMoveDecrease = (1 - k) / Math.max(getPlayerSpeed(), maxSpeed);
        gunMovementDirX *= k;
        gunMovementDirZ *= k;
        var dX = (vx * gunMoveDecrease) * 1.5;
        var dZ = (vz * gunMoveDecrease) * 0.4;
        gunMovementDirX = gunMovementDirX + dX;
        gunMovementDirY = 1.0;
        gunMovementDirZ = gunMovementDirZ + dZ;
    }

    function getPlayerSpeed() {
        var speed = (vx * vx) + (vz * vz);
        return Math.min(1.0, Math.sqrt(speed));
    }

    function getGunMovementSpeed() {
        return (gunMovementMillis / 150.0);
    }


    this.getWorldEntities = function () {
        return mapPhysic.getMapEntitiesAtPoint(x, y, z, playerRadius, playerHeight);
    };

    this.movePlayer = function (strafe, move, currentTime) {
        var numberOfSteps = 10;
        var deltaStepCollision = 1.0 / numberOfSteps;
        var time = currentTime / 10.0;
        var drop = getDrop(currentTime);
        var rise = getRise(numberOfSteps);
        var playerDeltaSpeed = calculateDeltaMovementSpeed(move, strafe);
        var nextStep = playerStep.bind(this, playerDeltaSpeed, drop, rise, deltaStepCollision, time);
        for (var i = 0; i < numberOfSteps; i++) {
            nextStep();
        }
        onAir(currentTime);
        if (onFloor) {
            timeOnAir = 0;
        }
        camera.setPosition(x, y, z);
    };

    function playerStep(deltaMovementSped, drop, rise, deltaStep, time) {
        x += ((deltaMovementSped[0] * speed) * time) * deltaStep;
        y -= ((deltaMovementSped[1] * speed) * time) * deltaStep;
        y += (drop * deltaStep * 2);
        z += ((deltaMovementSped[2] * speed) * time) * deltaStep;
        var collisionInfo = mapPhysic.collideWithMap(x, y, z, playerRadius, playerHeight, playerAboveEye);
        var floorHeight = collisionInfo[1];
        onFloor = (-y) - playerHeight - floorHeight < clampFloorHeight;
        if (!thereIsCollision(collisionInfo)) {
            return;
        }
        onCollision(deltaMovementSped, rise, drop, deltaStep, time, collisionInfo);
    }

    function getRise(numberOfSteps) {
        return speed / numberOfSteps / 1.2;
    }

    function getDrop(currentTime) {
        var drop = 0.0;
        if (!onFloor) {
            drop = (gravity - 1) + (timeOnAir / 15.0);
            drop = (drop * currentTime) / (gravity * 1000);
        }
        return drop;
    }

    function thereIsCollision(collisionInfo) {
        var collisionType = collisionInfo[0];
        return collisionType != NO_COLLISION;

    }

    function onCollision(deltaMovementSped, rise, drop, deltaStep, time, collisionInfo) {
        var collisionType = collisionInfo[0];
        var floorHeight = collisionInfo[1];
        var ceilHeight = collisionInfo[2];
        var isSolid = ((collisionType & SOLID_COLLISION) != 0) || ((collisionType & CORNER_COLLISION) != 0);
        var isOnCeil = (collisionType & CEIL_COLLISION) != 0;
        var isFloorCollision = (collisionType & (FLOOR_COLLISION | FLOOR_RISE_TO_STAIR_COLLISION | FLOOR_STICK_ON_STEP_COLLISION)) != 0;
        if (isSolid) {
            onSolidCollision(deltaMovementSped, deltaStep, time);
        }
        if (isFloorCollision) {
            onFloorCollision(deltaMovementSped, floorHeight, collisionType, rise, drop);
        }
        if (isOnCeil) {
            onCeilCollision(ceilHeight);
        }
    }

    function onAir(time) {
        timeOnAir += time;
    }

    function calculateDeltaMovementSpeed(move, strafe) {
        var dx = Math.sin(-_getDeg(yaw)) * move;
        var dz = Math.cos(-_getDeg(yaw)) * move;
        dx -= Math.cos(-_getDeg(-yaw)) * strafe;
        dz += (Math.sin(_getDeg(-yaw))) * strafe;
        velTime(friction - 1.0);
        vx = vx + dx;
        vz = vz + dz;
        velTime(1 / friction);
        return [vx, vy, vz];
    }

    function onFloorCollision(deltaMovementSpeed, floorHeight, floorCollisionType, rise, drop) {
        if ((floorCollisionType & FLOOR_COLLISION) != 0) {
            deltaMovementSpeed[1] = 0;
            return;
        }
        if ((floorCollisionType & FLOOR_STICK_ON_STEP_COLLISION) != 0) {
            y = -(playerHeight + floorHeight);
            return;
        }
        y -= rise;
    }

    function onSolidCollision(deltaMovementSpeed, deltaStep, time) {
        x -= ((deltaMovementSpeed[0] * speed) * time) * (deltaStep);
        z -= ((deltaMovementSpeed[2] * speed) * time) * (deltaStep);
        deltaMovementSpeed[0] = 0.0;
        deltaMovementSpeed[2] = 0.0;
    }

    function onCeilCollision(ceilHeight) {
        y = -(ceilHeight - playerAboveEye);
        vy = 0.0;
    }

    function velTime(multiplier) {
        vx = vx * multiplier;
        vy = vy * multiplier;
        vz = vz * multiplier;

    }


    function _getDeg(angle) {
        return angle * Math.PI / 180;
    }

}
