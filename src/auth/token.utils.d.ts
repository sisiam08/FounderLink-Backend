export declare const generateToken: () => any;
export declare const hashToken: (token: string, secret: string) => any;
export declare const compareToken: (incomingToken: string, storedToken: string, secret?: string) => boolean;
