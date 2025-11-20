import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service.js";
import { Schema } from "mongoose";

export class UserController {
    private service: UserService;

    constructor() {
        this.service = new UserService();
    }

    // GET /users/me
    getMe = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.user!.id as unknown as Schema.Types.ObjectId;
            const user = await this.service.getUserById(id);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    // GET /users
    listUsers = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.service.listUsers();
            return res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    };

    // POST /users
    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, passwordHash, name } = req.body;
            const user = await this.service.createUser({ email, passwordHash, name });
            return res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    };

    // GET /users/:id
    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as unknown as Schema.Types.ObjectId;
            const user = await this.service.getUserById(id);
            return res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };
}
