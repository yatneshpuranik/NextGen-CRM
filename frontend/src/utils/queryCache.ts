interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes cache validity

  public buildKey(resource: string, params: Record<string, any>): string {
    return `${resource}:${JSON.stringify(params)}`;
  }

  public get<T>(resource: string, params: Record<string, any>): T | null {
    const key = this.buildKey(resource, params);
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.defaultTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  public set<T>(resource: string, params: Record<string, any>, data: T): void {
    const key = this.buildKey(resource, params);
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public invalidate(resource: string): void {
    const prefix = `${resource}:`;
    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  public clearAll(): void {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();
