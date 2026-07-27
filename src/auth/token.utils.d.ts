export declare const generateToken: () => string;
export declare const hashToken: (token: string, secret: string) => string;
export declare const compareToken: (incomingToken: string, storedToken: string, secret?: string) => boolean;
