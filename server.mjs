import express from 'express';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {S3Client, PutObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const minioBucket = process.env.MINIO_BUCKET || 'vector-style';
const minioEndpoint =
  process.env.MINIO_ENDPOINT || 'https://minio-api.n8n-omersahin.cfd';
const publicBaseUrl =
  process.env.MINIO_PUBLIC_BASE_URL || 'https://minio-api.n8n-omersahin.cfd';
const concurrency = Math.max(1, Number(process.env.REMOTION_CONCURRENCY || 1));

const requiredEnv = ['MINIO_ACCESS_KEY', 'MINIO_SECRET_KEY'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}

const s3 = new S3Client({
  endpoint: minioEndpoint,
  region: process.env.MINIO_REGION || 'us-east-1',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
});

let serveUrlPromise;
const getServeUrl = () => {
  if (!serveUrlPromise) {
    serveUrlPromise = bundle({
      entryPoint: path.join(__dirname, 'remotion/index.ts'),
      webpackOverride: (config) => config,
    });
  }
  return serveUrlPromise;
};

let active = 0;
const queue = [];

const withRenderSlot = async (job) => {
  if (active >= concurrency) {
    await new Promise((resolve) => queue.push(resolve));
  }
  active += 1;
  try {
    return await job();
  } finally {
    active -= 1;
    const next = queue.shift();
    if (next) next();
  }
};

const publicUrlFor = (key) =>
  `${publicBaseUrl.replace(/\/+$/, '')}/${minioBucket}/${key
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;

const renderToFile = async ({compositionId, inputProps, outputPath}) => {
  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    inputProps,
    outputLocation: outputPath,
    pixelFormat: 'yuv420p',
    chromiumOptions: {
      enableMultiProcessOnLinux: true,
      ignoreCertificateErrors: false,
    },
  });
};

const renderStillToFile = async ({compositionId, inputProps, frame, outputPath}) => {
  const serveUrl = await getServeUrl();
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
  });

  await renderStill({
    composition,
    serveUrl,
    frame,
    inputProps,
    output: outputPath,
    chromiumOptions: {
      enableMultiProcessOnLinux: true,
      ignoreCertificateErrors: false,
    },
  });
};

const app = express();
app.use(express.json({limit: '2mb'}));

app.get('/health', (_req, res) => {
  res.json({status: 'ok'});
});

// Human-verified scene-recipe catalog. The Scene Composer agent picks a recipeId
// and fills its slots; a deterministic Materialize step expands the recipe into
// final inputProps. Recipes are versioned JSON files under catalog/.
const catalogDir = path.join(__dirname, 'catalog');
const stylePath = path.join(__dirname, 'style.json');
app.get('/catalog', async (_req, res) => {
  try {
    const style = JSON.parse(await fs.readFile(stylePath, 'utf8'));
    const files = await fs.readdir(catalogDir);
    const recipes = [];
    for (const f of files.sort()) {
      if (!f.endsWith('.json')) continue;
      recipes.push(JSON.parse(await fs.readFile(path.join(catalogDir, f), 'utf8')));
    }
    res.json({style, count: recipes.length, recipes});
  } catch (error) {
    res.status(500).json({
      error: 'catalog_failed',
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Phone-friendly gallery of Past Tense outputs straight from MinIO.
// /preview            -> video list
// /preview/:video     -> per-chunk beat images, beat mp4s, plan doc, final chunk mp4
const listAll = async (prefix) => {
  const keys = [];
  let token;
  do {
    const out = await s3.send(
      new ListObjectsV2Command({
        Bucket: minioBucket,
        Prefix: prefix,
        ContinuationToken: token,
      }),
    );
    for (const o of out.Contents || []) keys.push(o.Key);
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return keys;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
const pageShell = (title, body) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)}</title>
<style>body{font-family:-apple-system,sans-serif;background:#14161c;color:#eee;margin:0;padding:16px}
a{color:#8ecdf7}h1,h2{font-weight:600}img,video{width:100%;border-radius:10px;background:#000}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.card{background:#1d2129;border-radius:12px;padding:10px}.muted{color:#9aa3b2;font-size:13px}
pre{white-space:pre-wrap;background:#1d2129;padding:12px;border-radius:10px;font-size:12px;overflow-x:auto}</style>
</head><body>${body}</body></html>`;

app.get('/preview', async (_req, res) => {
  try {
    const keys = await listAll('past-tense/');
    const videos = [...new Set(keys.map((k) => k.split('/')[1]).filter(Boolean))].sort();
    const items = videos
      .map((v) => `<li><a href="/preview/${encodeURIComponent(v)}">${esc(v)}</a></li>`)
      .join('');
    res.send(pageShell('Past Tense previews', `<h1>Past Tense videos</h1><ul>${items || '<li>none yet</li>'}</ul>`));
  } catch (error) {
    res.status(500).send(String(error));
  }
});

app.get('/preview/:video', async (req, res) => {
  try {
    const video = req.params.video;
    const base = `past-tense/${video}/`;
    const keys = await listAll(base);
    const pub = (k) => `${publicBaseUrl}/${minioBucket}/${k}`;
    const chunkNums = [...new Set(
      keys.map((k) => (k.match(/render\/c(\d+)_beat_/) || [])[1]).filter(Boolean),
    )].map(Number).sort((a, b) => a - b);
    let body = `<p><a href="/preview">&larr; videos</a></p><h1>${esc(video)}</h1>`;
    const vo = keys.find((k) => k.includes('/voiceover/full_voiceover'));
    if (vo) body += `<div class="card"><div class="muted">full voiceover</div><audio controls style="width:100%" src="${pub(vo)}"></audio></div>`;
    for (const c of chunkNums) {
      body += `<h2>Chunk ${c}</h2>`;
      const chunkMp4 = keys.find((k) => k === `${base}chunks/chunk_${c}.mp4`);
      if (chunkMp4) body += `<div class="card"><div class="muted">chunk_${c}.mp4</div><video controls preload="metadata" src="${pub(chunkMp4)}"></video></div>`;
      const plan = keys.find((k) => k === `${base}plan/chunk_${c}.md`);
      if (plan) body += `<p class="muted"><a href="${pub(plan)}">plan/chunk_${c}.md</a></p>`;
      const beats = keys
        .filter((k) => new RegExp(`render/c${c}_beat_(\\d+)_bg\\.png$`).test(k))
        .sort((a, b) => Number(a.match(/beat_(\d+)_/)[1]) - Number(b.match(/beat_(\d+)_/)[1]));
      body += `<div class="grid">` + beats.map((k) => {
        const n = k.match(/beat_(\d+)_/)[1];
        const mp4 = keys.find((x) => x === k.replace('_bg.png', '.mp4'));
        return `<div class="card"><div class="muted">beat ${n}</div><img loading="lazy" src="${pub(k)}">
          ${mp4 ? `<video controls preload="none" src="${pub(mp4)}"></video>` : ''}</div>`;
      }).join('') + `</div>`;
    }
    res.send(pageShell(`${video} preview`, body));
  } catch (error) {
    res.status(500).send(String(error));
  }
});

app.post('/still', async (req, res) => {
  const {
    compositionId = 'Scene1',
    inputProps = {},
    frame = 0,
    outputKey,
  } = req.body || {};

  if (!outputKey) {
    res.status(400).json({error: 'outputKey is required'});
    return;
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-still-'));
  const outputPath = path.join(tmpDir, `${compositionId}-${Date.now()}.png`);

  try {
    const url = await withRenderSlot(async () => {
      await renderStillToFile({compositionId, inputProps, frame, outputPath});
      const body = await fs.readFile(outputPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: minioBucket,
          Key: outputKey,
          Body: body,
          ContentType: 'image/png',
        }),
      );
      return publicUrlFor(outputKey);
    });

    res.json({url});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'still_failed',
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await fs.rm(tmpDir, {recursive: true, force: true});
  }
});

