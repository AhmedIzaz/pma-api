import { Injectable, Logger } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';
import * as wavefile from 'wavefile';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegStatic from 'ffmpeg-static';
import { Readable, PassThrough } from 'stream';

@Injectable()
export class TranscriptionService {
    private readonly logger = new Logger(TranscriptionService.name);
    private transcriber: any;

    onModuleInit() {
        // Fire and forget so NestJS finishes booting without waiting for model download
        this.loadModel().catch((err) => {
            this.logger.error('Failed to load Whisper model', err);
        });
    }

    private async loadModel() {
        try {
            this.logger.log('Loading Whisper Speech Recognition model...');
            this.transcriber = await pipeline(
                'automatic-speech-recognition',
                'Xenova/whisper-tiny',
            );

            this.logger.log('Whisper model loaded successfully.');
        } catch (error) {
            this.logger.error('Error during model load:', error);
        }
    }
    /**
     * Converts any incoming audio Buffer (WebM, OGG, MP3, etc.) to 16kHz Mono WAV
     */
    private async convertToWav(inputBuffer: Buffer): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const inputStream = Readable.from(inputBuffer);
            const outputStream = new PassThrough();
            const chunks: Buffer[] = [];

            outputStream.on('data', (chunk) => chunks.push(chunk));
            outputStream.on('end', () => resolve(Buffer.concat(chunks)));
            outputStream.on('error', (err) => reject(err));

            ffmpeg(inputStream)
                .toFormat('wav')
                .audioFrequency(16000)
                .audioChannels(1)
                .audioCodec('pcm_s16le')
                .on('error', (err) => reject(err))
                .pipe(outputStream);
        });
    }

    async transcribe(audioBuffer: Buffer): Promise<string> {
        try {
            if (!this.transcriber) {
                throw new Error(
                    'Whisper model is still initializing. Please try again in a few seconds.',
                );
            }

            // 1. Convert WebM / OGG / MP3 buffer to 16kHz Mono WAV buffer
            const wavBuffer = await this.convertToWav(audioBuffer);

            // 2. Parse 16kHz WAV buffer with wavefile
            const wav = new wavefile.WaveFile(wavBuffer);
            wav.toBitDepth('32f'); // Convert to Float32 sample representation required by Whisper

            let audioData = wav.getSamples();
            if (Array.isArray(audioData)) {
                audioData = audioData[0]; // Take mono channel array
            }

            // Convert to Float32Array and normalize samples to range [-1.0, 1.0]
            let float32Samples = new Float32Array(audioData as any);

            // Find peak amplitude for normalization
            let maxAmp = 0;
            for (let i = 0; i < float32Samples.length; i++) {
                const abs = Math.abs(float32Samples[i]);
                if (abs > maxAmp) maxAmp = abs;
            }

            // If samples are in integer range (e.g. > 1.0), scale down to [-1.0, 1.0]
            if (maxAmp > 1.0) {
                for (let i = 0; i < float32Samples.length; i++) {
                    float32Samples[i] /= maxAmp;
                }
            }
            // 3. Perform transcription
            const output = await this.transcriber(float32Samples, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: false,
            });

            return output.text;
        } catch (error) {
            this.logger.error('Transcription failed:', error);
            throw error;
        }
    }
}
