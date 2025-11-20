import { UserRepository } from "./user.repository.js";
import { AppError } from "../../core/errors/AppError.js";
import { Schema } from "mongoose";

export class UserService {
    private repo: UserRepository;

    constructor() {
        this.repo = new UserRepository();
    }

    async getUserById(id: Schema.Types.ObjectId) {
        const user = await this.repo.findById(id);
        if (!user) throw AppError.notFound("User not found");
        return user;
    }

    async getUserByEmail(email: string) {
        const user = await this.repo.findByEmail(email);
        if (!user) throw AppError.notFound("User not found");
        return user;
    }

    async createUser(data: {
        email: string;
        passwordHash: string;
        name: string;
    }) {
        const existing = await this.repo.findByEmail(data.email);
        if (existing) throw AppError.badRequest("Email already exists");
        
        return this.repo.create(data);
    }

    async updateLastLogin(id: string) {
        return this.repo.updateLastLogin(id);
    }

    async listUsers() {
        return UserModel.find().select("-passwordHash").exec();
    }
}
