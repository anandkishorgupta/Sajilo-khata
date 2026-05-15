import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit from 'imagekit';

@Injectable()
export class ImageKitService {
  private imagekit: ImageKit;

  constructor(private config: ConfigService) {
    this.imagekit = new ImageKit({
      publicKey: config.getOrThrow('IMAGEKIT_PUBLIC_KEY'),
      privateKey: config.getOrThrow('IMAGEKIT_PRIVATE_KEY'),
      urlEndpoint: config.getOrThrow('IMAGEKIT_URL_ENDPOINT'),
    });
  }

  async upload(file: Express.Multer.File) {
    const result = await this.imagekit.upload({
      file: file.buffer.toString('base64'),
      fileName: `${Date.now()}-${file.originalname}`,
      folder: '/sajilokhata/products',
    });

    return {
      url: result.url,
      fileId: result.fileId,
    };
  }

  async delete(fileId: string) {
    await this.imagekit.deleteFile(fileId);
  }
}