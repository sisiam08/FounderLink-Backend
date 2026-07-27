import { SystemRole } from "../../../../../src/user/entities/user.entity";
export declare const ROLE_KEY = "roles";
export declare const Roles: (...roles: SystemRole[]) => import("@nestjs/common").CustomDecorator<string>;
