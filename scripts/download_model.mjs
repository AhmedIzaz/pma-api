/**
 * Pre-downloads the Xenova/whisper-tiny model from HuggingFace at Docker build time.
 * This avoids any network calls at container runtime.
 * Run via: node scripts/download_model.mjs
 */

import { pipeline, env } from '@huggingface/transformers';

// Cache model files inside /app/.cache so the production image carries them
env.cacheDir = '/app/.cache';

console.log('[ModelDownload] Downloading Xenova/whisper-tiny into cache...');

await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');

console.log('[ModelDownload] Model downloaded successfully.');
