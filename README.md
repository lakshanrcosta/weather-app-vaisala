# ☁️ Vaisala Weather Processor – Serverless Architecture

This README documents the AWS Serverless portion of the Vaisala Weather App — an event-driven architecture built to handle file uploads, JSON parsing, and database record creation with AWS Lambda and S3.

---

## 📐 Project Architecture

The project is split into two parts:

- **Serverless Lambda Processor** – triggered by S3 upload events
- **Node.js REST API** – for querying weather data and user interaction

A shared module (`/shared`) contains **common entities and types** used by both the Lambda processor and the Express API to ensure consistency and DRY structure.

```
root/
├── api/             # REST API
├── serverless/      # Lambda processor
├── shared/          # TypeORM entities and types shared across both
```

---

## 🚀 Current Features

- 📤 Upload weather JSON to a configured S3 bucket
- 🔔 S3 triggers Lambda on new file creation
- 🧪 Lambda processes the JSON file and validates it against a schema
- 🧾 Valid records are stored in a PostgreSQL RDS database
- 🧪 If `isLambdaDemoMode` is enabled, it auto-creates a demo user
- 🗂️ Files must follow the format: `<uuid>_<user_id>.json`
- 🪄 Files are moved to a `/processed` folder after processing

---

## 🧰 Tech Stack

| Layer         | Tech                                      |
|---------------|-------------------------------------------|
| Serverless    | AWS Lambda, S3 Events, Serverless Framework |
| Processing    | Node.js, TypeScript, Class-Validator       |
| Database      | PostgreSQL (AWS RDS)                      |
| Shared Models | TypeORM + Shared module across API + Lambda |
| Dev Tools     | serverless-offline, dotenv, jest          |

---

## ⚙️ Serverless Event Flow

- Uploading a file to S3 triggers the `processUpload` Lambda function
- Lambda fetches the file, validates the schema
- Records are inserted to the database
- File is renamed and moved if successfully processed

### 🔁 Hybrid Architecture

This is a **hybrid design**:

- Serverless Lambda handles async file processing (event-driven)
- REST API is used for real-time data querying and user interaction

---

## 🧪 Local Testing & Deployment

We used `serverless-offline` and `serverless-offline-s3` to simulate:

- Lambda invocations
- S3 events

This allowed testing the event flow completely without deploying to AWS.

---

## 🛑 Why This Is Paused (For Now)

Starting from Serverless v4, Docker support was removed from `serverless offline`, and the framework requires a commercial license to run custom containers or plugin configurations.

Due to this limitation, we decided to:

- ✅ Keep Lambda for file processing only
- 🕒 Pause full deployment and focus on local + API hybrid

---

## 🧭 Setup Instructions

### 📦 Clone and install

```bash
git clone https://github.com/lakshanrcosta/weather-app-vaisala.git
cd vaisala-weather-app
npm install
```

### 📦 Install dependencies individually

```bash
cd shared
npm install
npm run build

cd ../serverless
npm install
```

### 🚀 Deploy to AWS

```bash
cd serverless
npx serverless deploy
```

---

## 🔐 .env Configuration (serverless/.env)

```env
DB_HOST=<your-rds-endpoint>
DB_PORT=5432
DB_USERNAME=<admin>
DB_PASSWORD=<password>
DB_NAME=weather_db
IS_LAMBDA_DEMO_MODE=true
AWS_REGION=us-east-1
S3_BUCKET_NAME=vaisala-weather-uploads
```

---

## 🪣 AWS S3 Setup (Trigger Lambda)

1. Create an S3 bucket (e.g. `vaisala-weather-uploads`)
2. Enable event notification for `PUT` actions
3. Link it to your `processUpload` Lambda function
4. Grant S3 permissions to your Lambda IAM role:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObject",
    "s3:ListBucket",
    "s3:DeleteObject"
  ],
  "Resource": [
    "arn:aws:s3:::vaisala-weather-uploads",
    "arn:aws:s3:::vaisala-weather-uploads/*"
  ]
}
```

5. Optionally use lifecycle rules to auto-delete `/processed` files after X days.

---

## 🛢️ AWS RDS PostgreSQL Setup

1. Go to AWS RDS → Create DB → PostgreSQL
2. Set DB name, username, and password
3. Enable public access OR use VPC + subnet setup
4. Ensure your Lambda is in the **same VPC** and has access to RDS
5. Add DB credentials to `serverless/.env`

---

## 🧪 Running Tests

In the serverless project:

```bash
cd serverless
npm test
```

Or for offline simulation:

```bash
serverless offline --stage dev
```

---

## 🤝 Final Note

This was a challenging but rewarding setup — involving cross-service orchestration, shared modules, local/offline simulation, AWS deployment, and S3 event handling. Although serverless support limitations paused full deployment, this hybrid architecture is future-proof and ready to scale.

Thanks for reviewing this — and thank you, for this exercise! ❤️. 🙌
