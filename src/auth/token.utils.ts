import { createHash, randomBytes } from "crypto"

export const generateToken = () => {
    return randomBytes(32).toString('hex');
}

export const hashToken = (token: string, secret: string) => {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
}