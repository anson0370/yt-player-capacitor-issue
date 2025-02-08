import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs/promises'
import { glob } from 'glob'

dotenv.config()

const SOURCE_DIR = path.resolve(process.env.SOURCE_DIR || '../podwise-website') + '/'
const TARGET_DIR = process.cwd() + '/'

const WATCHED_BLOBS = [
  'app/*',
  'app/(signin)/*',
  'app/(signin)/_comp/**/*',
  'app/(signin)/signin/**/*',
  'app/(signin)/confirm/**/*',
  'app/auth/callback/notion/**/*',
  'app/dashboard/*',
  'app/dashboard/trending/**/*',
  'app/dashboard/collections/**/*',
  'app/dashboard/episodes/**/*',
  'app/dashboard/podcasts/**/*',
  'app/dashboard/lists/**/*',
  'app/dashboard/billing/**/*',
  'app/dashboard/settings/**/*',
  'app/dashboard/search/**/*',
  'app/dashboard/ask/**/*',
  'app/dashboard/answer/**/*',
  'components/**/*',
  'cms/**/*',
  'lib/**/*',
  'public/**/*',
  'patches/**/*',
  'audio-api.d.ts',
  'window.d.ts',
  'shikwasa.d.ts',
  'components.json',
  'prisma/schema.prisma',
  'tailwind.config.js',
]

const IGNORED_FILES = [
  'app/global-error.tsx',
  'app/analytics-helper.ts',
  'app/sitemap.ts',
  'app/layout.tsx',
  'app/(signin)/invited/page.tsx',
  'app/(signin)/_comp/oauth-login.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/trending/page.tsx',
  'app/dashboard/trending/episodes/page.tsx',
  'app/dashboard/trending/podcasts/page.tsx',
  'app/dashboard/trending/latest/page.tsx',
  'app/dashboard/collections/page.tsx',
  'app/dashboard/collections/[seq]/page.tsx',
  'app/dashboard/episodes/[id]/page.tsx',
  'app/dashboard/episodes/i/[id]/page.tsx',
  'app/dashboard/episodes/_comp/offline-helper.tsx',
  'app/dashboard/podcasts/[id]/page.tsx',
  'app/dashboard/lists/[id]/page.tsx',
  'app/dashboard/lists/s/[id]/page.tsx',
  'app/dashboard/billing/page.tsx',
  'app/dashboard/billing/_comp/platform-specific-purchase.tsx',
  'app/dashboard/billing/invite-program/page.tsx',
  'app/dashboard/answer/[hash]/page.tsx',
  'lib/cap-fetcher.ts',
  'lib/platform-tools.ts',
  'components/ui/link.tsx',
  'components/ui/save-button.tsx',
  'components/preferences.tsx',
  'components/share.tsx',
  'components/request-review.tsx',
  'components/dashboard/root-provider.tsx',
  'components/dashboard/notification-provider.tsx',
  'components/dashboard/send/send-to-logseq-dialog.tsx',
  'public/firebase-messaging-sw.js',
]

// const REDIRECTS = {
//   'app/dashboard/episodes/[id]/**/*': 'app/dashboard/episodes/segments',
// }
// const redirectMatchers = Object.keys(REDIRECTS).map((pattern) => {
//   return {
//     matcher: pm(pattern),
//     pattern,
//   }
// })

console.log('Source dir:', SOURCE_DIR)
console.log('Target dir:', TARGET_DIR)

async function handleFile(file, ignoreFileTimes) {
  const { fullpath, mtimeMs } = file
  const relativePath = fullpath.replace(SOURCE_DIR, '')

  if (IGNORED_FILES.includes(relativePath)) {
    return;
  }

  const targetFilePath = path.join(TARGET_DIR, relativePath)

  let targetFileStat = null
  try {
    targetFileStat = await fs.stat(targetFilePath)
  } catch (e) {
    if (e.code === 'ENOENT') {
      // do nothing
    } else {
      throw e
    }
  }
  if (targetFileStat == null) {
    await fs.mkdir(path.dirname(targetFilePath), { recursive: true })
  } else {
    if (Math.round(targetFileStat.mtimeMs) === Math.round(mtimeMs)) {
      return;
    }
  }
  console.log('Copyfile', relativePath)
  await fs.cp(fullpath, targetFilePath, {
    mode: fs.constants.COPYFILE_FICLONE,
    preserveTimestamps: true,
  })
}

async function loadIgnoreFileTimes() {
  const file = TARGET_DIR + '.sync.json';

  try {
    await fs.stat(file);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return {};
    }
  }

  const fileBuffer = await fs.readFile(TARGET_DIR + '.sync.json');

  try {
    return JSON.parse(fileBuffer.toString('utf-8'));
  } catch (e) {
    return {};
  }
}

async function writeIgnoreFileTimes(ignoreFileTimes) {
  const file = TARGET_DIR + '.sync.json';

  await fs.writeFile(file, JSON.stringify(ignoreFileTimes, null, 2))
}

async function mergePackageJsonDependencies() {
  const sourcePackageJson = await fs.readFile(SOURCE_DIR + 'package.json', 'utf-8')
  const targetPackageJson = await fs.readFile(TARGET_DIR + 'package.json', 'utf-8')

  const sourcePackage = JSON.parse(sourcePackageJson)
  const targetPackage = JSON.parse(targetPackageJson)

  const mergedPackage = {
    ...targetPackage,
    dependencies: {
      ...targetPackage.dependencies,
      ...sourcePackage.dependencies,
    },
    devDependencies: {
      ...targetPackage.devDependencies,
      ...sourcePackage.devDependencies,
    },
  }
  // order dependencies and devDependencies by alpha-beta order
  mergedPackage.dependencies = Object.fromEntries(Object.entries(mergedPackage.dependencies).sort())
  mergedPackage.devDependencies = Object.fromEntries(Object.entries(mergedPackage.devDependencies).sort())

  await fs.writeFile(TARGET_DIR + 'package.json', JSON.stringify(mergedPackage, null, 2) + '\n')
}

(async function main() {
  const paths = await glob(WATCHED_BLOBS, { cwd: SOURCE_DIR, nodir: true, stat: true, withFileTypes: true })

  const files = paths.map((filePath) => {
    return {
      fullpath: filePath.fullpath(),
      mtimeMs: filePath.mtimeMs,
    }
  })

  const ignoreFileTimes = await loadIgnoreFileTimes();

  for (const file of files) {
    const relativePath = file.fullpath.replace(SOURCE_DIR, '')

    if (IGNORED_FILES.includes(relativePath)) {
      const lastSyncMtime = ignoreFileTimes[relativePath];
      if (lastSyncMtime != null && lastSyncMtime !== file.mtimeMs) {
        console.log('Ignore file changed after last sync: ', relativePath);
      }
      ignoreFileTimes[relativePath] = file.mtimeMs;
      continue;
    }
    await handleFile(file, ignoreFileTimes);
  }

  await writeIgnoreFileTimes(ignoreFileTimes);

  await mergePackageJsonDependencies();
})()
