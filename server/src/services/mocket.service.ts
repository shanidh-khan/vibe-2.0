import MocketRepository from "@/repositories/mocket.repository";
import UserService from "./user.service";
import ErrorHandler from "@/utils/error";
import { IMocket } from "@/models/mocket.model";
import mongoose from "mongoose";
import { generateUniqueMocketString } from "@/utils/token";
import Chance from "chance";
import { Methods } from "@/controller/controller";
import { match } from "path-to-regexp";
import { fakerMappings } from "@/utils/mapping";
import { CreateMocketAiDto, CreateMocketDto, MocketDto, ZodMocketSchema } from "@/dtos/mocket.dto";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { Request } from "express";
import { MocketResponse } from "@/models/response.model";
import { OPENAI_API_KEY } from "@/utils/variables";
import CollectionService from "./collection.service";
import { OpenAIService } from "./openai.service";
export default class MocketService {

  /**
   * Generate mocket endpoints from a Swagger (OpenAPI 2.0) config (V2, non-breaking)
   * @param swaggerConfig The parsed Swagger JSON
   * @param collectionId The collection to add endpoints to
   * @param userId The user creating the endpoints
   * @returns Array of results for each endpoint
   */
  // public async generateMocketsFromSwaggerV2(swaggerConfig: any, collectionId: string, userId: string) {
  //   if (!swaggerConfig || !swaggerConfig.paths) {
  //     throw new ErrorHandler(400, "Invalid Swagger config: missing paths");
  //   }
  //   const results: Array<{ path: string, method: string, mocketId?: string, slugName?: string, error?: string }> = [];
  //   for (const [path, methods] of Object.entries(swaggerConfig.paths)) {
  //     for (const [method, operationRaw] of Object.entries(methods as any)) {
  //       const operation = operationRaw as any;
  //       const createMocket: CreateMocketDto = {
  //         name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
  //         description: operation.description || '',
  //         collectionId,
  //         endpoint: path,
  //         method: method.toUpperCase(),
  //         request: JSON.stringify({ parameters: operation.parameters || [] }),
  //         response: JSON.stringify(this.buildSwaggerResponseSchema(operation.responses, swaggerConfig.definitions)),
  //       };
  //       try {
  //         // @ts-ignore: Awaiting the existing createMocket method
  //         const mocket = await this.createMocket(createMocket, userId);
  //         results.push({ path, method: method.toUpperCase(), mocketId: mocket?.mocketId as string, slugName: mocket?.slugName });
  //       } catch (err: any) {
  //         results.push({ path, method: method.toUpperCase(), error: err?.message || String(err) });
  //       }
  //     }
  //   }
  //   return results;
  // }

  /**
   * Build a dynamic response schema for a Swagger operation's responses
   * @param responses Swagger operation.responses
   * @param definitions Swagger definitions
   * @returns { status, headers, body }
   */
  private buildSwaggerResponseSchema(responses: any, definitions: any) {
    // Pick 200, 201, or default response
    const statusKey = Object.keys(responses).find(k => ['200','201','default'].includes(k)) || Object.keys(responses)[0];
    const resp = responses[statusKey] || {};
    let body: any = {};
    if (resp.schema && resp.schema['$ref']) {
      const ref = resp.schema['$ref'];
      const defName = ref.replace('#/definitions/', '');
      if (definitions && definitions[defName]) {
        body = this.buildDynamicSchemaFromDefinition(definitions[defName], definitions);
      }
    } else if (resp.schema && resp.schema.type === 'array' && resp.schema.items && resp.schema.items['$ref']) {
      // Array of objects
      const ref = resp.schema.items['$ref'];
      const defName = ref.replace('#/definitions/', '');
      if (definitions && definitions[defName]) {
        body = [this.buildDynamicSchemaFromDefinition(definitions[defName], definitions)];
      }
    } else if (resp.schema && resp.schema.type) {
      // Primitive type
      body = this.dynamicValueForType(resp.schema.type, '', resp.schema.format);
    } else {
      body = {};
    }
    return {
      status: parseInt(statusKey) || 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }
  }

