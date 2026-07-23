import { createHash, randomBytes } from "crypto"

export const generateToken = () => {
    return randomBytes(32).toString('hex');
}

export const hashToken = (token: string, secret: string) => {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
}

export const compareToken = (rawToken: string, secret: string, hashedRefreshToken: string) => {
    const newHashToken = hashToken(rawToken, secret);
    return newHashToken === hashedRefreshToken;
}