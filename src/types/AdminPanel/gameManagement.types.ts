export interface GameInfo {
  gameId: string;
  title: string;
  description: string;
  boardSize: number;
  status: "active" | "inactive";
}
