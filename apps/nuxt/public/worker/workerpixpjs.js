self.addEventListener('message', function (e) {
    var res = e.data
    var objectName = res.objectName
    // console.log("pixijs", objectName);
    if (res.type === 'splineCurrent' || res.type === 'splineChange') {
        // console.log('worker', res);
        var output = runCurrent(res)
        if (res.type === 'splineChange') {
            var tempArr = output[0].spline[0].map(function (pair) {
                return { lat: pair[0], lng: pair[1] };
            });
            output[0].spline[0] = tempArr
        }
        self.postMessage({ type: res.type, parameter: output, objectName });
    } else if (res.type === 'splineCurrentOnly') {
        var opoint = res.data
        var blobpointlen1 = opoint[0].length
        var blobpoint1 = opoint[0]
        var pr1 = []
        for (var z = 0; z < blobpointlen1; z++) {
            if (z % 2) {
                pr1.push(blobpoint1[z])
            } else {
                pr1.push(blobpoint1[z])
            }
        }
        var spline2 = this.splineCurrent(pr1, 0.5, 25, opoint[1])
        self.postMessage({ type: 'splineCurrentOnly', parameter: transformToPairs(spline2), objectName });
        // console.log(spline2);
    }
    res = null
})
const runCurrent = (res) => {
    var bloblen = res.data[0].length
    var blob = res.data[0]
    for (var i = 0; i < bloblen; i++) {
        var blobpointslen = blob[i].points.length
        var blobpoints = blob[i].points
        var spline = []
        var markerPoint = []
        for (var j = 0; j < blobpointslen; j++) {
            var blobpointlen = blobpoints[j].length
            var blobpoint = blobpoints[j]
            // 
            var x = 0
            var y = 0
            var w = 0
            var h = 0
            var yArr = []
            var xArr = []
            for (var ew = 0; ew < blobpointlen; ew++) {
                if (ew % 2 === 0) {
                    xArr.push(blobpoint[ew] * res.data[2])
                } else {
                    yArr.push(blobpoint[ew] * res.data[1])
                }
            }
            x = Math.min.apply(null, xArr)
            y = Math.min.apply(null, yArr)
            w = Math.max.apply(null, xArr)
            h = Math.max.apply(null, yArr)
            // console.log(x, y, w, h, yArr, xArr);
            // 
            var pr = []
            for (var z = 0; z < blobpointlen; z++) {
                if (z % 2) {
                    pr.push((res.data[1] * blobpoint[z]))
                } else {
                    pr.push((res.data[2] * blobpoint[z]))
                }
            }
            // (backup)20230714 spline 函數移交至後端計算
            var spline1 = this.splineCurrent(pr, 0.5, 25, true)
            // var spline1 = this.splineCurrent(pr, 0, 25, true)
            // console.log('spline1', spline1);
            // (backup)20230714 spline 函數移交至後端計算 end
            const { arr, arr1 } = processSpline(spline1);
            // var spline1 = pr
            // var splinelen = spline1.length
            // var arr = []
            // var tmp = { x: 0, y: 0 }
            // var arr1 = []
            // var tmp1 = [0, 0]
            // for (var sep = 0; sep < splinelen; sep++) {
            //     if (sep % 2) {
            //         tmp.x = spline1[sep]
            //         arr.push(tmp)
            //         tmp = { x: 0, y: 0 }
            //         tmp1[0] = spline1[sep]
            //         arr1.push(tmp1)
            //         tmp1 = [0, 0]
            //     } else {
            //         tmp.y = spline1[sep]
            //         tmp1[1] = spline1[sep]
            //     }
            // }
            // console.log("aarr", h, y);
            var filterAgeThan5 = arr.filter(function (item, index, array) {
                // return item.y > e.data[1][key].y + (e.data[1][key].height * 0) && item.y <= e.data[1][key].y + (e.data[1][key].height * 0.05);
                // return item.y > y + (h * 0) && item.y <= y + (h * 0.05);
                return item.y > y + (h * 0) && item.y >= y + (h * 1);
            });
            filterAgeThan5.sort(compare)
            // console.log('filterAgeThan5',filterAgeThan5);
            markerPoint.push(filterAgeThan5[0])
            // 
            // spline.push(spline1)
            spline.push(processSpline(pr).arr1)
            blobpointlen = null
            blobpoint = null
            pr = null
            spline1 = null
            x = null
            y = null
            w = null
            h = null
            yArr = null
            xArr = null
            tmp = null
            filterAgeThan5 = null
        }
        blob[i].spline = spline
        if (blob[i].blob_alarm_status === 0 || blob[i].blob_alarm_status === 1 && blob[i].blob_temperature_max
            < blob[i].blob_threshold) {
            blob[i].alarmStatus = false
        } else {
            blob[i].alarmStatus = true
        }
        blob[i].markerPoint = markerPoint
        blobpointslen = null
        blobpoints = null
        spline = null
        markerPoint = null
    }
    return blob
    // bloblen = null
    // blob = null
}
function processSpline(spline) {
    const arr = [];
    const arr1 = [];

    for (let i = 0; i < spline.length; i += 2) {
        const x = spline[i + 1];
        const y = spline[i];

        arr.push({ x, y });
        arr1.push([x, y]);
    }

    return { arr, arr1 };
}

