export interface IDataSource {
  /** Liefert Daten-Record für einen Schlüssel */
  fetch(key: string): Promise<Record<string, string>>;
}
