# Unit Test Plan - `processWeatherData`

This test plan outlines minimal and focused unit tests for the `processWeatherData` function. The goal is to ensure critical functionality is verified without overcomplicating mocking or test structure.

---

## Test Cases

### UT-001: Skip Processing on Duplicate Upload

- **Description:** Should skip processing if file already uploaded
- **Expected Outcome:** Returns `false`; no database inserts

---

### UT-002: Insert Valid Weather Records

- **Description:** Should validate and insert valid weather records
- **Expected Outcome:** Inserts new `WeatherData` + `Upload`

---

### UT-003: Update Existing Weather Record

- **Description:** Should update existing weather record with same lat/lon/date
- **Expected Outcome:** Existing record is updated with new data

---

### UT-004: Skip Invalid Records

- **Description:** Should skip invalid records (Joi validation fails)
- **Expected Outcome:** Upload stats updated; no insert for invalid

---

### UT-005: Track Valid/Invalid Record Counts

- **Description:** Should correctly update `valid_records` and `invalid_records` count
- **Expected Outcome:** Upload entity is updated correctly

---

### UT-006: Logger Verification

- **Description:** Should call logger at various steps
- **Expected Outcome:** Logger functions (`info`, `warn`, `debug`) are called
