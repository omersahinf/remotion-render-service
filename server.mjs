import express from 'express';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {S3Client, PutObjectCommand} from '@aws-sdk/client-s3';
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
app.get('/catalog', async (_req, res) => {
  try {
    const files = await fs.readdir(catalogDir);
    const recipes = [];
    for (const f of files.sort()) {
      if (!f.endsWith('.json')) continue;
      recipes.push(JSON.parse(await fs.readFile(path.join(catalogDir, f), 'utf8')));
    }
    res.json({count: recipes.length, recipes});
  } catch (error) {
    res.status(500).json({
      error: 'catalog_failed',
      message: error instanceof Error ? error.message : String(error),
    });
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
