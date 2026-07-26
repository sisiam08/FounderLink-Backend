"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLE_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLE_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map