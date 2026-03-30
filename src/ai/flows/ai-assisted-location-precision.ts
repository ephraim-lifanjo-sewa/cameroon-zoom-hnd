'use server';
/**
 * @fileOverview An AI agent that refines business location precision.
 *
 * - refineLocationPrecision - A function that takes an address description and GPS coordinates, and refines the GPS coordinates for better precision.
 * - RefineLocationPrecisionInput - The input type for the refineLocationPrecision function.
 * - RefineLocationPrecisionOutput - The return type for the refineLocationPrecision function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineLocationPrecisionInputSchema = z.object({
  addressDescription: z
    .string()
    .describe(
      'A detailed textual description of the business address, including nearby landmarks and neighborhood information.'
    ),
  latitude: z.number().describe('The latitude of the business location.'),
  longitude: z.number().describe('The longitude of the business location.'),
});
export type RefineLocationPrecisionInput = z.infer<typeof RefineLocationPrecisionInputSchema>;

const RefineLocationPrecisionOutputSchema = z.object({
  adjustedLatitude: z.number().describe('The refined latitude of the business location.'),
  adjustedLongitude: z.number().describe('The refined longitude of the business location.'),
  explanation: z
    .string()
    .describe('Explanation of why the location was adjusted, if applicable.'),
});
export type RefineLocationPrecisionOutput = z.infer<typeof RefineLocationPrecisionOutputSchema>;

export async function refineLocationPrecision(
  input: RefineLocationPrecisionInput
): Promise<RefineLocationPrecisionOutput> {
  return refineLocationPrecisionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineLocationPrecisionPrompt',
  input: {schema: RefineLocationPrecisionInputSchema},
  output: {schema: RefineLocationPrecisionOutputSchema},
  prompt: `You are an expert in location refinement. Given a business address description and its current GPS coordinates, your task is to determine if the GPS coordinates should be adjusted for greater precision.

Address Description: {{{addressDescription}}}
Latitude: {{{latitude}}}
Longitude: {{{longitude}}}

1.  Analyze the address description to identify specific landmarks, building names, or other details that can help pinpoint the exact location.
2.  Determine if the provided GPS coordinates accurately reflect the described location. If the coordinates seem imprecise (e.g., placing the business in the middle of a block rather than at a specific building), suggest adjustments.
3.  If adjustments are needed, provide the adjusted latitude and longitude values. Also, include a brief explanation of why the adjustments were made.
4.  If the provided GPS coordinates appear to be accurate based on the address description, return the original coordinates and indicate that no adjustments are necessary.

Output the adjusted latitude, adjusted longitude, and explanation in JSON format.

If no adjustments are needed, adjustedLatitude and adjustedLongitude should match the input latitude and longitude.
`,
});

const refineLocationPrecisionFlow = ai.defineFlow(
  {
    name: 'refineLocationPrecisionFlow',
    inputSchema: RefineLocationPrecisionInputSchema,
    outputSchema: RefineLocationPrecisionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
