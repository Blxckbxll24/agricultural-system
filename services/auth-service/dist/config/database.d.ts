import mysql from "mysql2/promise";
declare const pool: mysql.Pool;
/**
 * Test database connection with retry logic and exponential backoff
 */
export declare const testConnection: (retries?: number) => Promise<boolean>;
/**
 * Get database connection health status
 */
export declare const getConnectionHealth: () => Promise<{
    healthy: boolean;
    message: string;
    details?: any;
}>;
/**
 * Gracefully close the database pool
 */
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map