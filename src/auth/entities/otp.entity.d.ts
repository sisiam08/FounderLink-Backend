export declare enum OtpPurpose {
    SIGNUP = "signup",
    PASSWORD_RESET = "password_reset"
}
export declare class OTP {
    id: string;
    email: string;
    purpose: OtpPurpose;
    code: string;
    payload: Record<string, unknown>;
    attempts: number;
    expiresAt: Date;
    consumedAt: Date | null;
    createdAt: Date;
}
