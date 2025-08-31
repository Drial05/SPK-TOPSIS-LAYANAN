import { Request, Response } from "express";
import XLSX from "xlsx";
import { db } from "../../utils/db";
import {
  getScoresPage,
  createScore,
  updateScore,
  deleteScores,
} from "../../models/topsis/scoreModel";

interface Score {
  id: number;
  name: string;
  value: number;
}

// konversi nilai range (0-100) ke rating (1-5)
function convertScore(value: number, name: string): number {
  name = name.toLowerCase().trim();
  // gunakan batas konsisten >=
  if (name == "frekuensi penggunaan") {
    if (value >= 400) return 5;
    if (value >= 300) return 4;
    if (value >= 200) return 3;
    if (value >= 100) return 2;
    return 1;
  } else if (name == "jumlah pengguna") {
    if (value >= 300) return 5;
    if (value >= 225) return 4;
    if (value >= 150) return 3;
    if (value >= 75) return 2;
    return 1;
  } else if (name == "rata-rata nominal transaksi") {
    if (value >= 1000000) return 5;
    if (value >= 750000) return 4;
    if (value >= 500000) return 3;
    if (value >= 250000) return 2;
    return 1;
  } else if (name == "biaya transaksi") {
    // cost di balik
    if (value <= 1000) return 5;
    if (value <= 2000) return 4;
    if (value <= 3000) return 3;
    if (value <= 4000) return 2;
    return 1;
  }
  // default kalo tidak ada yang cocok
  return 1;
}

export const getScores = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const { data, totalRows, totalPages } = await getScoresPage(
      pageSize,
      offset
    );

    // konversi nilai ke matriks keputusan
    const convertedData: (Score & { rating: number })[] = data.map(
      (item: any) => {
        return {
          ...item,
          rating: convertScore(item.value, item.criteria_name),
        };
      }
    );

    res.json({
      data: convertedData,
      page,
      pageSize,
      totalRows,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching score", err);
    return res.status(500).json({ error: "Failed to fetch scores" });
  }
};

export const addScore = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    if (Array.isArray(data)) {
      for (const item of data) {
        await createScore(item);
      }
      return res.status(201).json({ message: "Multiple scores created" });
    }

    await createScore(data);
    return res.status(201).json({ message: "Score created" });
  } catch (err) {
    console.error("Failed to add score...", err);
    res.status(500).json({ error: "Failed to add score", err });
  }
};

export const editScore = async (req: Request, res: Response) => {
  const updates = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const result = await updateScore(updates);
    res.json(result);
  } catch (err) {
    console.error("Updated error:", err);
    res.status(500).json({ message: "Updated err", err });
  }
};

export const removeScores = async (req: Request, res: Response) => {
  const alternativeIds = req.body;

  if (!Array.isArray(alternativeIds)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    await deleteScores(alternativeIds);
    res.json({ message: "Scores deleted for alternatives" });
  } catch (err) {
    console.error("Deleted scores error:", err);
    res.status(500).json({ message: "Deleted scores error:", err });
  }
};

export const importScoresFromFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    // format yang di harapkan : alternative_id, criteria_id, value
    const values = rows.map((row: any) => [
      row.alternative_id,
      row.criteria_id,
      row.value,
    ]);

    if (!values.length)
      return res.status(400).json({ message: "No data found" });

    // ambil unique alternative id dan name dari data import
    const alternativeData = Array.from(
      new Map(rows.map((r: any) => [r.alternative_id, r.name])).entries()
    ).map(([id, name]) => ({ alternative_id: id, name }));

    const alternativeIds = alternativeData.map((a) => a.alternative_id);

    // cek alternative id yang belum ada di tabel alternative topsis
    const [existingAlternatives] = await db.query(
      "SELECT id from alternative_topsis WHERE id IN (?)",
      [alternativeIds]
    );

    // extract alternative id yang sudah ada
    const existingIds = new Set(
      (existingAlternatives as any[]).map((alt) => alt.alternative_id)
    );

    // filter alternative id yang belum ada
    const newAlternatives = alternativeData.filter(
      (a) => !existingIds.has(a.alternative_id)
    );

    // insert alternative baru ke tabel alternative_topsis
    if (newAlternatives.length) {
      const insertData = newAlternatives.map((a) => [a.alternative_id, a.name]);
      await db.query("INSERT INTO alternative_topsis (id, name) VALUES ?", [
        insertData,
      ]);
    }

    // hapus dulu data scores lama
    //await db.query("DELETE FROM scores_topsis");

    // insert data skor yang sudah ada / baru
    await db.query(
      "INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES ?",
      [values]
    );

    res.json({
      message: "Scores imported successfully",
      rows: values.length,
      newAlternatives: newAlternatives.length,
    });
  } catch (err) {
    console.error("Error importing scores from file:", err);
    return res
      .status(500)
      .json({ error: "Failed to import scores from file", err });
  }
};

// function isSpecialChannel(name: string): boolean {
//   const normalized = name.toLowerCase().replace(/[\s-]/g, "");
//   return (
//     normalized.includes("ewallet") ||
//     normalized.includes("skn") ||
//     normalized.includes("online")
//   );
// }

