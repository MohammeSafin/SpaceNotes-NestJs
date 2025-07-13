"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const config_1 = require("@nestjs/config");
let AiService = class AiService {
    configService;
    apiKey;
    apiUrl;
    constructor(configService) {
        this.configService = configService;
        this.apiKey = this.configService.get('AI_API_KEY');
        this.configService.get('AI_API_URL');
    }
    async generateQuizQuestions(content) {
        try {
            const prompt = `
        Create a quiz based on the following lecture summary. 
        Generate 8 multiple-choice questions with 4 options each, where only one is correct.
        
        Summary: ${content}
        
        Provide the response as a JSON object with the following structure:
        {
          "questions": [
            {
              "title": "Question text here",
              "correctAnswer": "The correct answer index (0-4)",
              "choices": ["Option 1", "Option 2", "Option 3", "Option 4"]
            }
          ]
        }
        
      `;
            const response = await axios_1.default.post(this.apiUrl, {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            const responseContent = response.data.choices[0].message.content;
            const jsonResponse = JSON.parse(responseContent);
            return jsonResponse;
        }
        catch (error) {
            console.error('Error calling AI service:', error);
            throw new Error(`Failed to generate quiz questions: ${error.message}`);
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map