import { config } from 'dotenv';
config();

import '@/ai/flows/generate-discrepancy-email-flow.ts';
import '@/ai/flows/document-verification-flow.ts';