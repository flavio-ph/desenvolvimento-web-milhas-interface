/**
 * Utilitários centralizados para tratamento de datas.
 *
 * O Spring Boot pode serializar LocalDate/LocalDateTime como:
 *   - Array numérico: [2024, 2, 23] ou [2024, 2, 23, 10, 30, 0]
 *   - String ISO:     "2024-02-23" ou "2024-02-23T10:30:00"
 *   - String BR:      "23/02/2024"
 *
 * Centralizado aqui para facilitar a remoção após fix no backend.
 */

/** Tipo union que representa todas as formas que o backend pode enviar uma data. */
export type RawDate = string | number[] | null | undefined;

/**
 * Parser universal de datas.
 * Quando o backend for corrigido para sempre enviar ISO-8601, esta função
 * pode ser simplificada para apenas `new Date(data)`.
 */
export const parseSafeDate = (data: RawDate): Date | null => {
  if (!data) return null;

  // 1. Array numérico enviado pelo Spring Boot: [2024, 2, 23] ou com hora
  if (Array.isArray(data)) {
    const [ano, mes, dia, hora = 0, minuto = 0, segundo = 0] = data;
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  }

  if (typeof data === 'string') {
    // 2. String no formato brasileiro: "23/02/2024" ou "23/02/2024 10:30"
    if (data.includes('/')) {
      const parts = data.split(/[\sT]+/);
      const [d, m, y] = parts[0].split('/');
      const timeParts = parts[1] ? parts[1].split(':') : [0, 0, 0];
      return new Date(Number(y), Number(m) - 1, Number(d), Number(timeParts[0]), Number(timeParts[1]));
    }

    // 3. String ISO sem hora: "2024-02-23" — usa meio-dia para evitar problema de fuso
    if (data.length === 10 && data.includes('-')) {
      const [y, m, d] = data.split('-');
      return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0);
    }
  }

  // 4. Fallback genérico (ISO com hora, etc.)
  const parsed = new Date(data as string);
  if (isNaN(parsed.getTime())) {
    console.warn('⚠️ Frontend não conseguiu parsear esta data:', data);
    return null;
  }
  return parsed;
};

/**
 * Formata uma data em dd/mm/yyyy. Retorna '—' se inválida.
 */
export const formatDate = (data: RawDate): string => {
  const d = parseSafeDate(data);
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Retorna label humanizado para uma data no formato "dd/mm/yyyy":
 * "HOJE", "ONTEM", ou "23 DE FEVEREIRO".
 */
export const humanDate = (dateStr: string): string => {
  if (!dateStr || dateStr === '—' || dateStr === 'Data Desconhecida') return 'Data Desconhecida';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yesterdayStr = yesterday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (dateStr === todayStr) return 'HOJE';
  if (dateStr === yesterdayStr) return 'ONTEM';

  const [d, m, y] = dateStr.split('/');
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }).toUpperCase();
};

/**
 * Formata valor monetário em BRL.
 */
export const formatCurrency = (v?: number): string =>
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
