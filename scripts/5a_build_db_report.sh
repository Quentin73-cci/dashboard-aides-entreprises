sudo -u postgres psql -d dashboard -c "DROP TABLE IF EXISTS report;"
echo "DROP TABLE OK"
sudo -u postgres psql -d dashboard -f "sql/create_table_report.sql"
echo "CREATE TABLE OK"


datafolder="$(dirname "$(pwd)")"/data/reports/

sudo -u postgres psql -d dashboard -c "\copy report(code_section, nombre, montant, dep, reg) FROM '"$datafolder"reports-2020-04-24.csv' delimiter ',' csv header encoding 'UTF8';"