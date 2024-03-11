import * as errors from "restify-errors";
import * as v from "valibot";
import { user, userDB } from "../../models/user";
import { credentials, serviceAnswer } from "../../../../interfaces";
import { generateToken } from "../../../../utils/generateToken";
import { getDb } from "../../../../db";
import { emailSchema, userNameSchema } from "./helpers/validateData";
import { MailJetService } from "./helpers/mailJetServices";

const mailJetService = new MailJetService();

export class AuthService {
  async askForDeactivation(email: string): Promise<serviceAnswer> {
    try {
      let sendResponse = await mailJetService.sendMailDeactivation(email);

      return {
        message: sendResponse.message,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "issues" in error) {
        const validationError = error as { issues: [{ message: string }] };
        if (validationError.issues.length > 0) {
          throw new errors.UnauthorizedError(validationError.issues[0].message);
        }
      }

      throw error;
    }
  }

  async insertUser(newUser: user): Promise<serviceAnswer> {
    try {
      const db = getDb();
      v.parse(userNameSchema, newUser.username);
      v.parse(emailSchema, newUser.email);

      newUser.role = "user";
      newUser.isActive = true;

      let user = await db.collection("Users_Collection").insertOne(newUser);

      const userForToken: userDB = {
        _id: user.insertedId,
        email: newUser.email,
      };

      const jwt = generateToken(userForToken);

      return {
        message: "User registration succesfully",
        data: jwt,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "issues" in error) {
        const validationError = error as { issues: [{ message: string }] };
        if (validationError.issues.length > 0) {
          throw new errors.UnauthorizedError(validationError.issues[0].message);
        }
      }

      throw error;
    }
  }

  async loginUser(credentials: credentials): Promise<serviceAnswer> {
    try {
      const db = getDb();
      const email = v.parse(emailSchema, credentials.email);

      const user = await db.collection("Users_Collection").findOne({
        email: email,
      });

      if (!user) {
        throw new errors.NotFoundError("User is non-existant in our database");
      }

      const userForToken: userDB = {
        _id: user._id,
        email: user.email,
      };

      const jwt = generateToken(userForToken);

      return {
        message: "User authentication ok",
        data: jwt,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "issues" in error) {
        const validationError = error as { issues: [{ message: string }] };
        if (validationError.issues.length > 0) {
          throw new errors.UnauthorizedError(validationError.issues[0].message);
        }
      }

      throw error;
    }
  }

  async preLoginEmail(preEmail: string): Promise<serviceAnswer> {
    try {
      const db = getDb();
      const email = v.parse(emailSchema, preEmail);

      const user = await db.collection("Users_Collection").findOne({
        email: email,
      });

      if (!user) {
        throw new errors.NotFoundError("User is non-existant in our database");
      }

      let sendResponse = await mailJetService.sendMailCode(email);

      return {
        message: sendResponse.message,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "issues" in error) {
        const validationError = error as { issues: [{ message: string }] };
        if (validationError.issues.length > 0) {
          throw new errors.UnauthorizedError(validationError.issues[0].message);
        }
      }

      throw error;
    }
  }

  async preRegisterEmail(preEmail: string): Promise<serviceAnswer> {
    try {
      const db = getDb();

      const email = v.parse(emailSchema, preEmail);

      const user = await db.collection("Users_Collection").findOne({
        email: email,
      });

      if (user) {
        throw new errors.NotFoundError("User already exists in our database");
      }

      let sendResponse = await mailJetService.sendMailCode(email);

      return {
        message: sendResponse.message,
      };
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "issues" in error) {
        const validationError = error as { issues: [{ message: string }] };
        if (validationError.issues.length > 0) {
          throw new errors.UnauthorizedError(validationError.issues[0].message);
        }
      }

      throw error;
    }
  }
}
