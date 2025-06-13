
// src/utils/validation.ts
export const isValidMQTTMessage = (data: any): data is MQTTMessage => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.timestamp === 'number' &&
    typeof data.type === 'string'
  );
};

export const isValidAggregatorMetrics = (data: any): data is AggregatorMetrics => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.total_registos === 'number' &&
    typeof data.tempo_medio_montagem === 'number' &&
    typeof data.total_defeitos === 'number' &&
    typeof data.taxa_sucesso === 'number' &&
    typeof data.por_estacao === 'object'
  );
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, '');
};
