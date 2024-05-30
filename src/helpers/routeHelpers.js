export function isActiveRoute(route, currentRoute) {
    return route === currentRoute ? 'active' : '';
}