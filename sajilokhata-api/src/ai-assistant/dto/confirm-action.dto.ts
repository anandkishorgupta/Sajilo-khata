import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmActionDto {
  @IsString()
  @IsNotEmpty()
  actionType: string;

  @IsNotEmpty()
  actionData: any;
}
