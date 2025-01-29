import { Router } from "express";
import pool from "../db"; // Tuodaan pool tietokantayhteys config.ts:stä

const router = Router();

// Fetch consumption and production stats per day
router.get("/stats", async (req, res) => {
    try {
          const result = await pool.query(`
            WITH NegativeStreaks AS (
              -- Vaihe, jossa tunnistetaan negatiiviset hinnat
              SELECT
                date,
                consumptionAmount,
                productionAmount,
                hourlyPrice,
                startTime,
                CASE
                  WHEN hourlyPrice < 0 THEN 1
                  ELSE 0
                END AS is_negative
              FROM electricityData
            ),
            StreaksWithGroup AS (
              -- Vaihe, jossa luodaan ryhmiä peräkkäisille negatiivisille hinnoille
              SELECT
                date,
                consumptionAmount,
                productionAmount,
                hourlyPrice,
                startTime,
                is_negative,
                -- Luodaan ryhmä, joka seuraa negatiivisten hintojen peräkkäisyyttä
                SUM(CASE WHEN is_negative = 1 THEN 0 ELSE 1 END) OVER (PARTITION BY date ORDER BY startTime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS streak_group
              FROM NegativeStreaks
            ),
            StreakDurations AS (
              -- Vaihe, jossa lasketaan kunkin negatiivisen hintajakson pituus
              SELECT
                date,
                streak_group,
                COUNT(*) AS streak_length -- Lasketaan jakson pituus
              FROM StreaksWithGroup
              WHERE is_negative = 1 -- Lasketaan vain negatiiviset jaksot
              GROUP BY date, streak_group
            )
            -- Päätason kysely, joka yhdistää tulokset ja laskee halutut aggregoidut tiedot
            SELECT
              TO_CHAR(e.date, 'YYYY-MM-DD') AS date,
              SUM(e.consumptionAmount) AS total_consumption,
              SUM(e.productionAmount) AS total_production,
              AVG(e.hourlyPrice) AS avg_price,
              COALESCE(MAX(s.streak_length), 0) AS longest_negative_streak
            FROM electricityData e
            JOIN StreakDurations s ON e.date = s.date
            GROUP BY e.date
            ORDER BY e.date;
          `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching electricity stats:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;