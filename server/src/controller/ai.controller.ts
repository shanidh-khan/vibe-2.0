import { Request, Response } from "express"
import { OpenAIService, ApiGenerationRequest, MocketEndpoint } from "../services/openai.service"
import { logger } from "../utils/logger"
import Controller, { Methods, IRoute } from "./controller"

export default class AIController extends Controller {
  private openaiService: OpenAIService

  public path = "/ai"
  public readonly routes: IRoute[] = [
    {
      path: "/generate-endpoints",
      method: Methods.POST,
      handler: this.generateApiEndpoints.bind(this),
    },
    {
      path: "/generate-single-endpoint",
      method: Methods.POST,
      handler: this.generateSingleEndpoint.bind(this),
    },
    {
      path: "/health",
      method: Methods.GET,
      handler: this.healthCheck.bind(this),
    },
  ]
  public readonly routerMiddleWares: any[] = []

  constructor() {
    super()
    this.openaiService = new OpenAIService()
  }

  /**
   * Generate API endpoints using OpenAI
   */
  async generateApiEndpoints(req: Request, res: Response) {
    try {
      const { description }: { description: string } = req.body

      // Validate required fields
      if (!description) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: description is required"
        })
      }

      logger.info(`Generating REST API endpoints for description: ${description}`)

      const result = await this.openaiService.generateApiEndpoints(description)

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error("Error in generateApiEndpoints:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate API endpoints",
        error: (error as Error).message
      })
    }
  }

  /**
   * Generate a single endpoint
   */
  async generateSingleEndpoint(req: Request, res: Response) {
    try {
      const { method, path, description } = req.body

      // Validate required fields
      if (!method || !path || !description) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: method, path, and description are required"
        })
      }

      // Validate HTTP method
      const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"]
      if (!validMethods.includes(method.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: "Invalid HTTP method. Must be one of: GET, POST, PUT, DELETE, PATCH"
        })
      }

      logger.info(`Generating single endpoint: ${method} ${path}`)

      const result = await this.openaiService.generateSingleEndpoint(
        method.toUpperCase(),
        path,
        description
      )

      res.json({
        success: true,
        data: result
      })
    } catch (error) {
      logger.error("Error in generateSingleEndpoint:", error)
      res.status(500).json({
        success: false,
        message: "Failed to generate endpoint",
        error: (error as Error).message
      })
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(req: Request, res: Response) {
    try {
      res.json({
        success: true,
        message: "AI service is healthy",
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      logger.error("Error in AI health check:", error)
      res.status(500).json({
        success: false,
        message: "AI service health check failed",
        error: (error as Error).message
      })
    }
  }
} 