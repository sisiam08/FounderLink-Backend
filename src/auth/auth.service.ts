import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    async signup(payload: SignupDto): Promise<Pick<User, 'id' | 'fullName' | 'email' | 'status'>> {
        const { fullName, email, password } = payload;
        try {
            const existingUser = await this.userRepo.findOne({
                where: {
                    email
                }
            })

            if (existingUser) {
                throw new ConflictException("Email already registered!")
            }
            const saltRound = Number(this.configService.getOrThrow<number>('SALT_ROUND'));

            const passwordHash = await bcrypt.hash(password, saltRound);

            const newUser = this.userRepo.create({
                fullName,
                email,
                password: passwordHash
            });

            const data = await this.userRepo.save(newUser);

            const { password: _password, googleId, ...restUser } = data;
            return restUser;
        } catch (error) {
            throw error
        }
    }
}
