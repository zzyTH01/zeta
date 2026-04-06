export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface DayEntry {
  diary?: string;
  todos?: Todo[];
}

export type Entries = Record<string, DayEntry>;
