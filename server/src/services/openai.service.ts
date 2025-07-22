import OpenAI from "openai";
import { z } from "zod";

// Types for the API endpoint generation
export interface MocketEndpoint {
  name: string;
  method: string;
  endpoint: string;
  requestHeaders: Record<string, unknown>;
  response: {
    status: number
    headers: Record<string, string>
    body: string
  }
  request?: {
    headers?: Record<string, string>
    body?: string
  }
  slugName: string;
  description: string;
}

export interface ApiGenerationRequest {
  collectionId: string;
  prompt: string;
}

export interface ApiGenerationResponse {
  endpoints: MocketEndpoint[];
  collectionName: string;
  description: string;
}

// Schema for structured output
const EndpointSchema = z.object({
  name: z.string(),
  method: z.string(),
  endpoint: z.string(),
  requestHeaders: z.record(z.unknown()),
  request: z.object({
    headers: z.record(z.string()).optional(),
    body: z.string().optional(),
  }).optional(),
  response: z.object({
    status: z.number(),
    headers: z.record(z.string()),
    body: z.string(),
  }),
  slugName: z.string(),
  description: z.string(),
});

const ApiGenerationSchema = z.object({
  collectionName: z.string(),
  description: z.string(),
  endpoints: z.array(EndpointSchema),
});

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate API endpoints using OpenAI
   */
  async generateApiEndpoints(description: string): Promise<ApiGenerationResponse> {
    try {
      const prompt = `
You are an expert API designer. Generate REST API endpoints based on the following requirements:

API DESCRIPTION: ${description}

Generate a JSON response with the following structure:
{
  "collectionName": "string",
  "description": "string",
  "endpoints": [
    {
      "name": "string",
      "method": "GET|POST|PUT|DELETE|PATCH",
      "endpoint": "string (URL path)",
      "requestHeaders": {"Content-Type": "application/json"},
      "response": {
        "status": 200,
        "headers": {"Content-Type": "application/json"},
        "body": "string (JSON response body)"
      },
      "request": {
        "headers": {"Content-Type": "application/json"},
        "body": "string (JSON request body)"
      },
      "slugName": "string (URL-friendly name)",
      "description": "string"
    }
  ]
}

Make sure to:
1. Use realistic sample data
2. Follow RESTful principles for REST APIs
3. Include appropriate HTTP status codes in response (200, 201, 400, 404, 500, etc.)
4. Generate meaningful endpoint names and descriptions
5. Provide realistic request/response examples with proper JSON structure
6. Create slugName as URL-friendly versions of the name (lowercase, hyphens instead of spaces)
7. For response.body and request.body, provide valid JSON strings (not objects)
8. Include proper Content-Type headers in both request and response
9. Do not wrap responses in markdown code blocks (\`\`\`json). Return only the raw JSON object.
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert API designer. Always respond with valid JSON. Do not wrap responses in markdown code blocks (```json). Return only the raw JSON object.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      let sanitizedResponse = response;
      if (response.startsWith("```json")) {
        sanitizedResponse = sanitizedResponse.replace("```json", "").replace("```", "");
      }
      const parsedResponse = JSON.parse(sanitizedResponse);

      return {
        endpoints: parsedResponse.endpoints,
        collectionName: parsedResponse.collectionName,
        description: parsedResponse.description,
      };
    } catch (error) {
      console.error("Error generating API endpoints:", error);
      throw new Error(`Failed to generate API endpoints: ${(error as Error).message}`);
    }
  }

  /**
   * Generate a single endpoint with more control
   */
  async generateSingleEndpoint(
    method: string,
    path: string,
    description: string
  ): Promise<MocketEndpoint> {
    try {
      const prompt = `
Generate a single API endpoint with the following specifications:

Method: ${method}
Path: ${path}
Description: ${description}

Generate a JSON response with this structure:
{
  "name": "descriptive name",
  "method": "${method}",
  "endpoint": "${path}",
  "requestHeaders": {"Content-Type": "application/json"},
  "request": {"key": "value"},
  "response": {"status": 200, "data": "sample response"},
  "slugName": "url-friendly-name",
  "description": "${description}"
}
`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert API designer. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      let sanitizedResponse = response;
      if (response.startsWith("```json")) {
        sanitizedResponse = sanitizedResponse.replace("```json", "").replace("```", "");
      }
      return JSON.parse(sanitizedResponse);
    } catch (error) {
      console.error("Error generating single endpoint:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate endpoint: ${error.message}`);
      } else {
        throw new Error("Failed to generate endpoint: Unknown error");
      }
    }
  }
}
