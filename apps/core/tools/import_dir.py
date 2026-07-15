import csv, sqlite3, sys, os, glob

DB = os.path.expanduser('~/rangoons/core/rangoons.db')
FEEDS_DIR = os.path.expanduser('~/storage/shared/Download/rangoons-feeds')
MARKUP = float(os.environ.get('MARKUP','0.20'))

con = sqlite3.connect(DB)
cur = con.cursor()

def upsert(row):
    name        = (row.get('name') or '').strip()
    desc        = (row.get('description') or '').strip()
    img         = (row.get('image_url') or '').strip()
    cat         = (row.get('category') or '').strip()
    brand       = (row.get('brand') or '').strip()
    src         = (row.get('source') or '').strip()
    ext_id      = (row.get('external_id') or '').strip()
    src_url     = (row.get('source_url') or '').strip()
    price_pkr_s = (row.get('price_pkr') or '').strip()

    if not name or not price_pkr_s:
        return 0

    try:
        base_cents = int(round(float(price_pkr_s) * 100))
    except:
        return 0

    # Prefer dedupe by (source, external_id)
    pid = None
    if src and ext_id:
        cur.execute("SELECT id FROM products WHERE source=? AND external_id=?", (src, ext_id))
        r = cur.fetchone()
        if r:
            pid = r[0]

    if pid:
        cur.execute("""UPDATE products SET
            name=?, description=?, image_url=?, category=?, brand=?,
            base_price_cents=?, price_cents=?, source_url=?
            WHERE id=?""",
            (name, desc, img, cat, brand,
             base_cents, base_cents, src_url, pid))
    else:
        cur.execute("""INSERT INTO products
            (name, description, price_cents, stock, image_url,
             source, external_id, base_price_cents, category, brand, source_url)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (name, desc, base_cents, 999, img,
             src, ext_id, base_cents, cat, brand, src_url))
        pid = cur.lastrowid
        cur.execute("INSERT OR IGNORE INTO product_stats(product_id) VALUES (?)", (pid,))
    return 1

def import_one_csv(path):
    n=0; added=0
    try:
        with open(path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                added += upsert(row)
                n += 1
        con.commit()
        return (n, added, None)
    except Exception as e:
        con.rollback()
        return (n, added, str(e))

def count_products():
    cur.execute("SELECT COUNT(*) FROM products;")
    return cur.fetchone()[0]

def main():
    files = sorted(glob.glob(os.path.join(FEEDS_DIR, "*.csv")))
    if not files:
        print("No CSV files found in", FEEDS_DIR)
        print("TOTAL:", count_products())
        return
    total_before = count_products()
    print("Found", len(files), "CSV files")
    for i, path in enumerate(files, 1):
        n, added, err = import_one_csv(path)
        if err:
            print(f"[{i}/{len(files)}] {os.path.basename(path)}: ERROR {err}")
        else:
            print(f"[{i}/{len(files)}] {os.path.basename(path)}: rows={n}, upserted={added}")
    total_after = count_products()
    print("TOTAL:", total_after, "(Δ", total_after - total_before, ")")

if __name__ == "__main__":
    main()
