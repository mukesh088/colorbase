import { query } from "./pool";

export async function checkRateLimit(userId: string, route: string, maxPerMinute: number) {
  const result = await query<{ count: number }>(
    `INSERT INTO api_usage (user_id, route, window_start, count)
     VALUES ($1, $2, date_trunc('minute', NOW()), 1)
     ON CONFLICT (user_id, route, window_start)
     DO UPDATE SET count = api_usage.count + 1
     RETURNING count`,
    [userId, route]
  );
  const count = result.rows[0]?.count ?? 1;
  return count <= maxPerMinute;
}
