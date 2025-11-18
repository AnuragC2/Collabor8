import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
    constructor(private authService: AuthService) {}

    register = async(req: Request, res: Response) => {
        const result = await this.authService.register(req.body, {
            ip: req.ip, 
            userAgent: req.headers["user-agent"]
        });

        return res.status(201).json(result);
    }

    login = async (req: Request, res: Response) => {
        const result = await this.authService.login(req.body, {
            ip: req.ip, 
            userAgent: req.headers["user-agent"]
        });

        return res.status(201).json(result);
    }

    refresh = async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        const result = await this.authService.refreshTokens(refreshToken, {
        ip: req.ip,
        userAgent: req.headers["user-agent"]
        });
        return res.status(200).json(result);
    };

    logout = async (req: Request, res: Response) => {
        await this.authService.logout(req.body.sessionId!);
        return res.status(204).send();
    };

    logoutAll = async (req: Request, res: Response) => {
        await this.authService.logoutAll(req.body.user!.id);
        return res.status(204).send();
    };
}