  /**
   * Recursively build a dynamic object using << >> placeholders for each property
   */
  private buildDynamicSchemaFromDefinition(def: any, definitions: any): any {
    if (def.type === 'object' && def.properties) {
      const obj: any = {};
      for (const [key, prop] of Object.entries(def.properties)) {
        if ((prop as any)['$ref']) {
          // Nested ref
          const ref = (prop as any)['$ref'];
          const defName = ref.replace('#/definitions/', '');
          obj[key] = this.buildDynamicSchemaFromDefinition(definitions[defName], definitions);
        } else if ((prop as any).type === 'array' && (prop as any).items) {
          if ((prop as any).items['$ref']) {
            // Array of objects
            const ref = (prop as any).items['$ref'];
            const defName = ref.replace('#/definitions/', '');
            obj[key] = [this.buildDynamicSchemaFromDefinition(definitions[defName], definitions)];
          } else {
            // Array of primitives
            obj[key] = [this.dynamicValueForType((prop as any).items.type, key, (prop as any).items.format)];
          }
        } else {
          obj[key] = this.dynamicValueForType((prop as any).type, key, (prop as any).format);
        }
      }
      return obj;
    } else if (def.type === 'array' && def.items) {
      if (def.items['$ref']) {
        const defName = def.items['$ref'].replace('#/definitions/', '');
        return [this.buildDynamicSchemaFromDefinition(definitions[defName], definitions)];
      } else {
        return [this.dynamicValueForType(def.items.type, '', def.items.format)];
      }
    } else {
      return this.dynamicValueForType(def.type, '', def.format);
    }
  }

  /**
   * Get << >> placeholder for a property based on key/type/format
   */
  private dynamicValueForType(type: string, key: string, format?: string): string {
    // Key-based mapping
    const keyLower = key.toLowerCase();
    if (["id", "petid", "orderid", "userid"].includes(keyLower)) return "<<number>>";
    if (["email", "mail"].includes(keyLower)) return "<<email>>";
    if (["date", "shipdate"].includes(keyLower)) return "<<date>>";
    if (["status"].includes(keyLower)) return "<<string>>";
    if (["phone", "phonenumber"].includes(keyLower)) return "<<phone>>";
    // Type-based mapping
    if (type === 'integer' || type === 'number') return "<<number>>";
    if (type === 'string') {
      if (format === 'date-time' || format === 'date') return "<<date>>";
      return "<<string>>";
    }
    if (type === 'boolean') return "<<boolean>>";
    // Fallback
    return "<<string>>";
  }

  private openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  /**
   * Generate mocket endpoints from a Swagger (OpenAPI 2.0) config (V2, non-breaking)
   * @param swaggerConfig The parsed Swagger JSON
   * @param collectionId The collection to add endpoints to
   * @param userId The user creating the endpoints
   * @returns Array of results for each endpoint
   */
  public async generateMocketsFromSwaggerV2(swaggerConfig: any, collectionId: string, userId: string) {
    if (!swaggerConfig || !swaggerConfig.paths) {
      throw new ErrorHandler(400, "Invalid Swagger config: missing paths");
    }
    const results: Array<{ path: string, method: string, mocketId?: string, slugName?: string, error?: string }> = [];
    for (const [path, methods] of Object.entries(swaggerConfig.paths)) {
      for (const [method, operationRaw] of Object.entries(methods as any)) {
        const operation = operationRaw as any;
        const createMocket: CreateMocketDto = {
          name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
          description: operation.description || '',
          collectionId,
          endpoint: path,
          method: method.toUpperCase(),
          request: { parameters: operation.parameters || [] },
          response: this.buildSwaggerResponseSchema(operation.responses, swaggerConfig.definitions),
        };
        try {
          // @ts-ignore: Awaiting the existing createMocket method
          const mocket = await this.createMocket(createMocket, userId);
          results.push({ path, method: method.toUpperCase(), mocketId: mocket?.mocketId as string, slugName: mocket?.slugName });
        } catch (err: any) {
          results.push({ path, method: method.toUpperCase(), error: err?.message || String(err) });
        }
      }
    }
    return results;
  }
  private systemPrompt = `You are an API generation assistant. Your task is to create mock API definitions based on user prompts.  

  **Response Format (JSON):**  
  The output should be a JSON object:
  
  Given below is an example of a mock API definition:
  
  {
    "requestType": "GET",
    "endpoint": "/demo",
    "requestHeaders": "{\\n  \\\"Content-Type\\\": \\\"application/json\\\"\\n}",
    "requestBody": "\"{\\n  \\\"name\\\": \\\"John Doe\\\",\\n  \\\"email\\\": \\\"johndoe@example.com\\\",\\n  \\\"age\\\": 30,\\n  \\\"address\\\": {\\n    \\\"street\\\": \\\"123 Main St\\\",\\n    \\\"city\\\": \\\"New York\\\",\\n    \\\"zip\\\": \\\"10001\\\"\\n  },\\n  \\\"hobbies\\\": [\\\"reading\\\", \\\"gaming\\\", \\\"traveling\\\"]\\n}\\n\"",
    "responseBody": "\"{\\n    \\\"status\\\": \\\"success\\\"\\n  }\""
}
  Manage the fields accordingly as per the user prompt.
  Generate the request header , request body and response body in a single line string without any + symbol only contain "\n" for new line.
  If the intend is to returna list of items, please return an array of objects with lenth 2.
  Construct under 300 tokens.

`;
  constructor(
    private mocketRepo: MocketRepository,
    private userService: UserService,
    private collectionService: CollectionService,
    private openaiService: OpenAIService
  ) {}

