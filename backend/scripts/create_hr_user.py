import argparse
import getpass
import sys
from pathlib import Path

# Add backend directory to sys.path so app modules can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.connection import get_db_connection, transaction
from app.db.migrations import init_db
from app.repositories.hr_user_repo import create_hr_user
from app.schemas.common import normalize_email


def main():
    parser = argparse.ArgumentParser(description="Bootstrap an HR manager user account.")
    parser.add_argument("--email", help="HR manager email address")
    parser.add_argument("--password", help="HR manager password")
    args = parser.parse_args()

    email = args.email
    if not email:
        email = input("Enter HR email: ").strip()

    try:
        email = normalize_email(email)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

    password = args.password
    if not password:
        password = getpass.getpass("Enter HR password: ")
        confirm_password = getpass.getpass("Confirm HR password: ")
        if password != confirm_password:
            print("Error: Passwords do not match.", file=sys.stderr)
            sys.exit(1)

    if len(password) < 8:
        print("Error: Password must be at least 8 characters long.", file=sys.stderr)
        sys.exit(1)

    hashed = hash_password(password)

    settings = get_settings()
    with get_db_connection(settings.database_file_path) as conn:
        init_db(conn)
        with transaction(conn):
            try:
                user = create_hr_user(conn, email, hashed)
                print(f"Success: Created HR user '{user['email']}' (ID: {user['id']}).")
            except Exception as e:
                print(f"Error creating user: {e}", file=sys.stderr)
                sys.exit(1)


if __name__ == "__main__":
    main()
