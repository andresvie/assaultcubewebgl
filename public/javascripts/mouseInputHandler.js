function MouseInputHandler(canvas) {
    var events = [];
    var mouseMove = function (event) {
        var dx = getDxFromEvent(event);
        var dy = getDyFromEvent(event);
        events.push([dx, dy]);

    };

    this.getMouseRelativeMovement = function () {
        var dx = 0;
        var dy = 0;
        for (var i = 0; i < events.length; i++) {
            dx += events[i][0];
            dy += events[i][1];
        }
        events = [];
        return [dx, dy];
    };


    var attachPointerLock = function () {
        if (isPointerLockEnable()) {
            canvas.addEventListener('mousemove', mouseMove, false);
            return;
        }
        canvas.removeEventListener("mousemove", mouseMove, false);
        registerDocumentClick();
    };

    var isPointerLockEnable = function () {

        return document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas;
    };
    document.addEventListener('pointerlockchange', attachPointerLock, false);
    document.addEventListener('mozpointerlockchange', attachPointerLock, false);
    document.addEventListener('webkitpointerlockchange', attachPointerLock, false);
    var registerDocumentClick = function () {
        $(document).click(function (event) {
            event.preventDefault();
            startPointerLock();
            $(document).off("click");
        });
    };

    registerDocumentClick();

    function startPointerLock() {
        canvas.requestPointerLock = canvas.requestPointerLock ||
            canvas.mozRequestPointerLock ||
            canvas.webkitRequestPointerLock;
        canvas.requestPointerLock();
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


}
