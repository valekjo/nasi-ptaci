import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DATA_DIR = 'data';
const MEDIA_DIR = 'public/media';
const OUTPUT_JSON = 'src/data/birds.json';
const OUTPUT_CONTENT = 'src/content/birds';

async function main() {
  const files = (await readdir(DATA_DIR)).filter(f => f.endsWith('.md'));
  const mediaFiles = await readdir(MEDIA_DIR);

  // Index media by slug
  const imagesBySlug = new Map();
  const soundsBySlug = new Map();

  for (const f of mediaFiles) {
    const ext = extname(f).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      const slug = f.replace(/\.[^.]+$/, '');
      imagesBySlug.set(slug, `/media/${f}`);
    }
    if (ext === '.mp3') {
      // Pattern: NNN-slug-1.mp3
      const match = f.match(/^\d+-(.+)-1\.mp3$/);
      if (match) {
        soundsBySlug.set(match[1], `/media/${f}`);
      }
    }
  }

  await mkdir(OUTPUT_CONTENT, { recursive: true });

  const birds = [];

  for (const file of files) {
    const content = await readFile(join(DATA_DIR, file), 'utf-8');

    // Filter: only bird species pages (have taxonomy OR Velikost section)
    const isBird = content.includes('## Velikost') || /Řád:/.test(content);
    if (!isBird) continue;

    const slug = file.replace('.md', '');

    // Extract Czech name: try #### line first, then **Name (Latin)** line, then title frontmatter
    const nameMatch = content.match(/^####\s+(.+)$/m);
    let czechName = nameMatch ? nameMatch[1].trim() : '';
    if (!czechName) {
      const boldMatch = content.match(/^\*\*([^*(]+?)\s*\(/m);
      if (boldMatch) czechName = boldMatch[1].trim();
    }
    if (!czechName) {
      const titleMatch = content.match(/^title:\s*"([^"]+?)(?:\s+NAŠI PTÁCI| - ).*"/m);
      if (titleMatch) czechName = titleMatch[1].trim();
    }
    if (!czechName) czechName = slug;

    // Extract Latin name from **CzechName (LatinName)** or **CzechName ( _LatinName_ )** pattern
    let latinName = '';
    const latinMatch = content.match(/\*\*[^*]+\(\s*[_*]?\s*([A-Z][a-z]+ [a-z]+)\s*[_*]?\s*\)\s*\*\*/);
    if (latinMatch) {
      latinName = latinMatch[1];
    }

    // Extract taxonomy - strip all markdown formatting
    const cleanMd = s => s.replace(/\\?\*/g, '').replace(/[_`]/g, '').replace(/\s*\d+\s*$/, '').trim();
    const taxonomy = {};
    const orderMatch = content.match(/Řád:\s*(.+?)(?:\n|\r)/);
    if (orderMatch) {
      let ord = cleanMd(orderMatch[1]);
      // Remove footnotes and extra notes after the main value
      ord = ord.replace(/\s*[–—]\s*\(.*$/, '').replace(/\s*\(Někdy.*$/, '');
      taxonomy.order = ord;
    }
    const familyMatch = content.match(/Čeleď:\s*(.+?)(?:\n|\r)/);
    if (familyMatch) {
      let fam = cleanMd(familyMatch[1]);
      // Remove notes/footnotes
      fam = fam.replace(/\s*[–—-]\s*Poznámka.*$/, '');
      taxonomy.family = fam;
    }

    // Extract size - only from lines starting with the keyword (avoids body text matches)
    const size = {};
    const lengthMatch = content.match(/^[Dd]élka[^:]*:\s*([^\n]+)/m);
    if (lengthMatch) size.length = lengthMatch[1].trim();
    const wingspanMatch = content.match(/^[Rr]ozpětí[^:]*:\s*([^\n]+)/m);
    if (wingspanMatch) size.wingspan = wingspanMatch[1].trim();
    const weightMatch = content.match(/^[Hh]motnost[^:]*:\s*([^\n]+)/m);
    if (weightMatch) size.weight = weightMatch[1].trim();

    // Match media
    const image = imagesBySlug.get(slug) || null;
    const sound = soundsBySlug.get(slug) || null;

    // Extract original URL
    const urlMatch = content.match(/^url:\s*"([^"]+)"/m);
    const sourceUrl = urlMatch ? urlMatch[1] : `https://nasiptaci.info/${slug}/`;

    birds.push({
      slug,
      czechName,
      latinName,
      taxonomy,
      size,
      image,
      sound,
      sourceUrl,
    });

    // Generate content markdown with frontmatter
    // Strip the YAML frontmatter, title line, date, and image link from original
    let body = content;
    // Remove original frontmatter
    body = body.replace(/^---[\s\S]*?---\n*/, '');
    // Remove the H1 title line
    body = body.replace(/^# .+\n*/m, '');
    // Remove the #### name line
    body = body.replace(/^#### .+\n*/m, '');
    // Remove date line
    body = body.replace(/^\d{1,2}\.\d{1,2}\.\d{4}\n*/m, '');
    // Remove image link blocks (## [![...] or standalone [![...])
    body = body.replace(/^(?:## )?\[!\[[\s\S]*?\]\(.*?\)\s*\n*/m, '');
    // Also remove any residual line with just a link fragment
    body = body.replace(/^[^\n]*\]\(http[^\n]*\)\s*\n*/m, '');

    // Use JSON.stringify for safe YAML string values
    const y = s => JSON.stringify(s || '');
    const frontmatter = [
      '---',
      `slug: ${y(slug)}`,
      `czechName: ${y(czechName)}`,
      `latinName: ${y(latinName)}`,
      `image: ${image ? y(image) : 'null'}`,
      `sound: ${sound ? y(sound) : 'null'}`,
      `sourceUrl: ${y(sourceUrl)}`,
      `order: ${y(taxonomy.order)}`,
      `family: ${y(taxonomy.family)}`,
      `sizeLength: ${y(size.length)}`,
      `sizeWingspan: ${y(size.wingspan)}`,
      `sizeWeight: ${y(size.weight)}`,
      '---',
      '',
    ].join('\n');

    await writeFile(join(OUTPUT_CONTENT, `${slug}.md`), frontmatter + body.trim() + '\n');
  }

  // Sort by Czech name
  birds.sort((a, b) => a.czechName.localeCompare(b.czechName, 'cs'));

  await mkdir('src/data', { recursive: true });
  await writeFile(OUTPUT_JSON, JSON.stringify(birds, null, 2));

  // Stats
  const withImage = birds.filter(b => b.image).length;
  const withSound = birds.filter(b => b.sound).length;
  console.log(`Found ${birds.length} birds (${withImage} with images, ${withSound} with sounds)`);
}

main().catch(err => { console.error(err); process.exit(1); });
