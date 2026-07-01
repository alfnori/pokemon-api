export class TrainerResponseDto {
  id: string;
  name: string;
  email: string;
  cep: string;
  street: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  createdAt: Date;
  updatedAt: Date;
}
