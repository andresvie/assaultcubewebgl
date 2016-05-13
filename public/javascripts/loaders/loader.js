var DONE_XML_HTTP_REQUEST = 4;
var HTTP_STATUS_OK = 200;
function loadBinaryResources(resources, onResourcesCompleted, onResourceFail) {
    loadResources(resources, onResourcesCompleted, onResourceFail, "arraybuffer");
}


function loadJSonResources(resources, onResourcesCompleted, onResourceFail) {
    loadResources(resources, onResourcesCompleted, onResourceFail, "json");
}

function loadResources(resources, onResourcesCompleted, onResourceFail, contentResponse) {
    var resourcesCompleted = {};
    var requestFinish = onResourceFinish.bind({}, resources.length, resourcesCompleted, onResourcesCompleted, onResourceFail);
    for (var i = 0; i < resources.length; i++) {
        getResource(resources[i], requestFinish, contentResponse);
    }

}

function getResource(request, onRequestFinish, contentResponse) {
    var resourceRequest = new XMLHttpRequest();
    resourceRequest.open("GET", request, true);
    resourceRequest.responseType = contentResponse;
    resourceRequest.onreadystatechange = function (state) {
        if (state == DONE_XML_HTTP_REQUEST) {
            onRequestFinish(resourceRequest, request);
        }
    };
    resourceRequest.send(null);
}


function onResourceFinish(numberOfRequest, resourcesCompleted, onResourcesCompleted, onResourceFail, resourceRequest, requestUrl) {
    var response = resourceRequest.response;
    var status = resourceRequest.status;
    if (status != HTTP_STATUS_OK)
    {
        onResourceFail(requestUrl, status, response);
        return;
    }
    resourcesCompleted[requestUrl] = response;
    if (numberOfRequest != Object.keys(resourcesCompleted).length) {
        return;
    }
    onResourcesCompleted(resourcesCompleted);
}