function calculateAvgFee(data: any[]): number {
  const filtered = data.filter((d) => Number(d.fee) > 0);
  if (filtered.length > 0) {
    return (
      filtered.reduce((sum, d) => sum + Number(d.fee || 0), 0) / filtered.length
    );
  }
  return 0;
}

export const importScoresFromXlsx = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // baca file excel
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (!rows.length) {
      return res.status(400).json({ message: "No data found" });
    }

    // normalisasi header -> lowercase, spasi -> underscore
    rows = rows.map((row) => {
      const newRow: any = {};
      Object.keys(row).forEach((key) => {
        const newKey = key.trim().toLowerCase().replace(/\s+/g, "_");
        newRow[newKey] = row[key];
      });
      return newRow;
    });

    // ambil daftar criteria dari database
    const [criteriaRowsRaw] = await db.query(
      "SELECT id, name FROM criteria_topsis"
    );
    const criteriaRows = criteriaRowsRaw as { id: string; name: string }[];

    // mapping nama -> id (sesuai nama di database)
    const criteriaMap: Record<string, string> = {};
    criteriaRows.forEach((c) => {
      criteriaMap[c.name.toLowerCase().trim()] = c.id;
    });

    // Group berdasarkan Trx_name
    const grouped: Record<string, any[]> = {};
    rows.forEach((row) => {
      const trxName = row.trx_name ? String(row.trx_name).trim() : null;
      if (!trxName) return;
      if (!grouped[trxName]) grouped[trxName] = [];
      grouped[trxName].push(row);
    });

    // format alternative data
    const alternativeNames = Object.keys(grouped);

    // cek alternative yang sudah ada
    // const [existingRaw] = await db.query(
    //   "SELECT id, name FROM alternative_topsis WHERE name IN (?)",
    //   [alternativeNames]
    // );

    // const existingAlternatives = existingRaw as { id: number; name: string }[];

    // const existingNameSet = new Set(existingAlternatives.map((a) => a.name));

    // insert alternative baru
    // const newNames = alternativeNames.map(
    //   (name) => !existingNameSet.has(name)
    // );

    const newNames = alternativeNames;
    if (newNames.length) {
      const insertData = newNames.map((name) => [name]);
      await db.query("INSERT INTO alternative_topsis (name) VALUES ?", [
        insertData,
      ]);
    }

    // ambil ulang semua alternative
    const [allRaw] = await db.query(
      "SELECT id, name FROM alternative_topsis WHERE name IN (?)",
      [alternativeNames]
    );
    const allAlternative = allRaw as { id: number; name: string }[];
    const nameToId = new Map(allAlternative.map((a) => [a.name, a.id]));

    const values: any[] = [];

    // hitung nilai untuk tiap alternative
    alternativeNames.forEach((name) => {
      const altId = nameToId.get(name);
      const data = grouped[name];

      if (!altId || !data || !data.length) return;

      // frekuensi pengguna = jumlah transaksi
      const frekuensi = data.length;

      // jumlah pengguna unik
      const uniqueUsers = new Set(data.map((d) => d.bank_customer_no)).size;

      // Rata - rata nominal transaksi
      const avgNominal =
        data.reduce((sum, d) => sum + Number(d.trx_amt || 0), 0) / frekuensi;

      // biaya rata-rata transaksi total
      const avgFee = calculateAvgFee(data);
      // let avgFee: 0;
      // if (isSpecialChannel(name)) {
      //   const filtered = data.filter((d) => Number(d.fee) > 0);
      //   avgFee =
      //     filtered.reduce((sum, d) => sum + Number(d.fee || 0), 0) /
      //     (filtered.length || 1);
      // } else {
      //   avgFee =
      //     data.reduce((sum, d) => sum + Number(d.fee || 0), 0) /
      //     (frekuensi || 1);
      // }

      // masukan ke values sesuai id criteria di database
      if (criteriaMap["frekuensi penggunaan"])
        values.push([altId, criteriaMap["frekuensi penggunaan"], frekuensi]);

      if (criteriaMap["jumlah pengguna"])
        values.push([altId, criteriaMap["jumlah pengguna"], uniqueUsers]);

      if (criteriaMap["rata-rata nominal transaksi"])
        values.push([
          altId,
          criteriaMap["rata-rata nominal transaksi"],
          avgNominal,
        ]);

      if (criteriaMap["biaya transaksi"])
        values.push([altId, criteriaMap["biaya transaksi"], avgFee]);
    });

    // hapus data skor lama
    await db.query("DELETE FROM scores_topsis");

    // insert skor baru
    if (values.length) {
      await db.query(
        "INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES ?",
        [values]
      );
    }

    res.json({
      message: "Scores imported successfully",
      rows: values.length,
      newAlternatives: newNames.length,
    });
  } catch (err) {
    console.error("Error importing scores from file:", err);
    return res
      .status(500)
      .json({ error: "Failed to import scores from file", err });
  }
};
