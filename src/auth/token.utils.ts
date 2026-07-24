import { createHash, randomBytes } from "crypto"

export const generateToken = () => {
    return randomBytes(32).toString('hex');
}

export const hashToken = (token: string, secret: string) => {
    return createHash('sha256').update(`${token}${secret}`).digest('hex');
}

export const compareToken = (
  incomingToken: string,
  storedToken: string,
  secret?: string,
) => {
  if (secret) {
    const hashedIncomingToken = hashToken(incomingToken, secret);
    return hashedIncomingToken === storedToken;
  }
  return incomingToken === storedToken;
};