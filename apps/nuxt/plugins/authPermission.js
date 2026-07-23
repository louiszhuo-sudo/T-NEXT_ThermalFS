export default defineNuxtPlugin(() => {
    return {
        provide: {
            permissionsPlugins: (user, msg) => {
                try {
                    var p = user.permission.findIndex((item) => item === msg);
                    return p !== -1

                } catch (err) { console.log(err); return false; }
            },

        }
    }
})