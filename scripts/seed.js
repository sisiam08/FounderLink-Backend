"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: path.resolve(__dirname, '..', '.env') });
async function seed() {
    const ds = new typeorm_1.DataSource({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: true },
        entities: [path.resolve(__dirname, '..', 'dist', '**', '*.entity.js')],
    });
    await ds.initialize();
    console.log('Database connected');
    const userRepo = ds.getRepository('User');
    const seeds = [
        { email: 'admin@founderlink.io', password: 'Admin@1234', fullName: 'Platform Admin', role: 'admin' },
        { email: 'super@founderlink.io', password: 'Super@1234', fullName: 'Super Admin', role: 'super_admin' },
    ];
    for (const s of seeds) {
        const exists = await userRepo.findOne({ where: { email: s.email } });
        if (exists) {
            console.log(`  SKIP ${s.email} — already exists`);
            continue;
        }
        const passwordHash = await bcrypt.hash(s.password, 10);
        await userRepo.save({
            email: s.email,
            password: passwordHash,
            fullName: s.fullName,
            systemRole: s.role,
        });
        console.log(`  CREATED ${s.email} (${s.role})`);
    }
    await ds.destroy();
    console.log('Done');
}
async function main() {
    try {
        await seed();
    }
    catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}
void main();
//# sourceMappingURL=seed.js.map