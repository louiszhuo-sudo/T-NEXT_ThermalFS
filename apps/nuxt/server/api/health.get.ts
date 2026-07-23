export default defineEventHandler((event) => {
    setHeader(event, 'Access-Control-Allow-Origin', '*');
    return {
        status: "ok",
        timestamp: Date.now()
    }
});