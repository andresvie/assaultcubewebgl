var SOLID_TYPE = 0;
var CORNER_TYPE = 1;
var FHF_TYPE = 2;
var CHF_TYPE = 3;
var NO_COLLISION = 0;
var SOLID_COLLISION = 1;
var CORNER_COLLISION = 2;
var FLOOR_COLLISION = 8;
var FLOOR_STICK_ON_STEP_COLLISION = 16;
var FLOOR_RISE_TO_STAIR_COLLISION = 32;
var CEIL_COLLISION = 64;
var WORLD_ENTITY_TYPE = 0;
var WORLD_ENTITY_FLOOR = 1;
var WORLD_ENTITY_CEIL = 2;
var WORLD_ENTITY_VERTICAL_DELTA = 3;
var onTime = false;
function MapPhysic(worldPhysicEntities, worldScaleFactor) {
    this.collideWithMap = function (x, y, z, playerRadius, playerHeight, playerAboveEye) {
        var worldPosition = getWorldPhysicCoordinate(x, z);
        var wx = worldPosition[0];
        var wy = worldPosition[1];
        return getCollision(-y, wx, wy, playerRadius, playerHeight, playerAboveEye);
    };

    this.getMapEntitiesAtPoint = function (x, auxY, z, playerRadius) {
        var worldPosition = getWorldPhysicCoordinate(x, z);
        var wx = worldPosition[0];
        var wy = worldPosition[1];
        var left = wx - playerRadius;
        var right = wx + playerRadius;
        var near = wy - playerRadius;
        var far = wy + playerRadius;
        var worldEntities = [];
        var worldEntity;
        var worldEntityAtPosition;
        var x0 = parseInt(left);
        var x1 = parseInt(right);
        var y0 = parseInt(near);
        var y1 = parseInt(far);
        for (var y = y0; y <= y1; y++) {
            for (var x = x0; x <= x1; x++) {
                worldEntityAtPosition = {};
                worldEntity = getWorldEntity(x, y);
                //worldEntityAtPosition["position"] = [-y + 8, worldEntity[WORLD_ENTITY_FLOOR] + 0.1, -x + 10];
                worldEntityAtPosition["position"] = [-y -4, 10.0, -x - 4];

                worldEntityAtPosition["type"] = worldEntity[WORLD_ENTITY_TYPE];
                worldEntities.push(worldEntityAtPosition);
            }
        }
        return worldEntities;
    };

    function getCollision(y, wx, wy, playerRadius, playerHeight, playerAboveEye) {
        var collisionInfo = getCollisionInfo(wx, wy, playerRadius, playerHeight);
        var collisionType = collisionInfo[0];
        var floorHeight = collisionInfo[1];
        var ceilingHeight = collisionInfo[2];
        collisionType = collisionType | getFloorOrCeilCollision(y, playerHeight, playerAboveEye, floorHeight, ceilingHeight);
        return [collisionType, floorHeight, ceilingHeight];
    }

    function getFloorOrCeilCollision(y, playerHeight, playerAboveEye, floorHeight, ceilHeight) {
        var collisionType = isOnFloorCollision(y, playerHeight, floorHeight);
        return collisionType | isOnCeilCollision(y, ceilHeight, floorHeight, playerHeight, playerAboveEye);
    }


    function isOnFloorCollision(y, playerHeight, floorHeight) {
        var floorDistance = y - floorHeight - playerHeight;
        if (floorDistance >= 0.0)
        {
            return NO_COLLISION;
        }
        if (floorDistance > -0.01) {
            return FLOOR_STICK_ON_STEP_COLLISION;
        }
        else if (floorDistance > -1.26) {

            return FLOOR_RISE_TO_STAIR_COLLISION;
        }
        return SOLID_COLLISION;
    };

    function isOnCeilCollision(y, ceilHeight, floorHeight, playerHeight, playerAboveEye)
    {
        var ceilDistance = ceilHeight - (y + playerAboveEye);
        var floorDistance = y - (floorHeight - playerHeight);
        if (ceilDistance > 0)
        {
            return NO_COLLISION;
        }

        if(floorDistance < 0.1)
        {
            return NO_COLLISION;
        }
        return CEIL_COLLISION;

    }


    function getCollisionInfo(wx, wy, playerRadius, playerheight) {
        var left = wx - playerRadius;
        var right = wx + playerRadius;
        var near = wy - playerRadius;
        var far = wy + playerRadius;
        var worldEntity;
        var vDelta;
        var type;
        var x0 = parseInt(left);
        var x1 = parseInt(right);
        var y0 = parseInt(near);
        var y1 = parseInt(far);
        var floorHeight = -512;
        var ceilingHeight = 512;
        for (var y = y0; y <= y1; y++) {
            for (var x = x0; x <= x1; x++) {
                worldEntity = getWorldEntity(x, y);
                var floor = worldEntity[WORLD_ENTITY_FLOOR];
                var ceil = worldEntity[WORLD_ENTITY_CEIL];
                type = worldEntity[WORLD_ENTITY_TYPE];
                vDelta = worldEntity[WORLD_ENTITY_VERTICAL_DELTA];
                if (type == SOLID_TYPE) {
                    return [SOLID_COLLISION, floorHeight, ceilingHeight];
                }
                if (type == CORNER_TYPE && isCornerCollision(x, y, left, right, near, far)) {
                    return [CORNER_COLLISION, floorHeight, ceilingHeight];
                }
                if (type == FHF_TYPE) {
                    var auxFloor = (vDelta + getWorldEntity(x + 1, y)[WORLD_ENTITY_VERTICAL_DELTA] + getWorldEntity(x, y + 1)[WORLD_ENTITY_VERTICAL_DELTA] + getWorldEntity(x + 1, y + 1)[WORLD_ENTITY_VERTICAL_DELTA]) / 16.0;
                    floor -= auxFloor;

                }
                if (type == CHF_TYPE) {
                    var auxCeil = (vDelta + getWorldEntity(x + 1, y)[WORLD_ENTITY_VERTICAL_DELTA] + getWorldEntity(x, y + 1)[WORLD_ENTITY_VERTICAL_DELTA] + getWorldEntity(x + 1, y + 1)[WORLD_ENTITY_VERTICAL_DELTA]) / 16.0;
                    ceil += auxCeil;
                }

                if (floor > floorHeight) {
                    floorHeight = worldEntity[WORLD_ENTITY_FLOOR];
                }
                if (ceil < ceilingHeight) {
                    ceilingHeight = worldEntity[WORLD_ENTITY_CEIL];
                }
            }
        }
        onTime = true;
        if (ceilingHeight - floorHeight < playerheight) {
            return [SOLID_COLLISION, floorHeight, ceilingHeight];
        }
        return [NO_COLLISION, floorHeight, ceilingHeight];
    }


    function isCornerCollision(x, y, x0, x1, y0, y1) {
        var ix0 = parseInt(x0);
        var iy0 = parseInt(y0);
        var ix1 = parseInt(x1);
        var iy1 = parseInt(y1);
        var isCollision = (x == ix1 && y == iy1) && isCorner(x, y, 1, 1);
        isCollision = isCollision || ((x == ix0 && y == iy0) && isCorner(x, y, -1, -1));
        isCollision = isCollision || ((x == ix1 && y == iy0) && isCorner(x, y, 1, -1));
        return isCollision || ((x == ix0 && y == iy1) && isCorner(x, y, -1, 1));

    }

    function isCorner(x, y, dx, dy) {
        return isSolid(x + dx, y) && isSolid(x, y + dy);

    }

    function isSolid(x, y) {
        var solidWorldEntity = getWorldEntity(x, y);
        return solidWorldEntity[WORLD_ENTITY_TYPE] == SOLID_COLLISION;
    }

    function getWorldEntity(x, y) {
        var index = y << worldScaleFactor;
        index += x;
        return worldPhysicEntities[index];
    }

    function getWorldPhysicCoordinate(x, z) {
        return [z, x];
    }


}
