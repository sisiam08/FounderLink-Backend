import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { OtpPurpose } from 'src/auth/entities/otp.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<number>('SMTP_PORT')),
      secure: Boolean(this.configService.getOrThrow<boolean>('SMTP_SECURE')),
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
    });

    return this.transporter;
  }

  async sendOTPMail(
    to: string,
    code: string,
    purpose: OtpPurpose,
  ): Promise<void> {
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

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        text,
        html,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const err = error as { message?: string };
      this.logger.error(
        `SMTP send failed for ${to}: ${err.message}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to send OTP email: ${err.message}`,
      );
    }
  }

  async diagnoseSMTP(to?: string): Promise<Record<string, unknown>> {
    const config = {
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: Number(this.configService.getOrThrow<string>('SMTP_PORT')),
      secure: this.configService.getOrThrow<string>('SMTP_SECURE') === 'true',
      user: this.configService.getOrThrow<string>('SMTP_USER'),
      passIsSet: Boolean(this.configService.getOrThrow<string>('SMTP_PASS')),
      fromEmail: this.configService.getOrThrow<string>('MAIL_FROM_EMAIL'),
    };

    const result: Record<string, unknown> = { config };

    try {
      const transporter = this.getTransporter();
      await transporter.verify();
      result.verify = 'OK';
      result.verifyMessage =
        'SMTP authentication succeeded with the loaded config';
    } catch (error) {
      const err = error as { message?: string; response?: unknown };
      result.verify = 'FAILED';
      result.verifyMessage = err.message;
      if (err.response) result.verifyResponse = err.response;
      return result;
    }

    if (to) {
      try {
        const info = await this.getTransporter().sendMail({
          from: `${config.fromEmail} <${config.fromEmail}>`,
          to,
          subject: 'FounderLink SMTP diagnostic test',
          text: 'If you received this, SMTP works from this environment.',
        });
        result.send = 'OK';
        result.messageId = info.messageId;
      } catch (error) {
        const err = error as { message?: string; response?: unknown };
        result.send = 'FAILED';
        result.sendMessage = err.message;
        if (err.response) result.sendResponse = err.response;
      }
    }

    return result;
  }
}
