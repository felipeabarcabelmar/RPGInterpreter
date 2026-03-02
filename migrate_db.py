import sqlite3

def migrate():
    try:
        conn = sqlite3.connect('rpg_interpreter.db')
        cursor = conn.cursor()
        
        # Add category_id to rpg_files if it doesn't exist
        try:
            cursor.execute('ALTER TABLE rpg_files ADD COLUMN html_diagram TEXT')
            print("Successfully added html_diagram to rpg_files")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("Column html_diagram already exists")
            else:
                raise e
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
