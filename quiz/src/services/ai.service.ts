import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface QuizQuestionChoice {
  title: string;
  correctAnswer: string;
  choices: string[];
}

interface GeneratedQuiz {
  questions: QuizQuestionChoice[];
}

@Injectable()
export class AiService {
  private apiKey: any;
  private apiUrl: any;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY');
    this.apiUrl = this.configService.get<string>('AI_API_URL');
  }


  async generateQuizQuestions(content: any): Promise<GeneratedQuiz> {
    try {
      console.log("The content passed to the AI" + content);
        const prompt = `
          You are an educational quiz generator.
          
          Create a quiz based on the following lecture summary. 
          Generate exactly 8 multiple-choice questions. Each question should have:
          - A "title" field (string): the question text.
          - A "correctAnswer" field (string): the correct choice from the options.
          - A "choices" field (array of 4 strings): the answer options.
          
          Only one correct answer is allowed per question.
          
          Summary: ${content}
          
          Return ONLY a JSON object in this format:
          {
            "questions": [
              {
                "title": "Question text here",
                "correctAnswer": "Option 3",
                "choices": ["Option 1", "Option 2", "Option 3", "Option 4"]
              },
              ...
            ]
          }
          Do NOT include any explanation or text outside the JSON.
        `;



      const response = await axios.post(
        this.apiUrl,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const responseContent = response.data.choices[0].message.content;
      const jsonResponse = JSON.parse(responseContent);
      console.log("AI response:", JSON.stringify(jsonResponse, null, 2));
      return jsonResponse;

    } catch (error) {
      console.error('Error calling AI service:', error);
      throw new Error(`Failed to generate quiz questions: ${error.message}`);
    }
  }
}
