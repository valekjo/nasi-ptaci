import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const birds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/birds' }),
  schema: z.object({
    slug: z.string(),
    czechName: z.string(),
    latinName: z.string(),
    image: z.string().nullable(),
    sound: z.string().nullable(),
    sourceUrl: z.string(),
    order: z.string(),
    family: z.string(),
    sizeLength: z.string(),
    sizeWingspan: z.string(),
    sizeWeight: z.string(),
  }),
});

export const collections = { birds };
