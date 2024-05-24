
import loginController from "./loginController.js";
import signupController from "./signupController.js";
import verifyController from "./verifyController.js";
import authControllerMiddlewares from "./authControllerMiddlewares.js";

export default class AuthController {
    constructor() {
        // Bind the sub-controller functions to the AuthController instance
        this.loginController = new loginController();
        this.signupController = new signupController();
        this.verifyController = new verifyController();
        this.authControllerMiddlewares = new authControllerMiddlewares();
      }
}
