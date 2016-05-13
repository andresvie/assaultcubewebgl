function MouseInputHandler(element) {
    var events = [];
    var mouseMove = function (event) {
        var dx = getDxFromEvent(event);
        var dy = getDyFromEvent(event);
        events.push([dx, dy]);

    };

    this.getOrientation = function () {
        var dx = 0;
        var dy = 0;
        for (var i = 0; i < events.length; i++) {
            dx += events[i][0];
            dy += events[i][1];
        }
        events = [];
        return [dx || 0, dy || 0];
    };


    var attachPointerLock = function () {
        if (isPointerLockEnable()) {
            element.addEventListener('mousemove', mouseMove, false);
            return;
        }
        element.removeEventListener("mousemove", mouseMove, false);
        registerDocumentClick();
    };

    var isPointerLockEnable = function () {
        return document.pointerLockElement === element ||
            document.mozPointerLockElement === element ||
            document.webkitPointerLockElement === element;
    };
    document.addEventListener('pointerlockchange', attachPointerLock, false);
    document.addEventListener('mozpointerlockchange', attachPointerLock, false);
    document.addEventListener('webkitpointerlockchange', attachPointerLock, false);
    var registerDocumentClick = function () {
        var onClickElement = function () {
            startPointerLock();
            element.removeEventListener("click", onClickElement, false);
        };
        element.addEventListener("click", onClickElement, false);
    };


    function startPointerLock() {
        element.requestPointerLock = element.requestPointerLock ||
            element.mozRequestPointerLock ||
            element.webkitRequestPointerLock;
        element.requestPointerLock();
    }

    function getDxFromEvent(event) {
        return event.movementX ||
            event.mozMovementX ||
            event.webkitMovementX;
    }

    function getDyFromEvent(event) {
        return event.movementY ||
            event.mozMovementY ||
            event.webkitMovementY;
    }

    registerDocumentClick();


}
