import 'dotenv/config';
import { createApp } from './app';

const jwtSecret = process.env['JWT_SECRET'] ?? '';
const port = process.env['PORT'] ?? 3000;

if (!jwtSecret) {
  console.warn('WARNING: JWT_SECRET is not set.');
}

const app = createApp(jwtSecret);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
