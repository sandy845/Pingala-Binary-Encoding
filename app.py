import re
import sqlite3
from datetime import datetime

from flask import Flask, jsonify, render_template, request

from database.database import close_db, get_db, init_db

app = Flask(__name__, template_folder="templates", static_folder="static")
app.config["JSON_SORT_KEYS"] = False
init_db()


def error_response(message, status_code=400, code="validation_error"):
    return jsonify({"error": {"message": message, "code": code}}), status_code


def validate_n(value):
    if value is None or isinstance(value, bool):
        raise ValueError("Please enter an integer between 1 and 10.")

    if isinstance(value, str):
        cleaned = value.strip()
        if cleaned == "":
            raise ValueError("Please enter an integer between 1 and 10.")
        if not re.fullmatch(r"-?\d+", cleaned):
            raise ValueError("Please enter an integer between 1 and 10.")
        value = int(cleaned)

    if isinstance(value, float):
        raise ValueError("Please enter an integer between 1 and 10.")

    if not isinstance(value, int):
        raise ValueError("Please enter an integer between 1 and 10.")

    if not 1 <= value <= 10:
        raise ValueError("Please enter an integer between 1 and 10.")

    return value


def generate_patterns(n):
    total_combinations = 1 << n  # 1 << n is a bitwise left shift and is equivalent to 2^n for non-negative integer n.
    patterns = []

    for value in range(total_combinations):
        # Convert the decimal value into its binary form and zero-pad it to n digits.
        binary = format(value, f"0{n}b")

        # Map binary digits into the historical/educational short-long syllable interpretation.
        syllables = ["Short" if bit == "0" else "Long" for bit in binary]

        # Decimal conversion interprets the binary string in the conventional base-2 system.
        decimal_value = int(binary, 2)

        patterns.append(
            {
                "index": value,
                "binary": binary,
                "syllables": syllables,
                "decimal": decimal_value,
            }
        )

    return {
        "n": n,
        "total_combinations": total_combinations,
        "patterns": patterns,
    }


@app.teardown_appcontext
def close_db_after_request(exception=None):
    close_db(exception)


@app.route("/")
def index():
    return render_template("home.html")


@app.route("/generator")
def generator_page():
    return render_template("generator.html")


@app.route("/concepts")
def concepts_page():
    return render_template("concepts.html")


@app.route("/algorithm")
def algorithm_page():
    return render_template("algorithm.html")


@app.route("/test-cases")
def test_cases_page():
    return render_template("test_cases.html")


@app.route("/history")
def history_page():
    return render_template("history.html")


@app.route("/conclusion")
def conclusion_page():
    return render_template("conclusion.html")


@app.route("/api/generate", methods=["POST"])
def generate_patterns_api():
    try:
        payload = request.get_json(silent=True) or {}
        n = validate_n(payload.get("n"))
    except ValueError as exc:
        return error_response(str(exc), 400, "validation_error")
    except Exception:
        return error_response("Invalid request payload.", 400, "invalid_payload")

    try:
        result = generate_patterns(n)
        history_payload = {"n": n, "total_combinations": result["total_combinations"]}

        db = get_db()
        db.execute(
            "INSERT INTO generation_history (n, total_combinations, generated_at) VALUES (?, ?, ?)",
            (n, result["total_combinations"], datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
        )
        db.commit()
    except sqlite3.OperationalError:
        return error_response("The database is currently busy. Please try again.", 503, "database_busy")
    except sqlite3.Error:
        return error_response("A database error occurred while storing the generation history.", 500, "database_error")

    return jsonify(result)


@app.route("/api/history", methods=["GET", "POST", "DELETE"])
def history_endpoint():
    try:
        if request.method == "GET":
            db = get_db()
            rows = db.execute(
                "SELECT id, n, total_combinations, generated_at FROM generation_history ORDER BY id DESC"
            ).fetchall()
            history = [
                {
                    "id": row["id"],
                    "n": row["n"],
                    "total_combinations": row["total_combinations"],
                    "generated_at": row["generated_at"],
                }
                for row in rows
            ]
            return jsonify({"history": history})

        if request.method == "POST":
            payload = request.get_json(silent=True) or {}
            n = validate_n(payload.get("n"))
            total_combinations = payload.get("total_combinations")

            if not isinstance(total_combinations, int) or isinstance(total_combinations, bool):
                return error_response("Total combinations must be a valid integer.", 400, "validation_error")

            db = get_db()
            db.execute(
                "INSERT INTO generation_history (n, total_combinations, generated_at) VALUES (?, ?, ?)",
                (n, total_combinations, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")),
            )
            db.commit()
            return jsonify({"message": "Generation saved to history."})

        if request.method == "DELETE":
            db = get_db()
            db.execute("DELETE FROM generation_history")
            db.commit()
            return jsonify({"message": "History cleared successfully."})
    except ValueError as exc:
        return error_response(str(exc), 400, "validation_error")
    except sqlite3.OperationalError:
        return error_response("The database is currently busy. Please try again.", 503, "database_busy")
    except sqlite3.Error:
        return error_response("A database error occurred while handling history.", 500, "database_error")

    return error_response("Unsupported request method.", 405, "method_not_allowed")


@app.route("/api/test-cases", methods=["GET"])
def get_test_cases():
    test_cases = [
        {"id": 1, "input": 1, "expected": 2, "actual": None, "status": "pending"},
        {"id": 2, "input": 2, "expected": 4, "actual": None, "status": "pending"},
        {"id": 3, "input": 3, "expected": 8, "actual": None, "status": "pending"},
        {"id": 4, "input": 4, "expected": 16, "actual": None, "status": "pending"},
        {"id": 5, "input": 5, "expected": 32, "actual": None, "status": "pending"},
        {"id": 6, "input": 6, "expected": 64, "actual": None, "status": "pending"},
        {"id": 7, "input": 10, "expected": 1024, "actual": None, "status": "pending"},
        {"id": 8, "input": 0, "expected": "validation error", "actual": None, "status": "pending"},
        {"id": 9, "input": -1, "expected": "validation error", "actual": None, "status": "pending"},
        {"id": 10, "input": "abc", "expected": "validation error", "actual": None, "status": "pending"},
        {"id": 11, "input": "", "expected": "validation error", "actual": None, "status": "pending"},
        {"id": 12, "input": 3.5, "expected": "validation error", "actual": None, "status": "pending"},
        {"id": 13, "input": 11, "expected": "validation error", "actual": None, "status": "pending"},
    ]

    for case in test_cases:
        try:
            n = validate_n(case["input"])
            case["actual"] = (1 << n)
            case["status"] = "pass" if case["actual"] == case["expected"] else "fail"
        except ValueError:
            case["actual"] = "validation error"
            case["status"] = "pass" if case["expected"] == "validation error" else "fail"
    return jsonify({"test_cases": test_cases})


@app.errorhandler(404)
def page_not_found(error):
    return error_response("The requested resource was not found.", 404, "not_found")


@app.errorhandler(500)
def internal_server_error(error):
    return error_response("An unexpected server error occurred.", 500, "internal_error")


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="127.0.0.1", port=5000)
