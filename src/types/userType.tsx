export interface userInformation {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  bio: string;
  profileImageUrl?: string;
  role: "user" | "admin";
}
