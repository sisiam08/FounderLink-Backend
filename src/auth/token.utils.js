"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareToken = exports.hashToken = exports.generateToken = void 0;
const crypto_1 = require("crypto");
const generateToken = () => {
    return (0, crypto_1.randomBytes)(32).toString('hex');
};
exports.generateToken = generateToken;
const hashToken = (token, secret) => {
    return (0, crypto_1.createHash)('sha256').update(`${token}${secret}`).digest('hex');
};
exports.hashToken = hashToken;
const compareToken = (incomingToken, storedToken, secret) => {
    if (secret) {
        const hashedIncomingToken = (0, exports.hashToken)(incomingToken, secret);
        return hashedIncomingToken === storedToken;
    }
    return incomingToken === storedToken;
};
exports.compareToken = compareToken;
//# sourceMappingURL=token.utils.js.map