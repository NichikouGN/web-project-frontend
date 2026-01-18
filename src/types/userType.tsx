export interface userInformation {
  userId: string;
  username: string;
  fullName: string;
  email: string;
  bio: string;
  avatarUrl?: string;
  role: "user" | "admin";
}