app.post('/render', async (req, res) => {
  const {
    compositionId = 'Scene1',
    inputProps = {},
    outputKey,
    return: returnMode,
  } = req.body || {};

  if (!outputKey && returnMode !== 'bytes') {
    res.status(400).json({error: 'outputKey is required unless return=bytes'});
    return;
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'remotion-render-'));
  const outputPath = path.join(tmpDir, `${compositionId}-${Date.now()}.mp4`);

  try {
    const result = await withRenderSlot(async () => {
      await renderToFile({compositionId, inputProps, outputPath});

      if (returnMode === 'bytes') {
        return {type: 'bytes'};
      }

      const body = await fs.readFile(outputPath);
      await s3.send(
        new PutObjectCommand({
          Bucket: minioBucket,
          Key: outputKey,
          Body: body,
          ContentType: 'video/mp4',
        }),
      );

      return {type: 'url', url: publicUrlFor(outputKey)};
    });

    if (result.type === 'bytes') {
      res.setHeader('content-type', 'video/mp4');
      res.send(await fs.readFile(outputPath));
      return;
    }

    res.json({url: result.url});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'render_failed',
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    await fs.rm(tmpDir, {recursive: true, force: true});
  }
});

await getServeUrl();

app.listen(port, '0.0.0.0', () => {
  console.log(`remotion-render-service listening on ${port}`);
});
