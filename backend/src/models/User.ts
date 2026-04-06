import { Schema, model, Model } from "mongoose";
import bcrypt from "bcrypt";

// Define an interface for the User - model used to create the actual Mongoose model

export interface IUser {
  username: string;
  email: string;
  password: string;
}

//This defines a custom instance method for a user document.
//It compares a plain password entered during login with the hashed password stored in the database.
export interface IUserMethods {
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Create a UserModel type that includes both the IUser interface and the IUserMethods interface
type UserModel = Model<IUser, {}, IUserMethods>;

// used to define the structure of a MongoDB document
const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware , Hash password before saving to database
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//Custom instance method, checks if the entered password matches the hashed password stored in the database
userSchema.method("matchPassword", async function (enteredPassword: string) {
  return bcrypt.compare(enteredPassword, this.password);
});


//This creates the actual Mongoose model named "User".
const User = model<IUser, UserModel>("User", userSchema);

export default User;