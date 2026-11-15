import { describe, expect, it } from "vitest";
import { detectEditorialAnomalies } from "../../scripts/audit-bible";

describe("auditoría editorial conservadora", () => {
  it("no considera errores las grafías y acentos históricos", () => {
    expect(detectEditorialAnomalies("EN el principio crió Dios los cielos y la tierra.")).toEqual([]);
    expect(detectEditorialAnomalies("Y fué dicho á los hombres: ¿Qué hacéis?")).toEqual([]);
  });

  it("señala errores técnicos sin reescribir el texto", () => {
    expect(detectEditorialAnomalies("Texto� original")).toContain("carácter de sustitución Unicode");
    expect(detectEditorialAnomalies("Texto  doble")).toContain("espaciado anómalo");
    expect(detectEditorialAnomalies("Texto , puntuación")).toContain("espacio antes de puntuación");
    expect(detectEditorialAnomalies("Texto!!!")).toContain("puntuación repetida");
    expect(detectEditorialAnomalies(String.raw`\\add texto`)).toContain("posible marcador USFM sin procesar");
  });
});
