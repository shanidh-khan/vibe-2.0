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
import { OPENAI_API_KEY } from "@/utils/variables";
import CollectionService from "./collection.service";
export default class MocketService {
  private openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

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
    private collectionService: CollectionService
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

  public async createMocketWithAi(dto: CreateMocketAiDto, userId: string) {
    // const project = await this.projectService.getProject(dto.projectId);

    const response = await this.openai.beta.chat.completions.parse({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo"
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: dto.prompt },
      ],
      response_format: zodResponseFormat(ZodMocketSchema, "mocket"),
    });

    const aiMocket = response.choices[0].message.parsed;
    console.log("AI Response", aiMocket);
    if (!aiMocket) {
      throw new ErrorHandler(500, "AI response content is null");
    }

    const mocket = await this.mocketRepo.create({
      projectId: new mongoose.Types.ObjectId("6788c32cb027d8ab099734fc"),
      endpoint: aiMocket.endpoint,
      method: aiMocket.requestType,
      request: JSON.stringify(aiMocket.requestBody),
      response: JSON.stringify(aiMocket.responseBody),
      createdBy: userId,
      slugName: generateUniqueMocketString(),
    } as unknown as IMocket);

    return {
      mocketId: mocket._id,
      requestType: mocket.method,
      slugName: mocket.slugName,
      // subDomain: project.subDomain,
    };
  }

  private extractFromRequest(req: Request) {
    const method = req.method as Methods;
    const endpoint = req.params[0];
    const projectId = req.params.projectId;
    const requestBody = req.body;
    const query = req.query;
    return { method, endpoint, projectId, requestBody, query };
  }

  public async trigger(req: Request) {
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
      this.validateRequest(requestBody, matchedMocket.request.body);
    }

    const responseBody = JSON.parse(matchedMocket.response.body as string);

    return this.generateMockResponse(responseBody);
  }

  private validateRequest(requestBody: any, schema: any, path: string = "") {
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
}
