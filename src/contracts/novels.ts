export interface BookSummary {
  id: string;
  title: string;
  revision: number;
  archived: boolean;
  archivedAt?: string;
  updatedAt?: string;
}
