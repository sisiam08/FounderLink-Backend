import { ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService
    ) { }

    private asserUserActive(user: User): void {
        if (user.status === UserStatus.SUSPENDED) throw new ForbiddenException("Account is suspended");

        if (user.status === UserStatus.BANNED) throw new ForbiddenException("Account is banned");
    }

    async login(payload: LoginDto): Promise<Partial<User> & { accessToken: string }> {
        const { email, password } = payload;

        try {
            const user = await this.userRepo.findOne({
                where: {
                    email
                },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    password: true,
                    status: true,
                    systemRole: true
                }
            })
            if (!user || !user.password) {
                throw new UnauthorizedException("Invalid Credentials!")
            }
            const isPasswordValid = await bcrypt.compare(password, user.password!);

            if (!isPasswordValid) {
                throw new UnauthorizedException("Invalid Credentials!");
            }

            this.asserUserActive(user);

            const accessToken = this.jwtService.sign({ id: user.id, email: user.email, role: user.systemRole })

            const { password: _password, ...restUser } = user;
            return {
                ...restUser,
                accessToken
            };
        } catch (error) {
            throw new InternalServerErrorException("Internal Server Error");
        }
    }
}
