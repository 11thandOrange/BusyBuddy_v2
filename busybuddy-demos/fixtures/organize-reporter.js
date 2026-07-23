import fs from 'fs';
import path from 'path';

const DEST = { video: 'videos', trace: 'traces', screenshot: 'screenshots' };

// One shared subfolder per workflow run, e.g. videos/2026-07-22_20-15-00/ -
// record-demos.yml sets DEMO_RUN_FOLDER once per run so every spec in that
// run lands together instead of each overwriting the last run's file.
// Falls back to 'local' so `npx playwright test` still works unset.
const RUN_FOLDER = process.env.DEMO_RUN_FOLDER || 'local';

function slugify(testFilePath) {
  // scripts/announcement-bar/02-create-bar.spec.js -> announcement-bar-create-bar
  const rel = path.relative(path.resolve('./scripts'), testFilePath);
  const appDir = path.dirname(rel);
  const fileSlug = path
    .basename(rel, '.spec.js')
    .replace(/^\d+-/, '');
  return `${appDir}-${fileSlug}`;
}

const EXT = { video: '.webm', trace: '.zip', screenshot: '.png' };

/** Copies each test's video/trace/screenshot out of Playwright's per-test
 * outputDir into busybuddy-demos/{videos,traces,screenshots}/ with a
 * descriptive filename derived from the spec's directory + name, per the
 * approved demo plan (e.g. announcement-bar-create-bar.webm). */
export default class OrganizeReporter {
  onTestEnd(test, result) {
    const slug = slugify(test.location.file);
    const seen = {};

    for (const attachment of result.attachments) {
      if (!attachment.path || !DEST[attachment.name]) continue;
      seen[attachment.name] = (seen[attachment.name] || 0) + 1;
      const suffix = seen[attachment.name] > 1 ? `-${seen[attachment.name]}` : '';
      const destDir = path.resolve(DEST[attachment.name], RUN_FOLDER);
      fs.mkdirSync(destDir, { recursive: true });
      const destPath = path.join(destDir, `${slug}${suffix}${EXT[attachment.name]}`);
      fs.copyFileSync(attachment.path, destPath);
    }
  }
}
