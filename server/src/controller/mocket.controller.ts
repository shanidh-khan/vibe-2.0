import { NextFunction, Request, Response } from "express";
import Controller, { IRoute, Methods } from "./controller";
import MocketService from "@/services/mocket.service";
import { MocketResponse } from "@/models/response.model";
import { CreateMocketAiDto, CreateMocketDto } from "@/dtos/mocket.dto";
import { RequestWithInfo } from "@/interfaces/requestWithRole";
import authMiddleware from "@/middlewares/authMiddleware";

export default class MocketController extends Controller {
  constructor(private service: MocketService) {
    super();
  }
  path = "/mockets";
  routerMiddleWares = [];

  routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.getAll.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/ai",
      method: Methods.POST,
      handler: this.createAI.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/",
      method: Methods.POST,
      handler: this.create.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/:id",
      method: Methods.GET,
      handler: this.getMocket.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateMocket.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/:id",
      method: Methods.DELETE,
      handler: this.deleteMocket.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
    {
      path: "/generate-from-swagger",
      method: Methods.POST,
      handler: this.generateMocketsFromSwaggerV2.bind(this),
      localMiddleWares: [authMiddleware("access")],
    },
  ];

  async generateMocketsFromSwaggerV2(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      const { collectionId, swagger } = req.body;
      const results = await this.service.generateMocketsFromSwaggerV2(swagger, collectionId, req.user?.userId!);
      res.status(200).json(results);
    } catch (e) {
      return next(e);
    }
  }

  async index(req: Request, res: Response) {
    res.send("Hello World");
  }

  async getMocket(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      const mocket = await this.service.getMocket(req.params.id);
      res.status(200).json(mocket);
    } catch (e) {
      return next(e);
    }
  }
  async getAll(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      const mockets = await this.service.getMockets({
        userId: req.user?.userId!,
        collectionId: req.query.collectionId as string | undefined,
      });

      res.status(200).json(mockets);
    } catch (e) {
      return next(e);
    }
  }

  async create(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return next(new Error("User not found"));
      }
      const mocket = await this.service.createMocket(req.body as CreateMocketDto, req.user.userId);
      res.status(201).json(mocket);
    } catch (e) {
      return next(e);
    }
  }

  async createAI(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      const { description, collectionId }: { description: string; collectionId: string } = req.body;

      // Validate required fields
      if (!description || !collectionId) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: description and collectionId are required",
        });
      }

      if (!req.user?.userId) {
        return next(new Error("User not found"));
      }

      const result = await this.service.createMocketWithAi({ description, collectionId }, req.user.userId);

      res.json(result);
    } catch (error) {
      console.error("Error in createAI:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate API endpoints",
        error: (error as Error).message,
      });
    }
  }

  async updateMocket(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return next(new Error("User not found"));
      }
      const mocket = await this.service.updateMocket(
        req.params.id,
        req.user.userId,
        req.body as CreateMocketDto
      );
      res.status(200).json({
        message: "Mocket updated successfully",
        data: mocket,
      });
    } catch (e) {
      return next(e);
    }
  }

  async deleteMocket(req: RequestWithInfo, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return next(new Error("User not found"));
      }
      const deleted = await this.service.deleteMocket(req.params.id, req.user.userId);
      if (!deleted) return res.status(404).json({ message: "Mocket not found" });
      res.status(204).send();
    } catch (e) {
      return next(e);
    }
  }
}
