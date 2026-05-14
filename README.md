# Car Part OCR + PostgreSQL Search (Next.js)

This app uses:
- Camera capture in browser (`getUserMedia`)
- OCR via `tesseract.js`
- Next.js API route to search PostgreSQL

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set database connection:
   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/partsdb"
   ```
3. Create table:
   ```sql
   CREATE TABLE IF NOT EXISTS car_parts (
     id SERIAL PRIMARY KEY,
     part_number TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     description TEXT,
     manufacturer TEXT,
     compatible_models TEXT[] DEFAULT '{}'
   );
   ```
4. Run dev server:
   ```bash
   npm run dev
   ```

Then open `http://localhost:3000` and use **Start Camera** → **Capture + OCR** → **Search PostgreSQL**.
