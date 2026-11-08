import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
dotenv.config({path:fileURLToPath(new URL('../.env',import.meta.url))});
dotenv.config({path:fileURLToPath(new URL('./.env',import.meta.url))});
export const timezone=process.env.RESTAURANT_TIMEZONE || 'Asia/Karachi';
