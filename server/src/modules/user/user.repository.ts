import {UserModel, UserDocument} from './user.model.js';
import {Schema} from 'mongoose';

export class UserRepository {
    async findByEmail(email: string): Promise<UserDocument | null> {
        return UserModel.findOne({email}).exec();
    }

    async findById(id: Schema.Types.ObjectId): Promise<UserDocument | null> {
        return UserModel.findById(id).exec();
    }

    async create(data: {
        email: string; 
        passwordHash: string; 
        name: string;
    }): Promise<UserDocument> {
        const user = new UserModel(data);
        return user.save();
    }

    async updateLastLogin(id: string): Promise<void> {
        await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() }).exec();
    }
}