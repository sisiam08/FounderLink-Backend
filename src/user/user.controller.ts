import { Controller, Get, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { SystemRole } from "./entities/user.entity";

@Controller('users')
export class UserController {
    constructor(private readonly UserService: UserService) { }

    @Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
    @Get()
    async getAllUserList(
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('status') status?: string,
        @Query('systemRole') systemRole?: string,
        @Query('search') search?: string,
    ) {
        return await this.UserService.getAllUserList(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 15,
            status,
            systemRole,
            search
        );
    }
}
