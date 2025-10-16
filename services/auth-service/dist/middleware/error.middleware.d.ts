import type { Request, Response, NextFunction } from "express";
interface CustomError extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (err: CustomError, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=error.middleware.d.ts.map