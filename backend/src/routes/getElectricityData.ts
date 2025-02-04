import { Router, Request, Response } from "express";
import pool from "../db"; //import pool from config.ts

const router = Router();

//  This is for fetching data for daily electricity data based on user filters
router.get("/stats", async (req, res: Response) => {
  const page = Number(req.query.page) || 1;   // paging number, by default one
  let limit = Number(req.query.limit); // how many rows are fetched

  if (limit === 0) { // needed to check if user wants to return all rows without paging
    limit = 0;
  } else {
    limit = limit || 25;  // default 25 if not provided from frontend
  }

  const offset = (page - 1) * limit;
  const fetchAll = limit === 0;

  const validOnly = req.query.validOnly === "true";
  const year = req.query.year ? Number(req.query.year) : null;

  try {
    let whereConditions = []; // initialize conditions by filters

    // filter to return only rows with valid calculated data i.e. no null values of avg_price or total_consuption
    if (validOnly) {
      whereConditions.push("e.consumptionAmount IS NOT NULL AND e.productionAmount IS NOT NULL AND e.hourlyPrice IS NOT NULL");
    }
    // filter to return values by year
    if (year) {
      whereConditions.push(`EXTRACT(YEAR FROM e.date) = ${year}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const query = `
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
              MAX(streak_length) AS longest_negative_streak
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
          COALESCE(s.longest_negative_streak, 0) AS longest_negative_streak --change null-value to 0
      FROM electricityData e
      LEFT JOIN StreakDurations s ON e.date = s.date
      ${whereClause}  -- Added Filterin here
      GROUP BY e.date, s.longest_negative_streak
      ORDER BY e.date
      ${fetchAll ? "" : "LIMIT $1 OFFSET $2"}; -- paging
    `;

    const params = fetchAll ? [] : [limit, offset];
    const result = await pool.query(query, params);

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
              productionAmount * 1000 AS productionAmount_kWh,  -- Convert MW → kWh for peak consumption hour calculation 
              hourlyPrice
          FROM electricityData
          WHERE date = $1
      )

      SELECT
          TO_CHAR(date, 'YYYY-MM-DD') AS date,
          SUM(consumptionAmount) AS total_consumption,
          SUM(productionAmount_kWh) / 1000 AS total_production, --return total production value as MWh
          AVG(hourlyPrice) AS avg_price,

          -- Peak consumption hour calculation (Calculate only if Consuption values)
          (
              SELECT TO_CHAR(startTime, 'HH24:MI')
              FROM DayData 
              WHERE consumptionAmount IS NOT NULL  --filter out NULL values
              ORDER BY (consumptionAmount / NULLIF(productionAmount_kWh, 0)) DESC 
              LIMIT 1
          ) AS peak_consumption_hour,

          -- Cheapest hours (3 of the hours with most cheapest price)
          ARRAY_AGG(TO_CHAR(startTime, 'HH24:MI') ORDER BY hourlyPrice ASC) AS cheapest_hours

      FROM DayData
      GROUP BY date;
    `, [date]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No data found for the given date" });
    }

    const row = result.rows[0];

    //Checkif there's data in hourlyPrice
    if (row.avg_price === null || row.avg_price === 0) {
      row.cheapest_hours = []; // If no price values, no cheapest_hours
    } else {
      // slice 3 most cheapest hour-values
      row.cheapest_hours = row.cheapest_hours.slice(0, 3);
    }

    // Fetch hourly raw-data
    const hourlyDataResult = await pool.query(`
      SELECT 
          TO_CHAR(startTime, 'HH24:MI') AS time,
          consumptionAmount AS consumption,
          productionAmount * 1000 AS production,  -- MW → kWh
          hourlyPrice AS price
      FROM electricityData
      WHERE date = $1
      ORDER BY startTime;
    `, [date]);

    // Add  rawdata to json-response
    row.hourly_data = hourlyDataResult.rows;

    res.json(row);
  } catch (error) {
    console.error("Error fetching single day electricity stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;