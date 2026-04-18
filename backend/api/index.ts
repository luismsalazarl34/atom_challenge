import 'dotenv/config';
import { createApp } from '../src/app';

const jwtSecret = process.env['JWT_SECRET'] ?? '';

export default createApp(jwtSecret);
