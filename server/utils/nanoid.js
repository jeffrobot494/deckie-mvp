import { customAlphabet } from 'nanoid';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const alphabet = process.env.NANOID_ALPHABET || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
const length = parseInt(process.env.NANOID_LENGTH) || 12;

const nanoid = customAlphabet(alphabet, length);

export default nanoid;