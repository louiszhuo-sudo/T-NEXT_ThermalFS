export default defineNuxtRouteMiddleware((to, from) => {
    // isAuthenticated() is an example method verifying if a user is authenticated
    const { user, loggedIn } = useJwtAuth()
    console.log('defineNuxtRouteMiddleware', user);
    if (!loggedIn) {
        return navigateTo('/login')
    }
})