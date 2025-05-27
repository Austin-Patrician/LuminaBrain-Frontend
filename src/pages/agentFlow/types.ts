export interface NodeCategory {
  id: string;
  title: string;
  type?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  children?: NodeCategory[];
}
