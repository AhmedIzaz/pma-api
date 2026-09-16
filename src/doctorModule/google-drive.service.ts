import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
    private readonly drive;
    private readonly logger = new Logger(GoogleDriveService.name);

    constructor() {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
                    private_key: process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(
                        /\\n/g,
                        '\n',
                    ),
                },
                scopes: ['https://www.googleapis.com/auth/drive'],
            });

            this.drive = google.drive({ version: 'v3', auth });
        } catch (error) {
            this.logger.error(
                'Failed to initialize Google Drive service',
                error,
            );
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            throw new Error('Google Drive Folder ID is not configured');
        }

        const fileMetadata = {
            name: file.originalname,
            parents: [folderId],
        };

        const media = {
            mimeType: file.mimetype,
            body: Readable.from(file.buffer),
        };

        try {
            const res = await this.drive.files.create({
                supportsAllDrives: true, // Required for Shared Drives
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            });

            const fileId = res.data.id;
            if (!fileId) throw new Error('Drive API did not return a file ID');

            try {
                // Try to grant public read access so the link works for everyone
                await this.drive.permissions.create({
                    fileId: fileId,
                    requestBody: { role: 'reader', type: 'anyone' },
                    supportsAllDrives: true,
                });
            } catch (permErr) {
                this.logger.warn(
                    `Could not set public permissions for file ${fileId}`,
                    permErr,
                );
            }

            if (file.mimetype.startsWith('image/')) {
                return `https://lh3.googleusercontent.com/d/${fileId}`;
            }

            // if (file.mimetype.startsWith('image/')) {
            //   return `https://drive.google.com/uc?export=view&id=${fileId}`;
            // }

            return res.data.webViewLink || fileId;
        } catch (error) {
            this.logger.error('Error uploading file to Google Drive:', error);
            throw new Error('Failed to upload file to Google Drive');
        }
    }
}
