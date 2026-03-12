import { readFileSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';

const birds = JSON.parse(readFileSync('src/data/birds.json', 'utf8'));
const missing = birds.filter(b => !b.image);

console.log(`${missing.length} birds missing images, fetching from source pages...`);

let downloaded = 0;
let failed = 0;

for (const bird of missing) {
  const url = bird.sourceUrl;
  try {
    // Fetch the page HTML
    const html = execSync(`curl -sL "${url}"`, { encoding: 'utf8', timeout: 15000 });

    // Find bird image URL in wp-content/uploads
    // Pattern: src="...wp-content/uploads/....(jpg|png|gif)"
    const imgMatches = [...html.matchAll(/src=["'](https?:\/\/[^"']*wp-content\/uploads\/[^"']+\.(?:jpg|png|gif))/gi)];

    if (imgMatches.length === 0) {
      console.log(`  SKIP ${bird.slug}: no wp-content image found`);
      failed++;
      continue;
    }

    // Take the first wp-content image (the main bird photo)
    const imgUrl = imgMatches[0][1];
    const ext = imgUrl.match(/\.(jpg|png|gif)$/i)[1].toLowerCase();
    const outPath = `public/media/${bird.slug}.${ext}`;

    if (existsSync(outPath)) {
      console.log(`  EXISTS ${bird.slug}`);
      continue;
    }

    execSync(`curl -sL -o "${outPath}" "${imgUrl}"`, { timeout: 15000 });
    console.log(`  OK ${bird.slug} <- ${imgUrl}`);
    downloaded++;
  } catch (err) {
    console.log(`  FAIL ${bird.slug}: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${downloaded} downloaded, ${failed} failed`);
