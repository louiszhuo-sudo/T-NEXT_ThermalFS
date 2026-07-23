importScripts('turf.min.js');
self.addEventListener('message', function (e) {
    var res = e.data
    if (res.type === 'intersection') {
        var data = res.parameter
        // var output = []
        var latlngs2233 = data.main
        data.object.forEach((item, index) => {
            var newPath = runIntersection(latlngs2233[0][0], item)
            if (newPath) {
                latlngs2233[0].push(newPath)
            }
        })
        // console.log("wk", latlngs2233);
        self.postMessage({ type: res.type, parameter: latlngs2233 });
    }
})
function runIntersection(path1, path2) {
    const polygon1 = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                path1
            ],
        },
    };

    const polygon2 = {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [
                path2
            ],
        },
    };

    // 計算交集
    const intersection = turf.intersect(polygon1, polygon2);
    // console.log('intersection', intersection);
    if (intersection?.geometry.coordinates) {
        return intersection.geometry.coordinates;
    } else {
        return false
    }
}