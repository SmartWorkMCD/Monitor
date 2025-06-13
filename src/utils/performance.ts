
// src/utils/performance.ts
export interface PerformanceMetrics {
  renderTime: number;
  apiLatency: number;
  wsLatency: number;
  memoryUsage?: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    apiLatency: 0,
    wsLatency: 0
  };

  public startRenderTimer(): () => void {
    const start = performance.now();
    return () => {
      this.metrics.renderTime = performance.now() - start;
    };
  }

  public recordApiLatency(latency: number): void {
    this.metrics.apiLatency = latency;
  }

  public recordWSLatency(latency: number): void {
    this.metrics.wsLatency = latency;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public logMetrics(): void {
    console.log('Performance Metrics:', this.metrics);
  }
}
