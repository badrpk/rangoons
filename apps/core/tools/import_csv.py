import csv, sqlite3, sys, os, math
db = os.path.expanduser('~/rangoons/core/rangoons.db')
csv_path = sys.argv[1] if len(sys.argv)>1 else os.path.expanduser('~/storage/shared/Download/products.csv')
markup = float(os.environ.get('MARKUP', '0.20'))

con = sqlite3.connect(db)
cur = con.cursor()

def upsert(row):
    name        = row.get('name','').strip()
    desc        = row.get('description','').strip()
    img         = row.get('image_url','').strip()
    cat         = row.get('category','').strip()
    brand       = row.get('brand','').strip()
    src         = row.get('source','').strip()
    ext_id      = row.get('external_id','').strip()
    source_url  = row.get('source_url','').strip()
    price_pkr   = row.get('price_pkr','').strip()

    if not name or not price_pkr:
        return

    base_cents = int(round(float(price_pkr)*100))
    # try match on (source,external_id); fallback on (name,price)
    cur.execute("SELECT id FROM products WHERE source=? AND external_id=?",
                (src, ext_id))
    r = cur.fetchone()
    if r:
        pid = r[0]
        cur.execute("""UPDATE products SET
            name=?, description=?, image_url=?, category=?, brand=?,
            base_price_cents=?, price_cents=?, source_url=?
            WHERE id=?""",
            (name, desc, img, cat, brand,
             base_cents, base_cents, source_url, pid))
    else:
        cur.execute("""INSERT INTO products
            (name, description, price_cents, stock, image_url,
             source, external_id, base_price_cents, category, brand, source_url)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
            (name, desc, base_cents, 999, img,
             src, ext_id, base_cents, cat, brand, source_url))
        pid = cur.lastrowid
        cur.execute("INSERT OR IGNORE INTO product_stats(product_id) VALUES (?)", (pid,))

with open(csv_path, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        upsert(row)
con.commit()
print("✅ Import done from", csv_path)
