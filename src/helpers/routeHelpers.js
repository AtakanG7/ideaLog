import isAuth from '../controllers/authControllers/authControllerMiddlewares.js';
import Config from '../../config/config.js';
const authControllerMiddlewares = new isAuth();

export async function isActiveRoute(route, currentRoute) {
    return route === currentRoute ? 'active' : '';
}

export async function setUserRole(req, res, next) {
    const isAdmin = await authControllerMiddlewares.isAdmin(req, res);
    const isAuthenticated = await authControllerMiddlewares.isAuthenticated(req, res);
    res.locals.isAdmin = isAdmin;
    res.locals.isAuthenticated = isAuthenticated;
    res.locals.user = {
        email: "You look new here. Welcome :)",
    };
    // Get email of the authenticated user
    if(isAuthenticated || isAdmin) {
        const user = await authControllerMiddlewares.getUser(req, res);
        res.locals.user = user;
    }
    next();
}