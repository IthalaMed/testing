from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
import hashlib, base64, uuid, json
from typing import List, Optional

router = APIRouter(tags=["patients"])

class Address(BaseModel):
    street: Optional[str]
    suburb: Optional[str]
    city: Optional[str]
    province: Optional[str]
    postalCode: Optional[str]
    country: Optional[str]

class EmergencyContact(BaseModel):
    name: str
    relationship: str
    phone: str

class PatientRegister(BaseModel):
    firstName: str
    lastName: str
    idNumber: str = Field(..., regex=r'^\d{13}$')
    dateOfBirth: str
    gender: Optional[str]
    phoneNumber: str
    email: Optional[str]
    address: Optional[Address]
    medicalAid: Optional[dict]
    emergencyContacts: List[EmergencyContact]
    relationshipToMain: Optional[str]
    otpChannel: str

class PatientSummary(BaseModel):
    id: str
    patientNumber: str
    firstName: str
    lastName: str
    dateOfBirth: str
    phoneNumber: str
    email: Optional[str]
    status: Optional[str]

@router.post("/patients/register", status_code=status.HTTP_201_CREATED)
async def register(payload: PatientRegister):
    # Validate SA ID using Luhn
    def validate_sa_id(idn: str) -> bool:
        if not idn.isdigit() or len(idn) != 13:
            return False
        digits = list(map(int, idn))
        checksum = digits.pop()
        s = 0
        for i, d in enumerate(digits):
            if i % 2 == 1:
                d *= 2
                if d > 9:
                    d -= 9
            s += d
        calc = (10 - (s % 10)) % 10
        return calc == checksum
    if not validate_sa_id(payload.idNumber):
        raise HTTPException(status_code=400, detail="Invalid SA ID")
    # Create temp registration: In this starter, encode payload as base64 in tempRegistrationId
    temp = base64.b64encode(json.dumps(payload.dict()).encode('utf8')).decode('utf8')
    # In real system: persist to DB, send OTP via Twilio
    return {"tempRegistrationId": temp, "message": "OTP sent (simulated)"}

@router.post("/patients/verify-otp", status_code=status.HTTP_201_CREATED)
async def verify_otp(body: dict):
    temp_id = body.get("tempRegistrationId")
    otp = body.get("otp")
    if not temp_id or not otp:
        raise HTTPException(status_code=400, detail="Missing fields")
    try:
        payload_json = base64.b64decode(temp_id).decode('utf8')
        payload = json.loads(payload_json)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid tempRegistrationId")
    # finalize registration (simplified)
    # compute id hash
    id_hash = hashlib.sha256(payload['idNumber'].strip().lower().encode()).hexdigest()
    # generate patientNumber (simple deterministic for demo)
    patient_num = f"PT{2025}{str(uuid.uuid4())[:6].upper()}"
    patient = {
        "id": str(uuid.uuid4()),
        "patientNumber": patient_num,
        "firstName": payload['firstName'],
        "lastName": payload['lastName'],
        "dateOfBirth": payload['dateOfBirth'],
        "phoneNumber": payload['phoneNumber'],
        "email": payload.get('email'),
        "status": "active"
    }
    return {"patient": patient, "accessToken": "SIMULATED_TOKEN"}

@router.get("/patients/{patient_id}", response_model=PatientSummary)
async def get_patient(patient_id: str):
    # Demo response
    return {
        "id": patient_id,
        "patientNumber": "PT202500001",
        "firstName": "Thandi",
        "lastName": "Mbatha",
        "dateOfBirth": "1985-01-15",
        "phoneNumber": "+27821234567",
        "email": "thandi@example.com",
        "status": "active"
    }
