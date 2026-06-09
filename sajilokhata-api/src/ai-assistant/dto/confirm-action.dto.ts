import { IsObject, IsString } from "class-validator";

export class ConfirmActionDto {
  @IsString()
  actionType: string;

  @IsObject()
  actionData: Record<string, any>;
}
