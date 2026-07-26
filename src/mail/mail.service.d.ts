import { ConfigService } from '@nestjs/config';
import { OtpPurpose } from "../../../../src/auth/entities/otp.entity";
export declare class MailService {
    private readonly configService;
    private transporter;
    constructor(configService: ConfigService);
    private getTransporter;
    sendOTPMail(to: string, code: string, purpose: OtpPurpose): Promise<void>;
}
