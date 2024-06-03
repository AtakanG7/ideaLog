import isAuth from '../controllers/authControllers/authControllerMiddlewares.js';

const authControllerMiddlewares = new isAuth();

export async function isActiveRoute(route, currentRoute) {
    return route === currentRoute ? 'active' : '';
}

export async function setUserRole(req, res, next) {
    const isAdmin = await authControllerMiddlewares.isAdmin(req, res);
    const isAuthenticated = await authControllerMiddlewares.isAuthenticated(req, res);
    res.locals.isAdmin = isAdmin;
    res.locals.isAuthenticated = isAuthenticated;
    next();
}