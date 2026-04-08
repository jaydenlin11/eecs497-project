# Test Descriptions

---

| **Test Name** | test_get_insights_calculates_stats_correctly |
|---|---|
| **Type (circle at least one)** | **Unit** |
| **Description** | Tests the `/insights/{child_id}` endpoint in `backend/main.py`. Verifies that the session aggregation logic correctly computes per-game statistics (total score, best score, session count, total duration) from raw session records. The DB is mocked with a fixed set of sessions for a single game to isolate the aggregation logic. |
| **Results that dictate success** | Given two sessions for the "math" game with scores `[3, 7]` and durations `[30, 45]`, the response must return `best_score=7`, `total_score=10`, `session_count=2`, and `total_duration=75`. Any deviation indicates a bug in the grouping or aggregation logic. |
| **Test assigned to** | Michael Ahn — created and responsible for running and verifying results. |

---

| **Test Name** | test_useGameSession_session_reporting |
|---|---|
| **Type (circle at least one)** | **Unit** |
| **Description** | Tests the `useGameSession` custom hook in `frontend/src/hooks/`. Verifies two behaviors: (1) that the hook correctly reports both score and duration to `POST /sessions` on unmount, and (2) that it skips reporting entirely when the session lasted under 5 seconds. Uses Vitest with fake timers and a mocked API client. |
| **Results that dictate success** | For a session lasting 30 simulated seconds where `setScore(5)` was called, `POST /sessions` must be called once with `score=5` and `duration_seconds=30`. For a session lasting 3 simulated seconds, `POST /sessions` must not be called at all. |
| **Test assigned to** | Michael Ahn — created and responsible for running and verifying results. |

---

| **Test Name** | test_register_session_insights_flow |
|---|---|
| **Type (circle at least one)** | **Integration** |
| **Description** | Tests the full parent → child → session → insights data flow across multiple backend endpoints. Uses FastAPI's `TestClient` with a real in-memory SQLite database. Steps: (1) `POST /register` to create a parent and child and obtain a JWT, (2) `POST /sessions` to record a game session for the child, (3) `GET /insights/{child_id}` to verify the session appears correctly in the aggregated stats. |
| **Results that dictate success** | The insights response must reflect the recorded session's score and duration. The child must be owned by the registering parent (ownership check passes). Any mismatch indicates a cross-endpoint data integrity or authorization bug. |
| **Test assigned to** | Michael Ahn — created and responsible for running and verifying results. |

---

| **Test Name** | test_screen_time_limit_enforcement_flow |
|---|---|
| **Type (circle at least one)** | **Integration** |
| **Description** | Tests the screen time enforcement logic across the settings and screen-time endpoints. Uses FastAPI's `TestClient` with a real in-memory SQLite database. Steps: (1) `POST /register`, (2) `PATCH /settings` to set `screen_time_limit=1` (1 minute), (3) `POST /sessions` with `duration_seconds=61`, (4) `GET /screen-time/{child_id}` to check enforcement flags. |
| **Results that dictate success** | The screen-time response must return `time_exceeded=true` and `remaining_seconds=0`. This confirms that the endpoint correctly reads the parent's limit from settings, sums today's session durations, and applies the cap — catching off-by-one errors or timezone issues in the `WHERE date(created_at) = date('now')` query. |
| **Test assigned to** | Michael Ahn — created and responsible for running and verifying results. |
