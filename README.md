# Piṅgala’s Chandaḥśāstra → Binary Encoding

This is a full-stack educational web application that explores the conceptual relationship between Piṅgala’s Chandaḥśāstra and modern binary encoding/combinatorial generation.

## Project Description

The project demonstrates a careful historical and computational comparison:

- **Historical concept**: Piṅgala’s enumeration of syllable patterns in Chandaḥśāstra is a combinatorial tradition rooted in Sanskrit prosody.
- **Modern interpretation**: The project uses a binary-like mapping of short and long syllables to 0 and 1 to illustrate how combinatorial generation can be translated into a modern computational view.

This is not claiming that ancient Indian scholars literally used modern computer binary notation. Instead, it presents a conceptual mapping and educational analogy.

## IKS Concept

Piṅgala’s tradition studies patterns of short and long syllables, particularly in the context of prosody and combinatorial enumeration. The project treats the sequence of syllables as an ordered structure and shows how the number of possible arrangements grows as $2^n$.

## Modern Computer Science Interpretation

The application maps:

- Short syllable → 0
- Long syllable → 1
- Sequence of syllables → binary string
- Pattern generation → combinatorial generation
- Total combinations → $2^n$

## Technology Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+)
- Backend: Python 3, Flask
- Database: SQLite via Python sqlite3
- API: JavaScript fetch() with Flask REST endpoints

## Features

- Interactive generator for values from 1 to 10
- Dynamic pattern generation using Python backend logic
- Binary, syllable, and decimal display for each pattern
- Search, filter, and sorting controls
- Statistics and exponential growth visualization
- Historical and modern comparison section
- Database-backed generation history
- Test case table with boundary and invalid inputs
- Dark/light mode
- Responsive design
- Loading, empty, error, and success states

## Architecture

- User → HTML/CSS/JS UI
- JavaScript fetch() → Flask REST API (local development)
- Flask API → Python algorithm and SQLite database
- SQLite → generation history data
- JSON response → interactive UI
- GitHub Pages build → static HTML and browser-local history

## Project Structure

```text
pingala-binary-iks/
├── .github/
│   └── workflows/
│       └── pages.yml
├── app.py
├── requirements.txt
├── README.md
├── scripts/
│   └── build_pages.py
├── database/
│   └── database.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── generator.js
│       ├── main.js
│       └── ui.js
└── templates/
    ├── base.html
    ├── home.html
    ├── generator.html
    ├── concepts.html
    ├── algorithm.html
    ├── test_cases.html
    ├── history.html
    └── conclusion.html
```

## Installation

### 1) Create a virtual environment

```bash
python -m venv venv
```

### 2) Activate the environment

On Windows:

```bash
venv\Scripts\activate
```

On macOS/Linux:

```bash
source venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
```

## How to Run

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000/
```

## Deploy to GitHub Pages

The GitHub Actions workflow builds the Flask templates into a static site and deploys it from the `main` branch. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Push to `main` or run the workflow manually from the Actions tab.

GitHub Pages does not run Flask or SQLite. The deployed site's generator runs in the browser, and its history is saved in that browser's local storage. The Flask API and database remain available when running the application locally.

To preview the Pages build locally, run:

```bash
python scripts/build_pages.py
```

Then serve the `_site` directory with any static file server. If the repository uses a custom base path, set `PAGES_BASE_PATH` before building.

## API Endpoints

### GET /
Serves the frontend dashboard.

### POST /api/generate
Input:

```json
{
  "n": 3
}
```

Output:

```json
{
  "n": 3,
  "total_combinations": 8,
  "patterns": [
    {
      "index": 0,
      "binary": "000",
      "syllables": ["Short", "Short", "Short"],
      "decimal": 0
    }
  ]
}
```

### GET /api/history
Returns generation history.

### POST /api/history
Stores a generation record.

### DELETE /api/history
Clears all history.

### GET /api/test-cases
Returns predefined test cases and validation checks.

## Database

The application uses SQLite and automatically initializes the database at startup. The schema is:

```sql
CREATE TABLE IF NOT EXISTS generation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    n INTEGER NOT NULL,
    total_combinations INTEGER NOT NULL,
    generated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

The project uses `PRAGMA journal_mode=WAL;` for better SQLite concurrency handling.

## Algorithm

The backend generates patterns from 0 to $(2^n - 1)$:

```text
INPUT n
FOR each number from 0 to (2^n - 1):
    Convert number to binary
    Pad binary representation to n digits
    Map 0 -> Short, 1 -> Long
    Compute decimal value
    Display/store pattern
END
```

## Why $2^n$?

For every new position in a pattern, there are two possibilities:

- Short = 0
- Long = 1

So for $n$ positions, the total number of possible patterns is:

$$2^n$$

This means the count grows exponentially.

## Complexity

- Time complexity: $O(n \times 2^n)$
- Space complexity: $O(n \times 2^n)$

This is because every pattern has $n$ digits and there are $2^n$ patterns total.

## Test Cases

The API includes boundary, invalid, and edge cases for:

- n = 1 to 10
- n = 0
- n = -1
- text input
- empty input
- decimal input
- n above maximum

## Limitations

- The total number of patterns grows exponentially.
- Large values of n generate many patterns.
- The maximum value is kept to 10 to maintain usability.
- This is a conceptual mapping, not an exact historical reconstruction of ancient binary notation.
- Historical interpretations may need specialist scholarship.

## Future Scope

- Improved visual comparison of pattern families
- More detailed historical annotation
- Export of generated patterns as CSV or JSON
- Additional educational content and animated tutorials

## Notes

This project is designed for educational demonstration and viva preparation. It clearly distinguishes between the historical concepts of Piṅgala’s prosody and the modern computational interpretation used for binary-style combinatorial generation.
