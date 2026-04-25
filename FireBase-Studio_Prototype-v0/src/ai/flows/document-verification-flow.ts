'use server';
/**
 * @fileOverview A Genkit flow for HR document verification.
 *
 * - verifyDocument - A function that handles the HR document verification process using AI.
 * - DocumentVerificationInput - The input type for the verifyDocument function.
 * - DocumentVerificationOutput - The return type for the verifyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentTypeSchema = z.enum([
  '졸업증명서',
  '자격증',
  '경력증명서',
  '성적증명서',
  '기타',
]);

const DocumentVerificationInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A candidate's HR document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: DocumentTypeSchema.describe('The type of HR document being verified.'),
  applicantName: z.string().describe("The name of the applicant submitting the document."),
  referenceData: z
    .string()
    .optional()
    .describe(
      'Optional: JSON string containing reference data from an external database for comparison. The AI should use this data to cross-reference and verify the authenticity of the document.'
    ),
});
export type DocumentVerificationInput = z.infer<typeof DocumentVerificationInputSchema>;

const DocumentVerificationOutputSchema = z.object({
  status: z
    .enum(['PASS', 'FAIL', 'MANUAL_REVIEW'])
    .describe('The verification status: PASS, FAIL, or MANUAL_REVIEW.'),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe('The AI confidence score for the verification, from 0 to 100.'),
  extractedData: z
    .record(z.string(), z.string())
    .describe('Key-value pairs of extracted information from the document by OCR.'),
  discrepancies: z
    .array(z.string())
    .describe(
      'An array of strings detailing any discrepancies found between the document and reference data. If no discrepancies, it should be an empty array.'
    ),
  reason: z.string().describe('A detailed explanation for the assigned verification status.'),
});
export type DocumentVerificationOutput = z.infer<typeof DocumentVerificationOutputSchema>;

export async function verifyDocument(
  input: DocumentVerificationInput
): Promise<DocumentVerificationOutput> {
  return documentVerificationFlow(input);
}

const documentVerificationPrompt = ai.definePrompt({
  name: 'documentVerificationPrompt',
  input: {schema: DocumentVerificationInputSchema},
  output: {schema: DocumentVerificationOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an expert HR document verification specialist for HR BooleanAI. Your task is to meticulously examine a submitted HR document, extract key information using OCR, compare it against any provided reference data, and determine its authenticity and validity.\n\nThe document type is: {{{documentType}}}\nThe applicant's name is: {{{applicantName}}}\n\n{{#if referenceData}}\nYou are provided with the following reference data from an external database in JSON format. Use this to cross-reference and verify the document's content:\n{{{referenceData}}}\n{{/if}}\n\nExamine the following document image:\n{{media url=documentDataUri}}\n\nBased on your analysis, provide a verification status, a confidence score, all key extracted information from the document, any specific discrepancies found, and a detailed reason for your decision.\n\n- Assign 'PASS' if the document appears authentic, valid, and fully consistent with reference data (if provided).\n- Assign 'FAIL' if the document is clearly fraudulent, invalid, or has significant, unresolvable discrepancies.\n- Assign 'MANUAL_REVIEW' if there are minor discrepancies, ambiguous information, or if your confidence in the verification is low (e.g., below 70%), requiring human intervention.\n\nWhen listing discrepancies, be specific, for example: "발급일자 불일치: OCR 2024.03.15 ≠ 기관 DB 2024.04.15". If there are no discrepancies, provide an empty array.\nExtracted data should include all relevant fields such as document number, dates, issuer, names, etc., depending on the document type.`,
});

const documentVerificationFlow = ai.defineFlow(
  {
    name: 'documentVerificationFlow',
    inputSchema: DocumentVerificationInputSchema,
    outputSchema: DocumentVerificationOutputSchema,
  },
  async input => {
    const {output} = await documentVerificationPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from document verification prompt.');
    }
    return output;
  }
);