function transformToPairs(array) {
    const pairs = [];
    for (let i = 0; i < array.length; i += 2) {
        if (array[i + 1] !== undefined) {
            pairs.push({ lat: array[i + 1], lng: array[i] });
        }
    }
    return pairs;
}
function compare(a, b) {
    if (a.x > b.x) {
        return -1;
    }
    if (a.x < b.x) {
        return 1;
    }
    return 0;
}

function splineCurrent(points, tension, numOfSeg, close) {
    // var points = e.data.points
    // var tension = e.data.tension
    // var numOfSeg = e.data.numOfSeg

    tension = typeof tension === 'number' ? tension : 0.5
    // numOfSeg = typeof numOfSeg === 'number' ? numOfSeg : 25
    numOfSeg = 70

    var pts // for cloning point array
    var i = 1
    var l = points.length
    var rPos = 0
    var rLen = (l - 2) * numOfSeg + 2 + (close ? 2 * numOfSeg : 0)
    var res = new Float32Array(rLen)
    var cache = new Float32Array((numOfSeg + 2) * 4)
    var cachePtr = 4
    var st, st2, st3, st23, st32, parse

    pts = points.slice(0)
    if (close) {
        pts.unshift(points[l - 1]) // insert end point as first point
        pts.unshift(points[l - 2])
        pts.push(points[0], points[1]) // first point as last point
    } else {
        pts.unshift(points[1]) // copy 1. point and insert at beginning
        pts.unshift(points[0])
        pts.push(points[l - 2], points[l - 1]) // duplicate end-points
    }
    // cache inner-loop calculations as they are based on t alone
    cache[0] = 1 // 1,0,0,0
    for (; i < numOfSeg; i++) {
        st = i / numOfSeg
        st2 = st * st
        st3 = st2 * st
        st23 = st3 * 2
        st32 = st2 * 3
        cache[cachePtr++] = st23 - st32 + 1 // c1
        cache[cachePtr++] = st32 - st23 // c2
        cache[cachePtr++] = st3 - 2 * st2 + st // c3
        cache[cachePtr++] = st3 - st2 // c4
    }
    cache[++cachePtr] = 1 // 0,1,0,0

    parse = function (pts, cache, l) {
        var i = 2
        var t, pt1, pt2, pt3, pt4, t1x, t1y, t2x, t2y, c, c1, c2, c3, c4

        for (i; i < l; i += 2) {
            pt1 = pts[i]
            pt2 = pts[i + 1]
            pt3 = pts[i + 2]
            pt4 = pts[i + 3]
            t1x = (pt3 - pts[i - 2]) * tension
            t1y = (pt4 - pts[i - 1]) * tension
            t2x = (pts[i + 4] - pt1) * tension
            t2y = (pts[i + 5] - pt2) * tension
            for (t = 0; t < numOfSeg; t++) {
                // t * 4;
                c = t << 2 // jshint ignore: line
                c1 = cache[c]
                c2 = cache[c + 1]
                c3 = cache[c + 2]
                c4 = cache[c + 3]

                res[rPos++] = c1 * pt1 + c2 * pt3 + c3 * t1x + c4 * t2x
                res[rPos++] = c1 * pt2 + c2 * pt4 + c3 * t1y + c4 * t2y
            }
        }
        i = null
        t = null
        pt1 = null
        pt2 = null
        pt3 = null
        pt4 = null
        t1x = null
        t1y = null
        t2x = null
        t2y = null
        c = null
        c1 = null
        c2 = null
        c3 = null
        c4 = null
    }

    // calc. points
    parse(pts, cache, l)

    if (close) {
        // l = points.length;
        pts = []
        pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]) // second last and last
        pts.push(points[0], points[1], points[2], points[3]) // first and second
        parse(pts, cache, 4)
    }
    // add last point
    l = close ? 0 : points.length - 2
    res[rPos++] = points[l]
    res[rPos] = points[l + 1]

    pts = null
    i = null
    l = null
    rPos = null
    rLen = null
    // res = null
    cache = null
    cachePtr = null
    st = null
    st2 = null
    st3 = null
    st23 = null
    st32 = null
    parse = null

    return res
}