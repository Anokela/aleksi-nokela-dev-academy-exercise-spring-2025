import { Router, Request, Response } from "express";
import pool from "../db"; // Tuodaan pool tietokantayhteys config.ts:stä

const router = Router();

// Fetch all daily stats
router.get("/stats", async (req, res: Response) => {
  try {
    const result = await pool.query(`
            WITH NegativeStreaks AS (
                SELECT
                    date,
                    consumptionAmount,
                    productionAmount,
                    hourlyPrice,
                    startTime,
                    CASE WHEN hourlyPrice < 0 THEN 1 ELSE 0 END AS is_negative
                FROM electricityData
            ),
            StreaksWithGroup AS (
                SELECT
                    date,
                    startTime,
                    is_negative,
                    SUM(CASE WHEN is_negative = 1 THEN 0 ELSE 1 END) OVER (
                        PARTITION BY date ORDER BY startTime ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
                    ) AS streak_group
                FROM NegativeStreaks
            ),
            StreakDurations AS (
                SELECT
                    date,
                    MAX(streak_length) AS longest_negative_streak  -- Varmistetaan vain yksi rivi per päivä
                FROM (
                    SELECT date, streak_group, COUNT(*) AS streak_length
                    FROM StreaksWithGroup
                    WHERE is_negative = 1
                    GROUP BY date, streak_group
                ) AS subquery
                GROUP BY date
            )
            SELECT
                TO_CHAR(e.date, 'YYYY-MM-DD') AS date,
                SUM(e.consumptionAmount) AS total_consumption,
                SUM(e.productionAmount) AS total_production,
                AVG(e.hourlyPrice) AS avg_price,
                COALESCE(s.longest_negative_streak, 0) AS longest_negative_streak
            FROM electricityData e
            LEFT JOIN StreakDurations s ON e.date = s.date
            GROUP BY e.date, s.longest_negative_streak
            ORDER BY e.date;
          `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching electricity data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch stats for a single day
router.get("/stats/:date", async (req: Request<{ date: string }>, res: any) => {
  const { date } = req.params;
  try {
    const result = await pool.query(`
      WITH DayData AS (
        SELECT 
            date,
            startTime,
            consumptionAmount,
            productionAmount * 1000 AS productionAmount_kWh,  -- Muutetaan MW → kWh
            hourlyPrice
        FROM electricityData
        WHERE date = $1
    )

    SELECT
        TO_CHAR(date, 'YYYY-MM-DD') AS date,
        SUM(consumptionAmount) AS total_consumption,
        SUM(productionAmount_kWh) / 1000 AS total_production, -- Muutetaan takaisin MW-yksikköön
        AVG(hourlyPrice) AS avg_price,

        -- Peak consumption hour: tunti, jolloin kulutus on suurin suhteessa tuotantoon
        (SELECT TO_CHAR(startTime, 'HH24:MI') 
        FROM DayData 
        ORDER BY (consumptionAmount / NULLIF(productionAmount_kWh, 0)) DESC -- Suhde kulutus / tuotanto
        LIMIT 1
        ) AS peak_consumption_hour,

        -- Cheapest hours pelkäksi kellonajaksi (3 halvimman tunnin lista)
        ARRAY_AGG(TO_CHAR(startTime, 'HH24:MI') ORDER BY hourlyPrice ASC) AS cheapest_hours

    FROM DayData
    GROUP BY date;
    `, [date]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No data found for the given date" });
    }

    // Leikkaus `cheapest_hours` taulukkoon, jotta saamme vain kolme haluamaamme tuntia
    const cheapestHours = result.rows[0].cheapest_hours.slice(0, 3);
    result.rows[0].cheapest_hours = cheapestHours;

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching single day electricity stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;