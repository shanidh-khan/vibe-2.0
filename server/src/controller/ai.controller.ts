import { Request, Response } from "express";
import { OpenAIService, ApiGenerationRequest, MocketEndpoint } from "../services/openai.service";
import { logger } from "../utils/logger";
import Controller, { Methods, IRoute } from "./controller";

export default class AIController extends Controller {
  public path = "/ai";
  public readonly routes: IRoute[] = [];
  public readonly routerMiddleWares: any[] = [];

  constructor(private openaiService: OpenAIService) {
    super();
  }
}
