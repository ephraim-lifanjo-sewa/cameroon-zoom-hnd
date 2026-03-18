'use server';
/**
 * @fileOverview AI intent interpreter for natural language search.
 *
 * - interpretSearchIntent - Translates natural language into structured filters.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretSearchInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
});

const InterpretSearchOutputSchema = z.object({
  category: z.string().optional().describe('The identified business category.'),
  minRating: z.number().optional().describe('Minimum star rating requested.'),
  intentSnippet: z.string().describe('A short, catchy AI interpretation of what the user is looking for.'),
  isSurpriseRequest: z.boolean().describe('Whether the user is asking for a recommendation/surprise.'),
});

export async function interpretSearchIntent(input: { query: string }) {
  const {output} = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    input: input,
    output: {schema: InterpretSearchOutputSchema},
    prompt: `You are a local guide AI for Cameroon Zoom. Interpret the user's search query to help them find businesses.
    
    Query: "{{query}}"
    
    Identify if they are looking for a specific category (e.g., "Food", "Health", "Tech"), 
    if they have a rating preference, and create a 3-5 word catchy snippet of their intent.
    Also, detect if they are asking for a surprise or a random recommendation.`,
  });
  return output!;
}
