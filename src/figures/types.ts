export interface Figure<T> {
  id: string;
  title: string;
  value: T;
  /** The git command (or method) that produced the value, so a reader can rerun it. */
  command: string;
  /** What the figure cannot show. Printed under every figure. */
  limits: string[];
}

export interface Identity {
  emails: string[];
  names: string[];
}
