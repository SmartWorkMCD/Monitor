
// src/utils/errorHandling.ts
export interface ErrorInfo {
  id: string;
  message: string;
  stack?: string;
  timestamp: number;
  context?: Record<string, any>;
}

export class ErrorLogger {
  private errors: ErrorInfo[] = [];
  private maxErrors = 100;

  public logError(error: Error, context?: Record<string, any>): ErrorInfo {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      context
    };

    this.errors.unshift(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    console.error('Error logged:', errorInfo);
    return errorInfo;
  }

  public getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }

  public getErrorsAsString(): string {
    return JSON.stringify(this.errors, null, 2);
  }
}

export const errorLogger = new ErrorLogger();
