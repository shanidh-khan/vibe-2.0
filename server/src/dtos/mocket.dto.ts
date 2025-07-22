import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class MocketDto {
  @IsString()
  name!: string;

  @IsString()
  description?: string;

  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsString()
  @IsNotEmpty()
  endpoint!: string;

  // @IsString()
  // @IsNotEmpty()
  // requestHeaders?: string | Object;

  @IsObject()
  // @IsNotEmpty()
  request!: string | Record<string, string> | Object;

  @IsObject()
  response!: string | Record<string, string> | Object;
}
export class CreateMocketDto extends MocketDto {
  @IsString()
  @IsNotEmpty()
  collectionId!: string;
}

export class CreateMocketAiDto {
  @IsString()
  @IsNotEmpty()
  description!: string;
  
  @IsString()
  @IsNotEmpty()
  collectionId!: string;
}

import { z } from "zod";

export const ZodMocketSchema = z.object({
  requestType: z.string(),
  endpoint: z.string(),
  requestHeaders: z.string(),
  requestBody: z.string(),
  responseBody: z.string(),
});
