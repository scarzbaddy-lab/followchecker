import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { CarPart } from '@/lib/types';

export async function GET(req: NextRequest) {
  const partNumber = req.nextUrl.searchParams.get('partNumber')?.trim();

  if (!partNumber) {
    return NextResponse.json({ error: 'partNumber is required' }, { status: 400 });
  }

  const query = `
    SELECT id, part_number, name, description, manufacturer, compatible_models
    FROM car_parts
    WHERE part_number ILIKE $1
    LIMIT 1;
  `;

  const { rows } = await pool.query<CarPart>(query, [partNumber]);

  if (!rows.length) {
    return NextResponse.json({ error: 'No matching part found' }, { status: 404 });
  }

  return NextResponse.json({ part: rows[0] });
}
