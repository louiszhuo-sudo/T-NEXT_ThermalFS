<template>
    <div style="height: 100%; width: 100%;z-index: 0;">
        <LMap :ref="'map'" :min-zoom="state.minZoom" :crs="state.crs" style="height: 100%; width: 100%"
            :options="state.mapOptions" @ready="mapInitialized">
        </LMap>
    </div>
</template>
<script setup>
import L from 'leaflet'
useHead({
    script: [{ src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.markercluster.js' },
    { src: '/js/Leaflet.markercluster-1.4.1/dist/leaflet.geometryutil.js' },
    { src: '/js/turf.min.js' },
        // { src: '/js/L.PixiOverlay.js' }, // 目前沒有用到pixijs
    ]
});

const state = reactive({
    // map
    map: null,
    minZoom: -3,
    maxZoom: 20,
    crs: L.CRS.Simple,
    mapOptions: {
        dragging: true,
        zoomSnap: 0.05,
        zoomDelta: 0.05,
        zoomAnimation: false,
        wheelDebounceTime: 40,
        wheelPxPerZoomLevel: 200,
        doubleClickZoom: false,
        zoomControl: false,
        attributionControl: false
    }
})
const mapInitialized = () => {
    console.log('mapInitialized');
}
</script>
<style scoped>
</style>