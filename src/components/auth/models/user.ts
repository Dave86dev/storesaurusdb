import { ObjectId } from "mongodb";

export interface user {
  username: string;
  email: string;
  password: string;
  role : "admin" | "user";
  isActive: boolean;
}

export interface userDB {
  _id: string | ObjectId;
  email: string;
}
