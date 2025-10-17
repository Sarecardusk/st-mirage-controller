import sqlite3InitModule from '@sqliteai/sqlite-wasm';

export type DatabaseScope = 'global' | string; // 'global' or character card ID

export class DatabaseService {
  private db: any = null;
  private currentScope: DatabaseScope = 'global';
  private isInitialized = false;

  /**
   * 初始化数据库 (使用 OPFS)
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      // 使用 OPFS VFS 进行持久化存储
      if ('opfs' in sqlite3.capi) {
        this.db = new sqlite3.oo1.OpfsDb('/mirage-controller.db');
        console.log('Database initialized with OPFS');
      } else {
        // 降级到内存数据库
        this.db = new sqlite3.oo1.DB();
        console.warn('OPFS not available, using in-memory database');
      }

      await this.createTables();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * 创建核心数据表
   */
  private async createTables(): Promise<void> {
    const tables: string[] = [
      // 角色表
      `CREATE TABLE IF NOT EXISTS characters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        metadata TEXT,
        db_scope TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 状态变量表
      `CREATE TABLE IF NOT EXISTS status_variables (
        id TEXT PRIMARY KEY,
        character_id TEXT NOT NULL,
        name TEXT NOT NULL,
        value TEXT,
        FOREIGN KEY (character_id) REFERENCES characters(id)
      )`,

      // 物品表
      `CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        owner_id TEXT,
        name TEXT NOT NULL,
        attributes TEXT
      )`,

      // 地点表
      `CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT
      )`,

      // 任务表
      `CREATE TABLE IF NOT EXISTS quests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        details TEXT
      )`,

      // 总结表 (一级总结详细内容)
      `CREATE TABLE IF NOT EXISTS summaries (
        event_id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )`,

      // 向量表 (二级总结向量化)
      `CREATE TABLE IF NOT EXISTS vectors (
        summary_id TEXT PRIMARY KEY,
        vector BLOB,
        text_preview TEXT
      )`,
    ];

    for (const sql of tables) {
      this.db.exec(sql);
    }
  }

  /**
   * 切换数据库作用域 (全局 / 角色卡专属)
   */
  async switchScope(scope: DatabaseScope): Promise<void> {
    this.currentScope = scope;
    // TODO: 实现作用域切换逻辑
    console.log(`Switched to scope: ${scope}`);
  }

  /**
   * 导出数据为 JSON
   */
  async exportToJSON(): Promise<string> {
    // TODO: 实现导出逻辑
    return JSON.stringify({ scope: this.currentScope, data: {} });
  }

  /**
   * 从 JSON 导入数据
   */
  async importFromJSON(json: string): Promise<void> {
    // TODO: 实现导入逻辑
    console.log('Import:', json);
  }

  /**
   * 执行查询
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    const results: T[] = [];
    this.db.exec({
      sql,
      bind: params,
      rowMode: 'object',
      callback: (row: T) => results.push(row),
    });
    return results;
  }

  /**
   * 执行非查询语句 (INSERT, UPDATE, DELETE)
   */
  exec(sql: string, params: any[] = []): void {
    this.db.exec({ sql, bind: params });
  }

  /**
   * 关闭数据库
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.isInitialized = false;
    }
  }
}

// 导出单例实例
export const databaseService = new DatabaseService();
