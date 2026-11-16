// Pruebas del motor del calendario litúrgico: hechos computables verificables
// (§22.6). Las lecturas concretas NO se prueban aquí porque no se inventan:
// llegan de datos editoriales.

import { describe, expect, it } from "vitest";
import {
  easterSunday,
  computeCelebration,
  addDays,
  advent1,
} from "@/liturgy/calendar";

describe("computus de Pascua", () => {
  it("fechas conocidas de dominio público", () => {
    expect(easterSunday(2026)).toBe("2026-04-05");
    expect(easterSunday(2027)).toBe("2027-03-28");
    expect(easterSunday(2024)).toBe("2024-03-31");
  });

  it("siempre dentro de los límites canónicos (22 marzo – 25 abril)", () => {
    for (let y = 2020; y <= 2100; y++) {
      const e = easterSunday(y);
      expect(e >= `${y}-03-22` && e <= `${y}-04-25`).toBe(true);
    }
  });

  it("siempre cae en domingo", () => {
    for (let y = 2020; y <= 2060; y++) {
      expect(new Date(easterSunday(y) + "T00:00:00Z").getUTCDay()).toBe(0);
    }
  });
});

describe("celebraciones computables", () => {
  it("Navidad es siempre 25 de diciembre como solemnidad", () => {
    const c = computeCelebration("2027-12-25");
    expect(c.name).toBe("Navidad del Señor");
    expect(c.rank).toBe("solemnity");
    expect(c.season).toBe("christmas");
  });

  it("Miércoles de Ceniza es 46 días antes de Pascua", () => {
    const easter2027 = "2027-03-28";
    const ash = addDays(easter2027, -46);
    const c = computeCelebration(ash);
    expect(c.name).toBe("Miércoles de Ceniza");
    expect(c.season).toBe("lent");
  });

  it("Domingo de Ramos es 7 días antes de Pascua", () => {
    const c = computeCelebration(addDays("2026-04-05", -7));
    expect(c.name).toContain("Ramos");
    expect(c.sundayCycle).toBeDefined();
  });

  it("Pentecostés es 49 días después de Pascua", () => {
    const c = computeCelebration(addDays("2026-04-05", 49));
    expect(c.name).toBe("Domingo de Pentecostés");
  });

  it("todas las fechas de un año caen en estación válida y los domingos llevan ciclo A/B/C", () => {
    let sundays = 0;
    for (let i = 0; i < 366; i++) {
      const iso = addDays("2027-01-01", i);
      const c = computeCelebration(iso);
      expect(["advent", "christmas", "lent", "easter", "ordinary"]).toContain(c.season);
      expect(["solemnity", "feast", "memorial", "optional_memorial", "sunday", "ferial"]).toContain(c.rank);
      if (c.rank === "sunday") {
        sundays++;
        expect(["A", "B", "C"]).toContain(c.sundayCycle);
      }
    }
    // Las solemnidades fijas pueden sustituir a algún domingo (p. ej. 15-ago).
  });

  it("los ciclos dominicales rotan A→B→C entre años civiles consecutivos", () => {
    const a = computeCelebration(advent1(2025)); // I Adviento 2025
    const b = computeCelebration(advent1(2026)); // I Adviento 2026
    expect(a.sundayCycle).not.toBe(b.sundayCycle);
    expect(["A", "B", "C"]).toContain(a.sundayCycle!);
    expect(["A", "B", "C"]).toContain(b.sundayCycle!);
  });

  it("las solemnidades fijas se reconocen", () => {
    expect(computeCelebration("2027-08-15").name).toBe("Asunción de la Virgen María");
    expect(computeCelebration("2027-11-01").name).toBe("Todos los Santos");
    expect(computeCelebration("2027-01-01").name).toBe("Santa María, Madre de Dios");
  });

  it("una feria tiene ciclo ferial 1 o 2", () => {
    const c = computeCelebration("2027-02-11");
    expect(c.rank).toBe("ferial");
    expect(c.ferialCycle === 1 || c.ferialCycle === 2).toBe(true);
  });
});
