import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { AuthenticatedUser, JwtPayload } from "../interfaces/auth.interface";
import { UserSession } from "../entities/user-session.entity";
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly sessionRepo;
    constructor(configService: ConfigService, sessionRepo: Repository<UserSession>);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
