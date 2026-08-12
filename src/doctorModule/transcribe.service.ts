import { Injectable, Logger } from '@nestjs/common';
import { pipeline } from '@huggingface/transformers';
import * as wavefile from 'wavefile';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);
  private transcriber: any;

  async onModuleInit() {
    // Lazy load the Whisper pipeline (e.g., Xenova/whisper-small or whisper-base)
    this.logger.log('Loading Whisper Speech Recognition model...');
    this.transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small');
    this.logger.log('Whisper model loaded.');
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    try {
      // Convert Buffer to Float32Array (16kHz audio required by Whisper)
      const wav = new wavefile.WaveFile(audioBuffer);
      wav.toBitDepth('32f');
      wav.toSampleRate(16000);
      let audioData = wav.getSamples();
      if (Array.isArray(audioData)) {
        audioData = audioData[0]; // Take mono channel
      }

      const output = await this.transcriber(audioData, {
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