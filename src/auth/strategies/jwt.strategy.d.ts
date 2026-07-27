import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { AuthenticatedUser, JwtPayload } from "../interfaces/auth.interface";
import { UserSession } from "../entities/user-session.entity";
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly sessionRepo;
    constructor(configService: ConfigService, sessionRepo: Repository<UserSession>);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
