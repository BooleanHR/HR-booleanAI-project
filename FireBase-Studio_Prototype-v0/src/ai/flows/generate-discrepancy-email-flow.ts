'use server';
/**
 * @fileOverview A Genkit flow for generating a draft email to an applicant regarding document verification discrepancies.
 *
 * - generateDiscrepancyEmail - A function that handles the email generation process.
 * - GenerateDiscrepancyEmailInput - The input type for the generateDiscrepancyEmail function.
 * - GenerateDiscrepancyEmailOutput - The return type for the generateDiscrepancyEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiscrepancyDetailSchema = z.object({
  itemName: z.string().describe('The name of the item with a discrepancy (e.g., "발급일자").'),
  ocrValue: z.string().describe('The value extracted by OCR.'),
  dbValue: z.string().describe('The value from the reference database.'),
  description: z
    .string()
    .describe(
      'A detailed description of the discrepancy (e.g., "OCR 2024.03.15 ≠ 기관 DB 2024.04.15").'
    ),
});

const GenerateDiscrepancyEmailInputSchema = z.object({
  applicantName: z.string().describe('The name of the applicant.'),
  documentType: z.string().describe('The type of document (e.g., "경력증명서", "졸업증명서").'),
  discrepancies: z
    .array(DiscrepancyDetailSchema)
    .describe('A list of discrepancies found in the document.'),
});
export type GenerateDiscrepancyEmailInput = z.infer<typeof GenerateDiscrepancyEmailInputSchema>;

const GenerateDiscrepancyEmailOutputSchema = z.object({
  emailBody: z.string().describe('The drafted email body for the applicant.'),
});
export type GenerateDiscrepancyEmailOutput = z.infer<
  typeof GenerateDiscrepancyEmailOutputSchema
>;

export async function generateDiscrepancyEmail(
  input: GenerateDiscrepancyEmailInput
): Promise<GenerateDiscrepancyEmailOutput> {
  return generateDiscrepancyEmailFlow(input);
}

const generateDiscrepancyEmailPrompt = ai.definePrompt({
  name: 'generateDiscrepancyEmailPrompt',
  input: {schema: GenerateDiscrepancyEmailInputSchema},
  output: {schema: GenerateDiscrepancyEmailOutputSchema},
  prompt: `You are an HR assistant writing an email to an applicant about discrepancies found in their submitted document.
Your task is to draft a polite and clear email in Korean, summarizing the identified issues and suggesting necessary actions for re-submission or clarification.

Applicant Name: {{{applicantName}}}
Document Type: {{{documentType}}}
Discrepancies:
{{#each discrepancies}}
- Item: {{itemName}}
  OCR Value: {{ocrValue}}
  Database Value: {{dbValue}}
  Details: {{{description}}}
{{/each}}

Please generate the email body. Ensure it includes:
1.  A polite greeting to the applicant.
2.  A statement that discrepancies were found in the submitted document.
3.  A clear list of each discrepancy, including the item name, OCR value, and actual database value.
4.  A section for "보완 요청 서류" (Requested Supplementary Documents) that outlines specific actions the applicant needs to take based on the discrepancies. For example, if the issue is a date mismatch, suggest re-submission of a document with the correct date.
5.  Include the following fixed lines at the end of the email:
    "■ 재제출 링크: [서류 재제출 바로가기]
    ■ 문의: 채용담당자 대시보드 링크
    감사합니다.
    HR BooleanAI 시스템"`,
});

const generateDiscrepancyEmailFlow = ai.defineFlow(
  {
    name: 'generateDiscrepancyEmailFlow',
    inputSchema: GenerateDiscrepancyEmailInputSchema,
    outputSchema: GenerateDiscrepancyEmailOutputSchema,
  },
  async input => {
    const {output} = await generateDiscrepancyEmailPrompt(input);
    return output!;
  }
);
