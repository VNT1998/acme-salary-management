import argparse
import random
import sys
import time
from pathlib import Path
from typing import List, Tuple

# Ensure app is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import get_settings
from app.db.connection import get_db_connection, transaction
from app.db.migrations import init_db

DEPARTMENTS = {
    "Engineering": [
        "Software Engineer", "Senior Software Engineer", "Staff Engineer",
        "Frontend Engineer", "Backend Engineer", "DevOps Engineer",
        "Engineering Manager", "QA Engineer", "AI Engineer"
    ],
    "Product": [
        "Associate Product Manager", "Product Manager", "Senior Product Manager",
        "Director of Product", "Technical Product Manager"
    ],
    "Design": [
        "UI Designer", "UX Designer", "Product Designer",
        "Design Lead", "User Researcher"
    ],
    "Sales": [
        "Account Executive", "Senior Account Executive", "Sales Development Rep",
        "Sales Manager", "VP of Sales"
    ],
    "Marketing": [
        "Marketing Specialist", "Content Strategist", "Growth Marketer",
        "Product Marketing Manager", "Marketing Director"
    ],
    "Human Resources": [
        "HR Coordinator", "HR Generalist", "Senior HR Manager",
        "Talent Acquisition Lead", "People Operations Director"
    ],
    "Finance": [
        "Financial Analyst", "Senior Accountant", "Finance Manager",
        "Controller", "VP of Finance"
    ],
    "Legal": [
        "Legal Counsel", "Senior Corporate Counsel", "Compliance Officer"
    ],
    "Operations": [
        "Operations Specialist", "Operations Manager", "Director of Operations"
    ],
    "Customer Success": [
        "Customer Success Specialist", "Customer Success Manager",
        "Director of Customer Success", "Support Engineer"
    ]
}

COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Germany", "India",
    "Singapore", "Australia", "Japan", "France", "Netherlands"
]

FIRST_NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Betty", "Anthony", "Margaret", "Donald", "Sandra", "Mark", "Ashley",
    "Paul", "Kimberly", "Steven", "Emily", "Andrew", "Donna", "Kenneth", "Michelle",
    "Joshua", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Gregory", "Christine", "Frank", "Debra",
    "Alexander", "Rachel", "Raymond", "Catherine", "Patrick", "Carolyn", "Jack", "Janet",
    "Dennis", "Ruth", "Jerry", "Maria", "Tyler", "Heather", "Aaron", "Diane",
    "Jose", "Virginia", "Adam", "Julie", "Henry", "Joyce", "Nathan", "Victoria",
    "Douglas", "Olivia", "Zachary", "Kelly", "Peter", "Christina", "Kyle", "Lauren",
    "Walter", "Joan", "Ethan", "Evelyn", "Jeremy", "Judith", "Harold", "Megan",
    "Keith", "Cheryl", "Christian", "Andrea", "Roger", "Hannah", "Noah", "Martha",
    "Gerald", "Jacqueline", "Carl", "Frances", "Terry", "Ann", "Sean", "Gloria",
    "Austin", "Jean", "Arthur", "Kathryn", "Lawrence", "Alice", "Jesse", "Teresa",
    "Dylan", "Sara", "Bryan", "Janice", "Joe", "Doris", "Jordan", "Madison",
    "Billy", "Julia", "Albert", "Grace", "Bruce", "Judy", "Willie", "Abigail",
    "Gabriel", "Marie", "Logan", "Denise", "Alan", "Beverly", "Juan", "Amber",
    "Wayne", "Theresa", "Roy", "Marilyn", "Ralph", "Danielle", "Randy", "Diana",
    "Eugene", "Brittany", "Vincent", "Natalie", "Russell", "Sophia", "Louis", "Rose",
    "Philip", "Isabella", "Bobby", "Alexis", "Johnny", "Kayla", "Bradley", "Charlotte"
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
    "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
    "Mitchell", "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz",
    "Parker", "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales",
    "Murphy", "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson",
    "Bailey", "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson",
    "Watson", "Brooks", "Chavez", "Wood", "James", "Bennett", "Gray", "Mendoza",
    "Ruiz", "Hughes", "Price", "Alvarez", "Castillo", "Sanders", "Patel", "Myers",
    "Long", "Ross", "Foster", "Jimenez", "Powell", "Jenkins", "Perry", "Russell",
    "Sullivan", "Bell", "Coleman", "Butler", "Henderson", "Barnes", "Gonzales",
    "Fisher", "Vasquez", "Simmons", "Romero", "Jordan", "Patterson", "Alexander",
    "Hamilton", "Graham", "Reynolds", "Griffin", "Wallace", "Moreno", "West", "Cole",
    "Hayes", "Bryant", "Herrera", "Gibson", "Ellis", "Tran", "Medina", "Aguilar",
    "Stevens", "Murray", "Ford", "Castro", "Marshall", "Owens", "Harrison", "Fernandez",
    "McDonald", "Woods", "Washington", "Kennedy", "Wells", "Vargas", "Henry", "Chen"
]


