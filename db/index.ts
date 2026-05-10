import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as authSchema from './schema/auth';
import * as jejakSchema from './schema/jejak';

const schema = { ...authSchema, ...jejakSchema };

const sql = postgres(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });