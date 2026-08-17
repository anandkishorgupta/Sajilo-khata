import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

@Injectable()
export class AiSdkService {
  private readonly logger = new Logger(AiSdkService.name);
  private readonly model: ReturnType<
    ReturnType<typeof createOpenAICompatible>['chatModel']
  >;

  constructor(private config: ConfigService) {
    const apiKey = this.config.getOrThrow<string>('HF_TOKEN');
    const modelId =
      this.config.get<string>('HF_MODEL') ??
      'meta-llama/Llama-3.3-70B-Instruct';

    const provider = createOpenAICompatible({
      name: 'hf',
      baseURL: 'https://router.huggingface.co/v1',
      apiKey,
    });

    this.model = provider.chatModel(modelId);
    this.logger.log(`AI SDK provider ready (model: ${modelId})`);
  }

  getModel() {
    return this.model;
  }
}
