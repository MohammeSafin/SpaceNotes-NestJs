import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private apiKey;
  private apiUrl;
  private readonly logger = new Logger(AiService.name);
  private readonly maxRetries = 5;
  private readonly maxTokensPerChunk = 6000;
  private readonly avgTokensPerWord = 1.3;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('AI_API_KEY');
    this.apiUrl = this.configService.get<string>('AI_API_URL');
  }

  private splitIntoChunks(text: string): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    const wordsPerChunk = Math.floor(this.maxTokensPerChunk / this.avgTokensPerWord);

    for (let i = 0; i < words.length; i += wordsPerChunk) {
      chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
    }

    return chunks;
  }

  async summarizeLecture(lecture: string): Promise<any> {
    try {
      const chunks = this.splitIntoChunks(lecture);
      this.logger.log(`Lecture split into ${chunks.length} chunks for processing`);

      if (chunks.length === 1) {
        return await this.processSingleChunk(chunks[0]);
      } else {
        const chunkSummaries = await Promise.all(
          chunks.map((chunk, index) => this.processSingleChunk(chunk, index + 1, chunks.length))
        );

        if (chunkSummaries.length > 1) {
          return await this.combineChunkSummaries(chunkSummaries);
        } else {
          return chunkSummaries[0];
        }
      }
    } catch (error) {
      this.logger.error(`Failed to summarize lecture: ${error.message}`);
      throw error;
    }
  }

  private async processSingleChunk(chunk: string, chunkNum?: number, totalChunks?: number): Promise<any> {
    let retries = 0;
  
    while (retries <= this.maxRetries) {
      try {
        const chunkLabel = chunkNum ? `chunk ${chunkNum}/${totalChunks}` : 'content';
        const prompt = `
        Summarize the following lecture ${chunkLabel}:
        
        ${chunk}
        
        Provide your response as a valid JSON object with this exact structure:
        {
          "title": "${chunkNum ? `Part ${chunkNum}/${totalChunks} -` : ''} A brief, relevant title",
          "content": "A clear and concise summary formatted in Markdown for a Flutter app using flutter_markdown package. Follow these formatting guidelines:
      
          # Main headings use a single hash with space
          
          ## Subheadings use double hash with space
          
          ### Third level headings
          
          Paragraphs should have blank lines between them.
          
          **Bold text** should use double asterisks.
          
          *Italic text* should use single asterisks.
          
          - List items start with dash and space
          - Make sure there's proper spacing
            - Nested items have 2-space indentation
          
          > Blockquotes start with greater-than sign and space
          
          For code blocks, use:
          \`\`\`
          code goes here
          \`\`\`
          
          Create a well-structured summary with clear headings and concise points."
        }
        
        IMPORTANT: The content field must be properly escaped as a JSON string but contain valid Markdown syntax. Do not include the surrounding quotes in the actual content.
      `;
  
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
          this.logger.error('Invalid response format from API:', response.data);
          throw new Error('Invalid response format from API');
        }
  
        const responseContent = response.data.choices[0].message.content;
        this.logger.log("Response from summarizer: ");
        this.logger.log(responseContent);
  
        try {
          const parsedResponse = JSON.parse(responseContent);
          if (parsedResponse.content) {
            parsedResponse.content = this.ensureFlutterMarkdownCompatibility(parsedResponse.content);
          }
          return parsedResponse;
        } catch (e) {
          this.logger.warn('Failed to parse JSON response, returning raw content');
          return { 
            title: chunkNum ? `Part ${chunkNum}/${totalChunks}` : 'Summary', 
            content: this.ensureFlutterMarkdownCompatibility(responseContent) 
          };
        }
      } catch (error) {
        this.logger.error(`API request error: ${error.message}`);
        
        if (error.response && error.response.status === 429) {
          retries++;
          const retryAfter = error.response.headers['retry-after']
            ? parseInt(error.response.headers['retry-after']) * 1000
            : Math.pow(2, retries) * 1000;
  
          this.logger.warn(`Rate limited. Retrying in ${retryAfter / 1000} seconds... (Attempt ${retries}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else {
          throw error;
        }
      }
    }
  
    throw new Error('Maximum retries exceeded for OpenAI API request');
  }
  
  private async combineChunkSummaries(summaries: any[]): Promise<any> {
    let retries = 0;
  
    while (retries <= this.maxRetries) {
      try {
        const summariesContent = summaries.map(summary => {
          if (typeof summary === 'string') {
            return summary;
          } else {
            return `${summary.title}\n\n${summary.content}`;
          }
        });
  
        const prompt = `
          Below are summaries of different parts of a longer lecture. 
          Combine them into a single coherent summary:
          
          ${summariesContent.join('\n\n---\n\n')}
          
          Format your response as a JSON object with the following structure:
          {
            "title": "A brief, relevant title for the complete lecture",
            "content": "A comprehensive and well-structured summary of the entire lecture formatted specifically for a Flutter app using the flutter_markdown package. Follow these formatting guidelines carefully:
            
            # Main heading (use single hash with space)
            
            Start with a brief introduction paragraph.
            
            ## Section headings (use double hash with space)
            
            Paragraphs should have blank lines between them to render properly.
            
            ### Subsection headings (triple hash with space)
            
            - List items start with dash and space
            - Each item on its own line
              - Nested items indented with 2 spaces
            
            > Important quotes or takeaways should use blockquote format
            
            **Bold text** for emphasis on important concepts.
            
            *Italic text* for definitions or specialized terms.
            
            Use proper headings to organize content hierarchically.
            
            Create a comprehensive summary that flows well and is easy to read in the Flutter app."
          }
        `;
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          },
          {
            headers: {
              'Authorization': `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
  
        // Added error checking for response format
        if (!response.data || !response.data.choices || !response.data.choices[0]) {
          this.logger.error('Invalid response format from API:', response.data);
          throw new Error('Invalid response format from API');
        }
  
        const responseContent = response.data.choices[0].message.content;
        try {
          const parsedResponse = JSON.parse(responseContent);
          // Post-process markdown to ensure compatibility
          if (parsedResponse.content) {
            parsedResponse.content = this.ensureFlutterMarkdownCompatibility(parsedResponse.content);
          }
          return parsedResponse;
        } catch (e) {
          this.logger.warn('Failed to parse JSON response, returning raw content');
          return { 
            title: 'Complete Summary', 
            content: this.ensureFlutterMarkdownCompatibility(responseContent) 
          };
        }
      } catch (error) {
        this.logger.error(`API request error: ${error.message}`);
        
        if (error.response && error.response.status === 429) {
          retries++;
          const retryAfter = error.response.headers['retry-after']
            ? parseInt(error.response.headers['retry-after']) * 1000
            : Math.pow(2, retries) * 1000;
  
          this.logger.warn(`Rate limited. Retrying in ${retryAfter / 1000} seconds... (Attempt ${retries}/${this.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryAfter));
        } else {
          throw error;
        }
      }
    }
  
    throw new Error('Maximum retries exceeded for OpenAI API request');
  }
  
  // Add this helper method to ensure markdown is compatible with Flutter's renderer
  private ensureFlutterMarkdownCompatibility(content: string): string {
    // Make sure headers have space after #
    content = content.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');
    
    // Ensure list items have proper spacing
    content = content.replace(/^-([^\s])/gm, '- $1');
    
    // Ensure paragraphs are separated by blank lines
    content = content.replace(/([^\n])\n([^#\n\-\>])/g, '$1\n\n$2');
    
    // Ensure blockquotes have space after >
    content = content.replace(/^>([^\s])/gm, '> $1');
    
    // Fix nested list indentation (should be 2 spaces)
    content = content.replace(/^( +)-([^\s])/gm, function(match, indent, rest) {
      // Make sure indent is an even number of spaces (preferably 2, 4, etc.)
      const spaces = indent.length % 2 === 0 ? indent : indent + ' ';
      return `${spaces}- ${rest}`;
    });
    
    // Fix code blocks to ensure they have proper spacing
    content = content.replace(/```([^\n]*)\n/g, '```$1\n');
    content = content.replace(/\n```/g, '\n\n```');
    
    // Remove excessive blank lines (more than 2 consecutive)
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content;
  }
}