  public async getMocket(id: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket?.collectionId) {
      throw new ErrorHandler(404, "Collection ID not found");
    }

    const project = await this.collectionService.getCollection(mocket.collectionId.toString());
    return {
      ...mocket.toJSON(),
      subDomain: project?.subDomain,
    };
  }

  public async getMockets({ userId, collectionId }: { userId: string, collectionId?: string }) {
    // Optionally filter by collectionId
    const filter: any = { createdBy: userId };
    if (collectionId) {
      filter.collectionId = collectionId;
    }
    return this.mocketRepo.findBy(filter);
  }

  public async createMocket(createMocket: CreateMocketDto, userId: string) {
    let user = await this.userService.getUserById(userId);
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }

    const collection = await this.collectionService.getCollection(createMocket.collectionId);
  

    let mocket;
    try {
      mocket = await this.mocketRepo.create({
        name: createMocket.name,
        description: createMocket.description,
        collectionId: collection?._id,
        endpoint: createMocket.endpoint,
        method: createMocket.method,
        // requestHeaders: (typeof createMocket.requestHeaders === "string" && createMocket.requestHeaders !== "undefined"
        //   ? (() => { try { return JSON.parse(createMocket.requestHeaders as string); } catch { return {}; } })()
        //   : {}),
        request: createMocket.request,
        response: createMocket.response,
        createdBy: user._id,
        slugName: generateUniqueMocketString(),
      } as IMocket);
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        throw new ErrorHandler(400, err.message);
      }
      throw err;
    }

    return {
      mocketId: mocket._id,
      requestType: mocket.method,
      slugName: mocket.slugName,
      // subDomain: project.subDomain,
    };
  }

  public async deleteMocket(id: string, userId: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) return false;
    if (mocket.createdBy.toString() !== userId) {
      throw new ErrorHandler(403, "Unauthorized");
    }
    await this.mocketRepo.delete(id);
    return true;
  }

  public async updateMocket(id: string, userId: string, dto: MocketDto) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }

    if (mocket.createdBy.toString() !== userId) {
      throw new ErrorHandler(403, "Unauthorized");
    }

    const updatedDto = {
      method: dto.method,
      endpoint: dto.endpoint,
      // requestHeaders: JSON.parse(dto.requestHeaders as string),
      request: dto.request,
      response: dto.response,
    } as IMocket;
    await this.mocketRepo.update(id, updatedDto);
    return updatedDto;
  }


  /**
   * Generate API endpoints using OpenAI service
   */
  public async createMocketWithAi(dto: CreateMocketAiDto, userId: string) {
    try {
      // Generate endpoints using OpenAI service
      const aiResponse = await this.openaiService.generateApiEndpoints(dto.description);
      
      // Save each generated endpoint to the database
      const savedEndpoints = [];
      for (const endpoint of aiResponse.endpoints) {
        const mocketData = {
          name: endpoint.name,
          description: endpoint.description,
          collectionId: dto.collectionId,
          endpoint: endpoint.endpoint,
          method: endpoint.method,
          requestHeaders: endpoint.requestHeaders,
          request: endpoint.request || {},
          response: endpoint.response,
        };
        
        const savedMocket = await this.createMocket(mocketData, userId);
        savedEndpoints.push(savedMocket);
      }
      
      return {
        success: true,
        data: {
          endpoints: aiResponse.endpoints,
          collectionName: aiResponse.collectionName,
          description: aiResponse.description,
          savedEndpoints: savedEndpoints
        }
      };
      
    } catch (error) {
      console.error("Error generating API endpoints:", error);
      throw new Error(`Failed to generate API endpoints: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractFromRequest(req: Request) {
    const method = req.method as Methods;
    const endpoint = req.params[0];
    const projectId = req.params.projectId;
    const requestBody = req.body;
    const query = req.query;
    return { method, endpoint, projectId, requestBody, query };
  }

  public async trigger(req: Request): Promise<MocketResponse> {
    let { method, endpoint, projectId, requestBody, query } = this.extractFromRequest(req);

    const collection = await this.collectionService.getCollectionBySubDomain(projectId);
    if (!collection) {
      throw new ErrorHandler(404, "Collection not found");
    }

    if (!endpoint.startsWith("/")) {
      endpoint = `/${endpoint}`;
    }

    // with slug filter
    // const matchedMocket = await this.mocketRepo.findOneBy({
    //   projectId: new mongoose.Types.ObjectId(project._id as string),
    //   slugName: slug,
    //   endpoint,
    //   requestType: method,
    // });
    // if (!matchedMocket) {
    //   throw new ErrorHandler(404, "Mocket not found");
    // }

    let matchedMocket: IMocket | null = null;
    let params: Record<string, string> = {};

    // check if there is a mock exact endpoint
    const exactMatchedMocket = await this.mocketRepo.findOneBy({
      collectionId: new mongoose.Types.ObjectId(collection._id as string),
      endpoint,
      method: method,
    });

    if (exactMatchedMocket) {
      matchedMocket = exactMatchedMocket;
    } else {
      const mocketStream = this.mocketRepo.findByCursor({
        collectionId: new mongoose.Types.ObjectId(collection._id as string),
        requestType: method,
      });

      for await (const mocket of mocketStream) {
        const { match, extractedParams } = this.matchEndpoint(endpoint, mocket.endpoint);
        if (match) {
          matchedMocket = mocket;
          params = extractedParams;
          break;
        }
      }
      await mocketStream.close();
    }

    if (!matchedMocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }

    if (matchedMocket.method == Methods.POST || matchedMocket.method == Methods.PUT) {
      this.validateRequest(requestBody, JSON.parse(matchedMocket.request.body as string));
    }

    const responseBody = JSON.parse(matchedMocket.response.body as string);

    const response: MocketResponse = {
      status: matchedMocket.response.status as number,
      headers: matchedMocket.response.headers as Record<string, any>,
      body: this.generateMockResponse(responseBody)
    }
    return response
  }

  private validateRequest(requestBody: any, schema: any, path: string = "") {
    console.log(requestBody, schema);
    
    if (requestBody === null || (requestBody === undefined && schema !== null)) {
      throw new ErrorHandler(400, `Missing key at ${path}`);
    }
    if (Array.isArray(schema)) {
      if (!Array.isArray(requestBody)) {
        throw new ErrorHandler(400, `Invalid type at ${path}: expected an array.`);
      }
      requestBody.forEach((item, index) =>
        this.validateRequest(item, schema[0], `${path}[${index}]`)
      );
    } else if (typeof schema === "object" && schema !== null) {
      if (typeof requestBody !== "object" || requestBody === null) {
        throw new ErrorHandler(400, `Invalid type at ${path}: expected an object.`);
      }
      for (const key in schema) {
        if (!(key in requestBody)) {
          throw new ErrorHandler(400, `Missing key at ${path ? `${path}.` : ""}${key}`);
        }
        this.validateRequest(requestBody[key], schema[key], path ? `${path}.${key}` : key);
      }
    } else if (typeof schema === "string" && schema.startsWith("<<") && schema.endsWith(">>")) {
      const expectedType = schema.slice(2, -2).toLowerCase();
      const actualType = Array.isArray(requestBody) ? "array" : typeof requestBody;
      if (expectedType !== actualType) {
        throw new ErrorHandler(
          400,
          `Invalid type for key ${path}: expected ${expectedType}, got ${actualType}.`
        );
      }
    } else {
      if (requestBody !== schema) {
        throw new ErrorHandler(400, `Invalid value at ${path}: expected ${schema}.`);
      }
    }
  }

  private generateMockResponse(schema: Object | any): any {

    if (Array.isArray(schema)) {
      // const listLength = this.chance.integer({ min: 3, max: 10 });
      // console.log("listLength", listLength, schema[0]);
      const listLength = schema.length;
      return Array.from({ length: listLength }, (_, i: number) =>
        this.generateMockResponse(schema[i])
      );
    }

    const response: any = schema;

    if (typeof response == "object") {
      
      for (const key in schema) {
        const value = schema[key];
        
        if (typeof value === "string" && value.startsWith("<<") && value.endsWith(">>")) {
          const type = value.slice(2, -2).trim().toLowerCase();

          for (const mapperKey in fakerMappings) {
            if (mapperKey === type) {
              response[key] = fakerMappings[type]();
            }
          }
        } else if (typeof value === "object" && value !== null) {
          response[key] = this.generateMockResponse(value);
        } else {
          response[key] = value;
        }
      }
    } else if (typeof response == "string") {
      if (response.startsWith("<<") && response.endsWith(">>")) {
        const type = response.slice(2, -2).trim().toLowerCase();

        for (const mapperKey in fakerMappings) {
          if (mapperKey === type) {
            return fakerMappings[type]();
          }
        }
      }
    }
    return response;
  }

  private extractParamValueFromEndpoint(endpoint: string, param: string): string | null {
    const paramPattern = new RegExp(`/${param.replace(":", "")}/([^/]+)`);
    const match = endpoint.match(paramPattern);
    return match ? match[1] : null;
  }

  private matchEndpoint(endpoint: string, storedEndpoint: string) {
    if (!storedEndpoint) return { match: false, extractedParams: {} };

    const matcher = match(storedEndpoint);
    const paramRes = matcher(endpoint);

    const extractedParams: Record<string, string> = {};

    if (paramRes) {
      for (const key in paramRes.params) {
        extractedParams[key] = Array.isArray(paramRes.params[key])
          ? paramRes.params[key][0]
          : paramRes.params[key] || "";
      }
    } else {
      return { match: false, extractedParams: {} };
    }

    return { match: true, extractedParams };
  }

  public async generateDescriptionWithAI(id: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }
    const description = await this.openaiService.generateDescription(mocket);
    await this.mocketRepo.update(id, { description: description.description });
    return {
      success: true,
      updatedDescription: description.description
    };
  }

  public async generateRequestHeadersWithAI(id: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }
    const headers = await this.openaiService.generateRequestHeaders(mocket);
    await this.mocketRepo.update(id, { 
      request: {
        ...mocket.request,
        headers: headers.headers
      }
    });
    return {
      success: true,
      updatedHeaders: headers.headers
    };
  }

  public async generateRequestBodyWithAI(id: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }
    const body = await this.openaiService.generateRequestBody(mocket);
    await this.mocketRepo.update(id, { 
      request: {
        ...mocket.request,
        body: JSON.stringify(body.body, null, 2)
      }
    });
    return {
      success: true,
      updatedBody: JSON.stringify(body.body, null, 2)
    };
  }

  public async generateResponseBodyWithAI(id: string) {
    const mocket = await this.mocketRepo.findOneById(id);
    if (!mocket) {
      throw new ErrorHandler(404, "Mocket not found");
    }
    const body = await this.openaiService.generateResponseBody(mocket);
    await this.mocketRepo.update(id, { 
      response: {
        ...mocket.response,
        body: JSON.stringify(body.body, null, 2)
      }
    });
    return {
      success: true,
      updatedBody: JSON.stringify(body.body, null, 2)
    };
  }
}
