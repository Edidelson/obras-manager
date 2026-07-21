/**
 * Conversão de datas digitadas pelo usuário pra ISO (YYYY-MM-DD), formato
 * que o backend (java.time.LocalDate) espera. Sem isso, digitar no formato
 * brasileiro comum (DD/MM/AAAA) quebra o cadastro com
 * "DateTimeParseException: Text '06/07/2026' could not be parsed".
 *
 * Aceita tanto DD/MM/AAAA quanto AAAA-MM-DD (caso o usuário já digite ISO).
 * Retorna null se o texto não for uma data válida.
 */
export function paraISO(input: string): string | null {
  const v = input.trim();
  if (!v) return null;

  const br = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) {
    const [, dd, mm, yyyy] = br;
    return validarData(yyyy, mm, dd) ? `${yyyy}-${mm}-${dd}` : null;
  }

  const iso = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    const [, yyyy, mm, dd] = iso;
    return validarData(yyyy, mm, dd) ? `${yyyy}-${mm}-${dd}` : null;
  }

  return null;
}

function validarData(yyyy: string, mm: string, dd: string): boolean {
  const ano = Number(yyyy), mes = Number(mm), dia = Number(dd);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const d = new Date(ano, mes - 1, dia);
  return d.getFullYear() === ano && d.getMonth() === mes - 1 && d.getDate() === dia;
}

/** Formata uma data ISO (YYYY-MM-DD) pra exibição no padrão brasileiro. */
export function paraBR(iso?: string | null): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}
