Codegen & generation quick guide (Patient slice)
1. Files added:
 - openapi/patient-service.yaml
 - generators/nestjs/patient-service/ (NestJS starter)
 - generators/fastapi/patient-service/ (FastAPI starter)
 - migrations/0001_create_patients.sql
 - frontend/ app pages & services
 - .github workflows for generation & CI
 - common services (encryption, event-bus, id-generation, audit)

2. Local dev (NestJS)
cd generators/nestjs/patient-service
npm install
# create a Postgres DB with URL in DATABASE_URL
# apply migrations:
psql $DATABASE_URL -f ../../migrations/0001_create_patients.sql
npm run start:dev

3. Local dev (FastAPI)
cd generators/fastapi/patient-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 3002

4. Frontend
cd frontend
# integrate generated src into your Next/Expo monorepo
# Run Next dev:
npm install
npm run dev

5. Run generation (if you add full_codegen.sh)
chmod +x tools/full_codegen.sh
./tools/full_codegen.sh

6. CI:
- Trigger .github/workflows/codegen-generate.yml manually to run codegen in Actions.
- CI tests run on pushes to codegen/full-stubs.

Security note: Replace APP_ENCRYPTION_KEY and other secrets with KMS & GitHub Secrets before production.
