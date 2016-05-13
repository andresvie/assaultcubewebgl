function createFrustumFromViewProjection(viewProjection) {
    return createFrustumPlane(viewProjection);
}

function isCubeInterceptingFrustum(cubePoints, frustum) {
    for (var i = 0; i < cubePoints.length; i++) {
        if (containPointOnFrustum(cubePoints[i], frustum)) {
            return true;
        }
    }
    return false;

}

function containPointOnFrustum(point, frustum) {
    var contain = containPointOnPlane(point, frustum[0]) && containPointOnPlane(point, frustum[1]);
    contain = contain || (containPointOnPlane(point, frustum[2]) && containPointOnPlane(point, frustum[3]));
    contain = contain || (containPointOnPlane(point, frustum[4]) && containPointOnPlane(point, frustum[4]));
    return contain;
}


function containPointOnPlane(point, plane) {
    var planeDistance = getPlaneDistance(point, plane);
    return planeDistance >= 0.0;
}


function getPlaneDistance(point, plane) {
    return (point[0] * plane[0]) + (point[1] * plane[1]) + (point[2] * plane[2]) + plane[3];
}

function createFrustumBox(frustumLimits) {

    var xMin = frustumLimits[0][0];
    var xMax = frustumLimits[0][1];
    var yMin = frustumLimits[1][0];
    var yMax = frustumLimits[1][1];
    var zMin = frustumLimits[2][0];
    var zMax = frustumLimits[2][1];
    var p0 = createPoint(xMin, yMin, zMax);
    var p1 = createPoint(xMax, yMin, zMax);
    var p2 = createPoint(xMin, yMax, zMax);
    var p3 = createPoint(xMax, yMax, zMax);
    var p4 = createPoint(xMin, yMin, zMin);
    var p5 = createPoint(xMax, yMin, zMin);
    var p6 = createPoint(xMin, yMax, zMin);
    var p7 = createPoint(xMax, yMax, zMin);
    return [p0, p1, p2, p3, p4, p5, p6, p7];
}


function createPoint(x, y, z) {
    var point = vec3.create();
    vec3.set(point, x, y, z);
    return point;
}

function createFrustumPlane(mvp) {
    var wPlane = getWPlane(mvp);
    var left = getLeftPlane(mvp, wPlane);
    var right = getRightPlane(mvp, wPlane);
    var top = getTopPlane(mvp, wPlane);
    var bottom = getBottomPlane(mvp, wPlane);
    var near = getNearPlane(mvp, wPlane);
    var far = getFarPlane(mvp, wPlane);
    return [left, right, top, bottom, near, far];
}

function getWPlane(mvp) {
    return getAxis(mvp, 3);
}

function getLeftPlane(mvp, wPlane) {
    var xAxis = getXAxis(mvp);
    return calculatePlane(xAxis, wPlane);
}


function getRightPlane(mvp, wPlane) {
    var xAxis = getXAxis(mvp);
    xAxis = negate(xAxis);
    return calculatePlane(xAxis, wPlane);
}


function getBottomPlane(mvp, wPlane) {
    var yAxis = getYAxis(mvp);
    return calculatePlane(yAxis, wPlane);
}

function getTopPlane(mvp, wPlane) {
    var yAxis = getYAxis(mvp);
    yAxis = negate(yAxis);
    return calculatePlane(yAxis, wPlane);
}

function getNearPlane(mvp, wPlane) {
    var zAxis = getZAxis(mvp);
    return calculatePlane(zAxis, wPlane);
}

function getFarPlane(mvp, wPlane) {
    var zAxis = getZAxis(mvp);
    zAxis = negate(zAxis);
    return calculatePlane(zAxis, wPlane);
}


function negate(plane) {
    var planeNegate = new Float32Array(4);
    for (var i = 0; i < 4; i++) {
        planeNegate[i] = plane[i] * -1.0;
    }
    return planeNegate;
}

function calculatePlane(axis, wPlane) {
    var plane = new Float32Array(4);
    for (var i = 0; i < 4; i++) {
        plane[i] = axis[i] + wPlane[i];
    }
    return plane;
}


function getYAxis(mvp) {
    return getAxis(mvp, 1);
}

function getXAxis(mvp) {
    return getAxis(mvp, 0);
}

function getZAxis(mvp) {
    return getAxis(mvp, 2);
}

function getAxis(mvp, index) {
    var axis = new Float32Array(4);
    axis[0] = mvp[0 + index];
    axis[1] = mvp[4 + index];
    axis[2] = mvp[8 + index];
    axis[3] = mvp[12 + index];
    return axis;
}