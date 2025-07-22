import { NextFunction, Request, Response } from "express";
import Controller, { IRoute, Methods } from "./controller";
import CollectionService from "@/services/collection.service";

export default class CollectionController extends Controller {
  constructor(private service: CollectionService) {
    super();
  }
  path = "/collections";
  routerMiddleWares = [];

  routes: IRoute[] = [
    {
      path: "/",
      method: Methods.GET,
      handler: this.getAllCollections.bind(this),
      localMiddleWares: [],
    },
    {
      path: "/:id",
      method: Methods.GET,
      handler: this.getCollectionById.bind(this),
      localMiddleWares: [],
    },
    {
      path: "/",
      method: Methods.POST,
      handler: this.createCollection.bind(this),
      localMiddleWares: [],
    },
    {
      path: "/:id",
      method: Methods.PUT,
      handler: this.updateCollection.bind(this),
      localMiddleWares: [],
    },
    {
      path: "/:id",
      method: Methods.DELETE,
      handler: this.deleteCollection.bind(this),
      localMiddleWares: [],
    },
  ];

  async getAllCollections(req: Request, res: Response, next: NextFunction) {
    try {
      const collections = await this.service.getCollections();
      res.status(200).json(collections);
    } catch (err) {
      return next(err);
    }
  }

  async getCollectionById(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = await this.service.getCollection(req.params.id);
      if (!collection) return res.status(404).json({ message: "Collection not found" });
      res.status(200).json(collection);
    } catch (err) {
      return next(err);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const collection = req.body;
      const newCollection = await this.service.createCollection(collection);
      res.status(201).json(newCollection);
    } catch (err) {
      return next(err);
    }
  }

  async updateCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await this.service.updateCollection(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Collection not found" });
      res.status(200).json(updated);
    } catch (err) {
      return next(err);
    }
  }

  async deleteCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await this.service.deleteCollection(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Collection not found" });
      res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}