def generate_seed_dataset(count: int = 10000, seed: int = 42) -> Tuple[List[tuple], List[tuple]]:
    """Generate deterministic employee and initial salary history records."""
    rng = random.Random(seed)
    emp_rows = []
    history_rows = []

    dept_keys = list(DEPARTMENTS.keys())
    # Deterministic base dates between 2022-01-01 and 2026-01-01
    start_time = time.time()
    now_str = "2026-10-17T00:00:00Z"

    for i in range(1, count + 1):
        emp_id = i
        emp_code = f"EMP-{1000 + i}"
        first_name = rng.choice(FIRST_NAMES)
        last_name = rng.choice(LAST_NAMES)
        full_name = f"{first_name} {last_name}"
        # Guarantee unique email across all 10,000 records
        email = f"{first_name.lower()}.{last_name.lower()}.{i}@acme.test"

        dept = rng.choice(dept_keys)
        title = rng.choice(DEPARTMENTS[dept])
        country = rng.choice(COUNTRIES)

        # Realistic salary distributions in USD cents:
        # Tiered by department/title seniority
        base_salary_dollars = rng.randint(45, 185) * 1000 + rng.choice([0, 250, 500, 750])
        salary_cents = base_salary_dollars * 100

        # Effective date within past 3 years
        year = rng.randint(2023, 2026)
        month = rng.randint(1, 12)
        day = rng.randint(1, 28)
        effective_date = f"{year:04d}-{month:02d}-{day:02d}"

        emp_rows.append((
            emp_id, emp_code, full_name, email, dept, title, country,
            salary_cents, now_str, now_str
        ))

        # Initial salary history has NULL previous_salary_cents
        history_rows.append((
            emp_id, None, salary_cents, effective_date, now_str
        ))

    return emp_rows, history_rows


def run_seed(conn, count: int = 10000, reset: bool = False, force: bool = False) -> int:
    init_db(conn)

    cursor = conn.execute("SELECT COUNT(*) FROM employees")
    existing_count = cursor.fetchone()[0]

    if existing_count > 0:
        if not reset and not force:
            print(f"Notice: Database already contains {existing_count} employees. Seed skipped (use --reset to overwrite).")
            return existing_count
        elif reset:
            print(f"Resetting existing database ({existing_count} employees)...")
            with transaction(conn):
                conn.execute("DELETE FROM salary_history;")
                conn.execute("DELETE FROM employees;")

    print(f"Generating deterministic dataset for {count} employees...")
    t0 = time.time()
    emp_rows, history_rows = generate_seed_dataset(count=count, seed=42)
    t_gen = time.time() - t0
    print(f"Dataset generated in {t_gen:.2f}s. Inserting into SQLite...")

    t1 = time.time()
    with transaction(conn):
        conn.executemany(
            """
            INSERT INTO employees (
                id, employee_code, full_name, email, department, job_title,
                country, current_salary_cents, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            emp_rows
        )

        conn.executemany(
            """
            INSERT INTO salary_history (
                employee_id, previous_salary_cents, new_salary_cents,
                effective_date, recorded_at
            )
            VALUES (?, ?, ?, ?, ?)
            """,
            history_rows
        )
    t_ins = time.time() - t1
    print(f"Successfully inserted {count} employees and {count} initial salary history records in {t_ins:.2f}s.")

    # Verification
    total_emp = conn.execute("SELECT COUNT(*) FROM employees").fetchone()[0]
    total_hist = conn.execute("SELECT COUNT(*) FROM salary_history").fetchone()[0]
    unique_codes = conn.execute("SELECT COUNT(DISTINCT employee_code) FROM employees").fetchone()[0]
    unique_emails = conn.execute("SELECT COUNT(DISTINCT email) FROM employees").fetchone()[0]

    print(f"Verification: {total_emp} employees, {total_hist} history records.")
    assert total_emp == count, f"Expected {count} employees, got {total_emp}"
    assert total_hist == count, f"Expected {count} history records, got {total_hist}"
    assert unique_codes == count, "Duplicate employee codes detected!"
    assert unique_emails == count, "Duplicate employee emails detected!"
    return total_emp


def main():
    parser = argparse.ArgumentParser(description="Seed ACME database with 10,000 deterministic employee records.")
    parser.add_argument("--count", type=int, default=10000, help="Number of employee records to seed (default: 10000)")
    parser.add_argument("--reset", action="store_true", help="Clear existing employees and reseed")
    parser.add_argument("--force", action="store_true", help="Force seeding")
    args = parser.parse_args()

    settings = get_settings()
    with get_db_connection(settings.database_file_path) as conn:
        run_seed(conn, count=args.count, reset=args.reset, force=args.force)


if __name__ == "__main__":
    main()
