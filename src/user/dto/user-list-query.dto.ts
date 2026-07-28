import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";
import { SystemRole, UserStatus } from "../entities/user.entity";
import { Type } from "class-transformer";

export class UserListQueryDto {
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 15;

    @IsOptional()
    @IsEnum(UserStatus)
    status?: UserStatus;

    @IsOptional()
    @IsEnum(SystemRole)
    systemRole?: SystemRole;

    @IsOptional()
    @IsString()
    search?: string;
}