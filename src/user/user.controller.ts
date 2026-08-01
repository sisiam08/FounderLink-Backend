import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { Roles } from "src/common/decorators/roles.decorator";
import { SystemRole } from "./entities/user.entity";
import { UpdateUserStatusDto } from "./dto/update-user-status.dto";
import { UserListQueryDto } from "./dto/user-list-query.dto";
import { ChangeUserRoleDto } from "./dto/change-user-role.dto";
import { SessionService } from "src/auth/session.service";

@Controller('users')
@Roles(SystemRole.SUPER_ADMIN, SystemRole.ADMIN)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService
  ) { }

  @Get()
  async getAllUserList(
    @Query() query: UserListQueryDto
  ) {
    return await this.userService.getAllUserList(
      query.page!,
      query.limit!,
      query.status,
      query.systemRole,
      query.search
    );
  }

  @Get(':id')
  async getUserDetail(@Param('id') id: string) {
    return this.userService.getUserDetail(id);
  }

  @Patch(':id/status')
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updatePayload: UpdateUserStatusDto
  ) {
    return this.userService.updateUserStatus(
      id,
      updatePayload.status,
      updatePayload.reason
    );
  }

  @Patch(':id/role')
  async changeUserRole(
    @Param('id') id: string,
    @Body() payload: ChangeUserRoleDto,
  ) {
    return this.userService.changeUserRole(id, payload.systemRole);
  }

   @Get(':id/sessions')
  async getUserSessions(@Param('id') id: string) {
    return this.sessionService.getUserSessions(id);
  }

  @Delete('sessions/:sessionId')
  async revokeSession(
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionService.revokeSession(sessionId);
  }

  @Delete(':id/sessions')
  async revokeAllSessions(
    @Param('id') id: string,
  ) {
    return this.sessionService.revokeAllSessions(id);
  }

}