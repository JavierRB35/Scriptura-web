// Motor del calendario litúrgico general (§13.2): computable y verificable.
// Calcula para cualquier fecha: estación, rango y ciclos (dominical A/B/C y
// ferial I/II). Las LECTURAS concretas no se inventan aquí: llegan de la
// tabla editorial liturgical_readings; sin ellas, el envío se omite con
// incidencia (§13.3). Las festividades propias de España se gestionan como
// datos editoriales con prioridad sobre el general.

export interface Celebration {
  date: string;
  name: string;
  rank: "solemnity" | "feast" | "memorial" | "optional_memorial" | "sunday" | "ferial";
  season: "advent" | "christmas" | "lent" | "easter" | "ordinary";
  sundayCycle: "A" | "B" | "C" | null;
  ferialCycle: 1 | 2 | null;
}

export function toISO(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(iso: string, days: number): string {
  const d = fromISO(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISO(d);
}

export function dayOfWeek(iso: string): number {
  return fromISO(iso).getUTCDay();
}

/** Domingo de Pascua (computus de Meeus/Jones/Butcher). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toISO(new Date(Date.UTC(year, month - 1, day)));
}

/** I Domingo de Adviento: el domingo de la semana del 30 de noviembre. */
export function advent1(year: number): string {
  const nov30 = `${year}-11-30`;
  const dow = dayOfWeek(nov30);
  return dow === 0 ? nov30 : addDays(nov30, -dow);
}

export function computeCelebration(iso: string): Celebration {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const dow = dayOfWeek(iso);
  const easter = easterSunday(year);
  const ash = addDays(easter, -46);
  const pentecost = addDays(easter, 49);
  const trinity = addDays(easter, 56);
  const christmas = `${year}-12-25`;
  const a1 = advent1(year);

  // Inicio del año litúrgico que contiene esta fecha.
  const inAdvent = month === 11 || (month === 12 && iso < christmas);
  const litStartYear = inAdvent && iso >= a1 ? year : iso >= a1 ? year : year - 1;
  // Para fechas de nov-dic previas al I Adviento del año civil, el año
  // litúrgico empezó en noviembre del año civil (a1(year) ya lo cubre si iso>=a1;
  // si iso < a1 en noviembre, aún es tiempo ordinario del año litúrgico anterior).
  const litYear = iso >= a1 ? year : year - 1;
  void litStartYear;
  const sundayCycle = (["A", "B", "C"] as const)[(litYear - 1) % 3];
  const ferialCycle = (((litYear - 1) % 2) + 1) as 1 | 2;

  // Ventanas móviles de esta fecha (Pascua del año civil: Cuaresma/Pascua
  // siempre ocurren marzo-mayo del mismo año civil).
  const easterWin = easter;
  const ashWin = addDays(easterWin, -46);
  const pentecostWin = addDays(easterWin, 49);

  // ── Móviles principales (sobresalen a todo) ──
  if (iso === easterWin) return mk(iso, "Domingo de Pascua de la Resurrección del Señor", "solemnity", "easter", sundayCycle, null);
  if (iso === addDays(easterWin, -2)) return mk(iso, "Viernes Santo de la Pasión del Señor", "solemnity", "lent", null, null);
  if (iso === addDays(easterWin, -3)) return mk(iso, "Jueves Santo de la Cena del Señor", "solemnity", "lent", null, null);
  if (iso === addDays(easterWin, -7)) return mk(iso, "Domingo de Ramos en la Pasión del Señor", "solemnity", "lent", sundayCycle, null);
  if (iso === ashWin) return mk(iso, "Miércoles de Ceniza", "solemnity", "lent", null, null);
  if (iso === addDays(easterWin, 39)) return mk(iso, "Ascensión del Señor", "solemnity", "easter", null, null);
  if (iso === pentecostWin) return mk(iso, "Domingo de Pentecostés", "solemnity", "easter", null, null);
  if (iso === trinity) return mk(iso, "Santísima Trinidad", "solemnity", "ordinary", null, null);
  if (iso === addDays(easterWin, 60)) return mk(iso, "Corpus Christi", "solemnity", "ordinary", null, null);

  // ── Estación ──
  let season: Celebration["season"];
  if (month >= 3 && month <= 6 && iso >= ashWin && iso < easterWin) season = "lent";
  else if (month >= 3 && month <= 6 && iso >= easterWin && iso <= pentecostWin) season = "easter";
  else if (month === 12 && iso >= christmas) season = "christmas";
  else if (month === 1 && iso <= `${year}-01-13`) season = "christmas";
  else if ((month === 12 || month === 11) && iso >= a1) season = "advent";
  else if (month === 12 && iso < christmas) season = "advent";
  else season = "ordinary";

  // ── Solemnidades fijas (sustituyen al domingo) ──
  const md = iso.slice(5);
  const fixed: Record<string, string> = {
    "12-08": "Inmaculada Concepción",
    "12-25": "Navidad del Señor",
    "01-01": "Santa María, Madre de Dios",
    "06-29": "San Pedro y San Pablo",
    "08-15": "Asunción de la Virgen María",
    "11-01": "Todos los Santos",
  };
  if (fixed[md]) return mk(iso, fixed[md], "solemnity", season, dow === 0 ? sundayCycle : null, null);

  // ── Domingos con nombre ──
  if (dow === 0) {
    if (season === "advent") {
      const n = sundaysSince(iso, a1) + 1;
      return mk(iso, `${n}º Domingo de Adviento`, "sunday", season, sundayCycle, null);
    }
    if (season === "lent") {
      return mk(iso, `${sundaysSince(iso, ashWin) + 1}º Domingo de Cuaresma`, "sunday", season, sundayCycle, null);
    }
    if (season === "easter") {
      return mk(iso, `${sundaysSince(iso, easterWin) + 1}º Domingo de Pascua`, "sunday", season, sundayCycle, null);
    }
    if (season === "christmas") {
      // Sagrada Familia: domingo dentro de la octava de Navidad (25-31 dic);
      // si no hay, el 30 de diciembre. Epifanía como domingo no se numera aquí.
      if (month === 12) return mk(iso, "Sagrada Familia", "feast", season, null, null);
      return mk(iso, "La Epifanía del Señor", "solemnity", season, null, null);
    }
    // Tiempo ordinario: numeración garantizada por el final (Cristo Rey = 34º,
    // una semana antes del I Adviento) o desde el Bautismo del Señor.
    const a1Next = advent1(litYear + 1);
    if (iso > trinity && iso < a1) {
      const king = addDays(a1, -7);
      const n = 34 - Math.round((fromISO(king).getTime() - fromISO(iso).getTime()) / 604800000);
      return mk(iso, `${n}º Domingo del Tiempo Ordinario`, "sunday", season, sundayCycle, null);
    }
    void a1Next;
    // Ordinario I (enero-febrero): domingos tras el Bautismo del Señor (domingo
    // posterior al 6 de enero).
    const baptism = nextSunday(`${year}-01-06`);
    const n1 = sundaysSince(iso, baptism) + 2;
    return mk(iso, `${n1}º Domingo del Tiempo Ordinario`, "sunday", season, sundayCycle, null);
  }

  return mk(iso, "Feria", "ferial", season, null, ferialCycle);
}

function mk(
  date: string, name: string, rank: Celebration["rank"], season: Celebration["season"],
  sundayCycle: Celebration["sundayCycle"], ferialCycle: Celebration["ferialCycle"]
): Celebration {
  return { date, name, rank, season, sundayCycle, ferialCycle };
}

function nextSunday(iso: string): string {
  const dow = dayOfWeek(iso);
  return addDays(iso, dow === 0 ? 7 : 7 - dow);
}

function sundaysSince(iso: string, since: string): number {
  if (iso <= since) return 0;
  return Math.round((fromISO(iso).getTime() - fromISO(since).getTime()) / 604800000);
}
