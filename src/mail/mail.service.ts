import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { OtpPurpose } from '../auth/entities/otp.entity';

interface SendGridError {
  message?: string;
  response?: { body?: { errors?: Array<{ message?: string }> } };
}

@Injectable()
export class MailService {
  private initialized = false;

  constructor(private readonly configService: ConfigService) {}

  private initSendGrid(): void {
    if (this.initialized) return;
    sgMail.setApiKey(
      this.configService.getOrThrow<string>('SENDGRID_API_KEY'),
    );
    this.initialized = true;
  }

  private buildMail(to: string, code: string, purpose: OtpPurpose) {
    const fromName = this.configService.getOrThrow<string>('MAIL_FROM_NAME');
    const fromEmail = this.configService.getOrThrow<string>('MAIL_FROM_EMAIL');

    const expiry = this.configService.getOrThrow<string>('OTP_EXPIRES_IN');
    const expiryInMin = parseInt(expiry, 10);

    const subject =
      purpose === OtpPurpose.SIGNUP
        ? 'Verify your email - FounderLink'
        : 'Reset your password - FounderLink';

    const intro =
      purpose === OtpPurpose.SIGNUP
        ? 'Welcome to FounderLink! Use the code below to verify your email and complete your signup.'
        : 'We received a request to reset your password. Use the code below to continue.';

    const text = `${intro}\n\nYour verification code is: ${code}\nThis code expires in ${expiryInMin} minute(s).\n\nIf you did not request this, you can ignore this email.`;

    const html = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1a1a1a;">
        <h2>FounderLink</h2>
        <p>${intro}</p>
        <p style="font-size: 14px; margin-bottom: 4px;">Your verification code is:</p>
        <h1 style="letter-spacing: 6px; margin: 0 0 8px 0; color: #2c3e50;">${code}</h1>
        <p style="font-size: 13px; color: #666;">This code expires in ${expiryInMin} minute(s).</p>
        <p style="font-size: 13px; color: #666;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    return { from: `${fromName} <${fromEmail}>`, to, subject, text, html };
  }

  private extractError(error: SendGridError): string {
    const errors = error.response?.body?.errors;
    if (errors && errors.length > 0) {
      return errors.map((e) => e.message).filter(Boolean).join(', ');
    }
    return error.message || String(error);
  }

  async sendOTPMail(
    to: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
    try {
      this.initSendGrid();
      await sgMail.send(this.buildMail(to, code, purpose));
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const err = error as SendGridError;
      const message = this.extractError(err);
      throw new InternalServerErrorException(
        `Failed to send OTP email: ${message}`,
      );
    }
  }
}
