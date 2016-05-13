function loadImage(imageName, handler, errorHandler)
{
    var img = new Image();
    img.onload = function () {
        handler(img, imageName)
    };
    img.onerror = errorHandler;
    img.src = "/images/" + imageName;
}