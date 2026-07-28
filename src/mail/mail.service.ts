import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { OtpPurpose } from 'src/auth/entities/otp.entity';

@Injectable()
export class MailService {
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
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }
}
