import { NextFunction, Request, Response } from "express";
import Controller, { CustomRequestHandler, IRoute, Methods } from "./controller";
import { RequestWithInfo } from "@/interfaces/requestWithRole";
import MocketService from "@/services/mocket.service";
import { PINGER_API } from "@/utils/variables";

export default class IndexController extends Controller {
  constructor(private mocketService: MocketService) {
    super();
  }
  path = "";
  routerMiddleWares = [];
  triggerPath = "/:projectId/*";
  routes: IRoute[] = [
    ...this.setTriggerRoutes(this.index.bind(this)),
    {
      path: "/health",
      method: Methods.GET,
      handler: async (req: Request, res: Response) => {
        const url = PINGER_API;
        const response = await fetch(url);
        console.log(`Pinged ${url}: Status ${response.status}`);
        res.status(200).json({ status: "UP" });
      },
    },
  ];

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.mocketService.trigger(req);
      res.status(200).json(result);
    } catch (error) {
      console.log(error);

      return next(error);
    }
  }

  private setTriggerRoutes(handler: CustomRequestHandler): IRoute[] {
    return [Methods.GET, Methods.POST, Methods.PUT, Methods.DELETE].map((method) => {
      return {
        path: this.triggerPath,
        method: method,
        handler: handler,
        localMiddleWares: [],
      };
    });
  }
}
