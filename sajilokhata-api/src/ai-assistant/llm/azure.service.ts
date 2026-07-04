// import {
//     Injectable,
//     InternalServerErrorException,
//     Logger,
// } from "@nestjs/common";
// import { ConfigService } from "@nestjs/config";

// @Injectable()
// export class AzureOpenAiService {
//     private readonly logger = new Logger(AzureOpenAiService.name);
//     private readonly endpoint: string;
//     private readonly apiKey: string;
//     private readonly deployment: string;
//     private readonly apiVersion: string;

//     constructor(private config: ConfigService) {
//         this.endpoint = this.config.getOrThrow<string>("AZURE_OPENAI_ENDPOINT");
//         this.apiKey = this.config.getOrThrow<string>("AZURE_OPENAI_API_KEY");
//         this.deployment = this.config.getOrThrow<string>("AZURE_OPENAI_DEPLOYMENT");
//         this.apiVersion = this.config.get<string>("AZURE_OPENAI_API_VERSION") ?? "2024-02-15-preview";
//     }

//     // =====================================
//     // SINGLE CALL — returns full choice object
//     // =====================================
//     async call(messages: any[], tools: any[]): Promise<any> {
//         const url = `${this.endpoint}openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`;

//         const body: any = {
//             messages,
//             max_tokens: 2048,
//             temperature: 0.3,
//         };

//         if (tools.length > 0) {
//             body.tools = tools;
//             body.tool_choice = "auto";
//         }

//         const response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "api-key": this.apiKey,
//             },
//             body: JSON.stringify(body),
//         });

//         if (!response.ok) {
//             const err = await response.text();
//             this.logger.error(`Azure OpenAI error: ${response.status} ${err}`);
//             throw new InternalServerErrorException("AI service unavailable");
//         }

//         const data = await response.json();
//         // returns { finish_reason, message: { role, content, tool_calls? } }
//         return data.choices[0];
//     }
// }



import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AzureOpenAiService {
    private readonly logger = new Logger(AzureOpenAiService.name);
    private readonly apiKey: string;
    private readonly model: string;

    constructor(private config: ConfigService) {
        this.apiKey = this.config.getOrThrow<string>("HF_TOKEN");
        this.model = this.config.get<string>("HF_MODEL") ?? "meta-llama/Llama-3.3-70B-Instruct";
    }

    // =====================================
    // SINGLE CALL — returns full choice object
    // =====================================
    async call(messages: any[], tools: any[]): Promise<any> {
        const url = `https://router.huggingface.co/v1/chat/completions`;

        const body: any = {
            model: this.model,
            messages,
            max_tokens: 2048,
            temperature: 0.3,
        };

        if (tools.length > 0) {
            body.tools = tools;
            body.tool_choice = "auto";
        }

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.text();
            this.logger.error(`HF inference error: ${response.status} ${err}`);
            throw new InternalServerErrorException("AI service unavailable");
        }

        const data = await response.json();
        // returns { finish_reason, message: { role, content, tool_calls? } }
        return data.choices[0];
    }
}