import { User } from "src/user/entities/user.entity";

export interface AuthResult {
    user: Pick<User, 'id' | 'fullName' | 'email'>;
    accessToken: string;
    refreshToken: string;
}