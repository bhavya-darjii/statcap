import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load root .env regardless of working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory

