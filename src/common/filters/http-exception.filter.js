"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let data;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                data = { message: res };
            }
            else if (typeof res === 'object' && res !== null) {
                data = res;
            }
            else {
                data = { message: exception.message };
            }
        }
        else {
            status = 500;
            data = { message: 'Internal server error' };
            this.logger.error(`Unhandled exception: ${String(exception)}`, exception instanceof Error ? exception.stack : undefined);
        }
        response.status(status).json({
            success: false,
            data: {
                statusCode: status,
                ...data,
                path: request.url,
            },
            timestamp: new Date().toISOString(),
        });
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map