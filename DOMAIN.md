# Health Telematix — Domain Knowledge & Business Requirements

This file holds all domain knowledge, business rules, and product requirements for the Health Telematix Clinic Portal. It is separate from `CLAUDE.md`, which covers only coding standards and technical guidance.

Sources: Health Telematix Platform Requirements (March 2026) · APCM & RPM Billing Documentation (2025–2026)

---

## 1. Platform Overview

Health Telematix is a cloud-based care management and remote patient monitoring (RPM) platform for value-based chronic disease management. It serves as a centralized hub connecting patients, clinicians, virtual nurses, digital health navigators, and administrators.

**Focus conditions:** Obesity · Hypertension · Type II Diabetes · Heart Failure · Atrial Fibrillation

**Design sprint:** March–May 2026 with MindBowser ($10,000 engagement). Goal: validate UX across all five user roles, define technical architecture, produce clickable prototype.

---

## 2. User Roles & Access

| Role                                  | Key Responsibilities                                                                                    | Channels                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Patient**                           | View care plan, communicate with care team, report symptoms, engage with health coaching                | Mobile app, iMessage/RCS/WhatsApp, NLP phone agent, web portal              |
| **Clinician (MD/DO)**                 | Clinical assessments, care plan creation & refinement, order management, care team communication        | Web dashboard, mobile app, in-app notifications                             |
| **Virtual Nurse (RN)**                | Patient triage, enrollment, RPM data review, intervention documentation, monthly reporting              | Web dashboard with RPM data feed, communication tools, documentation module |
| **Digital Health Navigator (MA/DHN)** | Patient enrollment, device setup & management, medication reconciliation, patient communication         | Web dashboard, device management portal, communication tools                |
| **Administrator (Clinic Admin)**      | User management, population health dashboards, quality metrics, billing oversight, system configuration | Admin console, analytics dashboard, reporting module                        |

---

## 3. Clinical Conditions & Care Plans

| Condition               | Care Plan Includes                                                                                             | Key Quality Metrics                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Obesity**             | Weight monitoring, nutrition counseling, activity goals, behavioral health screening, GLP-1 management         | BMI tracking, weight loss %, engagement rates, medication adherence                         |
| **Hypertension**        | BP monitoring (RPM), medication management, lifestyle modification, sodium intake counseling                   | BP control rates (<140/90), medication adherence, ER visit reduction                        |
| **Type II Diabetes**    | CGM data review (Dexcom/FreeStyle Libre), A1c tracking, medication titration, foot care, eye exam reminders    | A1c <7%, hypoglycemia events, time in range, medication adherence                           |
| **Heart Failure**       | Daily weight monitoring, fluid intake tracking, symptom assessment, medication optimization, activity guidance | 30-day readmission rates, weight variance alerts, NYHA class tracking, medication adherence |
| **Atrial Fibrillation** | Heart rate monitoring, anticoagulation management, symptom logging, rhythm control assessment                  | Stroke risk (CHA2DS2-VASc), anticoagulation compliance, ER/hospitalization rates            |

**Patient data requirements:**

- **Problem List** — Imported from EMR/HIE. Auto-updated and reconcilable by clinical staff.
- **Medication List** — Platform is the single source of truth. Reconciliation workflow for DHN/RN.
- **Care Plan** — Active, viewable per patient tied to their conditions. Accessible via mobile, web, or NLP agent.

---

## 4. RPM Supported Devices

| Device              | Data Captured                                            | Conditions                        | Transmission                               |
| ------------------- | -------------------------------------------------------- | --------------------------------- | ------------------------------------------ |
| Blood Pressure Cuff | Systolic/diastolic BP, heart rate, timestamp             | Hypertension, Heart Failure, AFib | Bluetooth → mobile app or cellular gateway |
| Dexcom CGM          | Continuous glucose, trend data, time in range, alerts    | Type II Diabetes                  | API (Dexcom Clarity)                       |
| FreeStyle Libre CGM | Glucose readings, AGP reports, trend arrows, sensor data | Type II Diabetes                  | API (LibreView)                            |
| Weight Scale        | Body weight, BMI calculation, timestamp                  | Obesity, Heart Failure            | Bluetooth → mobile app or cellular gateway |

**RN RPM data feed must:**

- Display all device readings with timestamps and trend indicators
- Allow RN to document interventions, care plan changes, and clinical notes in-feed
- Flag abnormal readings based on configurable per-condition thresholds
- Track hospitalizations, ER visits, and external data
- Maintain full audit trail on all documentation

**Monthly reports generated automatically:**

1. **Care Management Monthly Summary** — All interventions, care plan changes, hospitalizations, and data from any source; attributed to the provider.
2. **RPM Auditable Monthly Report** — Compliance-ready; covers all device readings, interventions, visits, and communications. Must meet CMS RPM billing requirements.

---

## 5. Patient Access Channels

- **NLP Phone Agent** — AI voice agent for triage, symptom reporting, basic inquiries. RN always in the loop. Escalates to live staff. All calls recorded, transcribed, and documented.
- **Mobile App** — Care plan, medications, appointments, RPM device sync (Bluetooth), secure messaging, educational content.
- **Text Messaging** — iMessage, Android RCS, WhatsApp. Bidirectional with care team. Routed to RN/DHN. Physician can join as needed.
- **AI Transparency Rule** — Platform must always inform the patient that AI is being used BEFORE any AI-assisted encounter, across all channels. Consent and disclosure must be documented.

---

## 6. Interoperability & Data Standards

- **EMR** — Epic (bidirectional FHIR); also Cerner/Oracle Health, athenahealth, eClinicalWorks, Allscripts, MEDITECH, NextGen. Supports ADT feeds, CCD/CCDA, lab results, problem lists, medication lists.
- **HIE** — Carequality, CommonWell, eHealth Exchange.
- **CMS Standards** — CMS-9115-F compliance: Patient Access API (FHIR R4), Provider Directory API, Payer-to-Payer Data Exchange, Prior Authorization API readiness.
- **SMART on FHIR** — OAuth 2.0. CDS Hooks support. Third-party app integration.

---

## 7. Compliance & Security

- **HIPAA** — Full compliance: encryption at rest and in transit, access controls.
- **SOC 2 Type II** — Target certification for enterprise hospital partnerships.
- **AI Transparency** — Patient notification + consent for all AI-assisted interactions, documented in record.
- **Audit Trails** — Complete logging of all clinical actions, data access, and communications.
- **RPM Billing Compliance** — Monthly reports structured to CMS RPM requirements (CPT 99453, 99454, 99457, 99458).

---

## 8. APCM Billing (Advanced Primary Care Management)

> Available from January 1, 2025. Monthly bundled payment combining CCM, PCM, TCM, and communication technology-based services.

### 8.1 HCPCS Codes

| Code      | Patient Profile                                                                                       | ~2026 Rate  | Key Requirement                                |
| --------- | ----------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------- |
| **G0556** | Any Medicare beneficiary (1+ chronic condition or none)                                               | ~$15/month  | Clinical staff under physician/NPP supervision |
| **G0557** | 2+ chronic conditions expected to last 12+ months or until death, placing patient at significant risk | ~$50/month  | All G0556 requirements                         |
| **G0558** | Qualified Medicare Beneficiary (QMB) with 2+ complex chronic conditions                               | ~$117/month | All G0556 requirements                         |

Add-on codes: G0568 (Initial CoCM month ~$162), G0569 (Subsequent CoCM months), G0570 (BHI add-on).

### 8.2 Who Can Bill

- Physicians, NPs, PAs, Clinical Nurse Specialists (CNS)
- Must be responsible for ALL primary care for the patient
- Only **one provider** can bill APCM per patient per calendar month
- Primarily: internal medicine, family medicine, geriatrics, pediatrics
- Cannot bill APCM + CCM (99490, 99491, 99439), PCM (99424–99427), or TCM (99495, 99496) in the same month
- **APCM CAN be billed alongside RPM in the same month**

### 8.3 Patient Eligibility

- Medicare beneficiary with ≥1 chronic condition (G0556) or ≥2 complex chronic conditions (G0557/G0558)
- G0558: must be enrolled in the QMB program
- Written or verbal consent required (once; not monthly)
- Not a time-based code — NO minimum time threshold

### 8.4 Required 13 Documentation Elements

1. **Patient Consent** — Written or verbal; documented once. Inform patient: only 1 provider bills APCM/month; patient may stop at any time; cost sharing may apply.
2. **Initiating Visit** — Required for new patients (not seen within 3 years). Not required if CCM/PCM/APCM billed in prior 12 months. AWV qualifies.
3. **24/7 Access** — Urgent contact available; real-time chart access for on-call providers; patient can schedule successive appointments; alternative delivery options available.
4. **Comprehensive Care Management** — Systemic assessments (medical + psychosocial), PHQ9, preventive service tracking, medication reconciliation, lifestyle guidance.
5. **Electronic Care Plan** — Individualized, in EHR, accessible inside and outside billing practice, updated by care team, copy provided to patient/caregiver.
6. **Care Transitions Coordination** — Referrals, discharge follow-up within 7 days, timely electronic health information exchange.
7. **Community-Based Coordination** — Communication with home/community services; psychosocial strengths, deficits, goals, and preferences documented.
8. **Enhanced Communication** — Secure messaging, email, patient portal; remote evaluation of pre-recorded info; patient-initiated digital communications supported.
9. **Population Management** — Analysis to identify care gaps; risk stratification using diagnoses, claims, or electronic data.
10. **Performance Measurement** — Quality, cost of care, meaningful use of CEHRT. Must report Value in Primary Care MIPS MVP or participate in MSSP ACO/REACH ACO/Making Care Primary/Primary Care First.
    11–13. **Communication Technology-Based Services** — Virtual check-ins, remote evaluation of patient-submitted info, interprofessional telephone/internet/EHR consultations.

### 8.5 Monthly APCM Note Must Include

- Patient name, DOB, Medicare ID
- Date of service (month-end or date threshold met)
- Date of original consent
- HCPCS code selected + clinical justification for code level
- ICD-10-CM diagnosis code(s)
- Which of the 13 elements were addressed this month
- Summary of patient interactions (calls, portal messages, care coordination)
- Medication changes, referrals, transitions of care
- Care plan updates (if applicable)
- Billing provider name, credentials, NPI
- For G0557/G0558: document that chronic conditions are expected to last 12+ months AND place patient at significant risk of death, acute exacerbation, or functional decline

---

## 9. RPM Billing (Remote Patient Monitoring)

> Monitors physiologic data collected outside clinical settings. Appropriate for both chronic and acute conditions.

### 9.1 CPT Codes

| Code      | Description                                                          | Threshold                | Who Bills                                               |
| --------- | -------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| **99453** | Initial setup + patient education on equipment                       | Once per episode of care | Physician or clinical staff                             |
| **99445** | Device supply — 2–15 days of data in 30-day period                   | 2–15 days transmission   | Physician or clinical staff                             |
| **99454** | Device supply — 16+ days of data in 30-day period                    | 16+ days transmission    | Physician or clinical staff                             |
| **99091** | Physician collection/interpretation of physiologic data              | 30+ min/month            | Physician or NPP only (cannot delegate)                 |
| **99470** | Treatment management: first 10 min/month + interactive communication | 10–20 min/month          | Physician, NPP, or clinical staff (general supervision) |
| **99457** | Treatment management: first 20 min/month + interactive communication | 20+ min/month            | Physician, NPP, or clinical staff (general supervision) |
| **99458** | Treatment management: each additional 20 min beyond 99457            | Each additional 20 min   | Physician, NPP, or clinical staff (general supervision) |

Only **one provider** can bill RPM per patient in any 30-day period.

### 9.2 Patient Eligibility

- Established patient (RPM should start during a face-to-face visit for new patients)
- Acute or chronic condition requiring monitoring
- Must be residing at home — Medicare does NOT cover RPM in nursing facilities, SNFs, or long-term care centers
- Documented consent in chart
- Device must transmit data **automatically** — manual patient entry does NOT qualify for 99454

### 9.3 Provider Note Requirements

**99453 (Setup):** Date of service, patient name/ID, diagnosis codes, device type, documentation that patient education was completed, provider name/credentials.

**99454 (Device Supply):** Date range of 30-day period, confirmation of 16+ days of data transmission, type of transmission (automatic/programmed alert), device type, physiologic parameter, ICD-10-CM codes.

**99470/99457/99458 (Treatment Management):** Date(s) of service, total time spent (review + communication), documentation that time exceeded threshold, documentation of interactive communication with patient/caregiver (phone or video — asynchronous messaging alone is insufficient), data review summary and clinical decisions, medication changes/care plan updates/referrals, ICD-10-CM codes, provider name/credentials.

**99091 (Physician Interpretation):** Date(s), documentation of 30+ minutes of physician/NPP time, clinical interpretation of data, treatment plan changes, ICD-10-CM codes.

### 9.4 Billing Rules

- 99453 billed only **once per episode of care** (not monthly)
- 99454 requires 16+ days of data per 30-day period (this threshold does NOT apply to 99457/99458)
- 99457 requires interactive communication — asynchronous messaging alone is insufficient
- 99457/99458 can be furnished by clinical staff under **general supervision**
- 99091 requires physician or NPP time — **cannot be delegated**
- RPM **cannot** be billed alongside remote therapeutic monitoring (RTM) codes 98975–98981 for the same condition in the same period
- RPM **can** be billed alongside APCM in the same calendar month

### 9.5 Co-Billing APCM + RPM

- Both may be billed together in the same month for the same patient
- Documentation must clearly separate services under each program
- Do NOT double-count time — RPM minutes (99457/99458) cannot also count toward other time-based care management codes
- APCM billing provider and RPM billing provider can be different, but only one provider can bill each per month

---

## 10. BHI Billing (Behavioral Health Integration)

> Psychiatric Collaborative Care Management (COCM/CoCM). Stacks on top of APCM — billed in addition to APCM in the same month. Confirmed in May 8, 2026 call with Dr. Shah.

### 10.1 HCPCS Codes

| Code      | Description                            | Requirement                                                        |
| --------- | -------------------------------------- | ------------------------------------------------------------------ |
| **G0568** | Initial Psychiatric CoCM — first month | Requires ≥1 hour of psychiatric consultant time in the first month |
| **G0569** | Subsequent Psychiatric CoCM months     | NOT time-based; billed monthly as long as program continues        |
| **G0570** | BHI add-on                             | Billed alongside APCM; same month                                  |

### 10.2 Patient Eligibility

- APCM patient with a comorbid psychiatric condition: depression, anxiety, or other psychiatric disorder
- ~30% of APCM patients are estimated to qualify
- Must have 2+ chronic medical conditions (same requirement as G0557/G0558 APCM tier)
- Patient can be enrolled in APCM + RPM + BHI simultaneously

### 10.3 Required Care Team

- **Psychiatric Consultant** — one psychiatrist who evaluates the patient at least once (required for G0568)
- **Behavioral Health Care Manager** — can be the Digital Health Navigator (DHN), a licensed social worker, or a psychiatric nurse; tracks patients in registry, coordinates mental health care with treating physician, documents interventions

### 10.4 Care Plan Structure

- Two additional condition-specific care plans: **Depression** and **Anxiety**
- Cadence: weekly or bi-weekly check-ins by DHN (as behavioral health coach)
- DHN documents all conversations and interventions
- If patient is headed wrong direction: escalate to psychiatric consultant or recommend medication change

### 10.5 Billing Rules

- G0568 billed once (first month); G0569 billed every subsequent month
- G0569 is NOT time-based — no minimum time threshold
- CAN be billed alongside APCM and RPM in the same calendar month
- Supervised by physician/NPP; DHN performs care management under supervision
- Do NOT double-count time with APCM or RPM time-based codes

---

## 11. Program Stacking & Patient Enrollment Model

> Source: May 8, 2026 call with Dr. Shah Khan MD.

### 11.1 Program Stacking Rules

Every enrolled patient starts with **APCM** as the base program. Additional programs layer on top:

| Layer    | Program  | Eligible Population                                                    | Approx. %        |
| -------- | -------- | ---------------------------------------------------------------------- | ---------------- |
| Base     | **APCM** | All enrolled Medicare patients                                         | 100% of enrolled |
| Add-on 1 | **RPM**  | APCM patients with a chronic condition requiring device monitoring     | ~60% of APCM     |
| Add-on 2 | **BHI**  | APCM patients with comorbid psychiatric condition (depression/anxiety) | ~30% of APCM     |

- A single patient can be simultaneously enrolled in **APCM + RPM + BHI**
- APCM is the foundational program; RPM and BHI stack on top
- Non-Medicare patients may be enrolled in RPM only (no APCM)

### 11.2 Dashboard Model Numbers (Mock Data Baseline)

| Metric                     | Value                          |
| -------------------------- | ------------------------------ |
| Total patients per clinic  | ~10,000                        |
| Medicare-eligible patients | ~3,000                         |
| Modeled enrolled patients  | ~1,000                         |
| Enrollment rate            | ~33% (1,000 of 3,000 Medicare) |
| RPM enrolled               | ~600 (60% of 1,000)            |
| BHI enrolled               | ~300 (30% of 1,000)            |

---

## 12. Patient Deactivation Rules

> Source: May 8, 2026 call with Dr. Shah Khan MD.

- **Records are NEVER deleted** — once a patient is enrolled, their record (including all AI interactions, clinical notes, and device data) remains in the platform permanently
- **Deactivation = patient withdraws consent** (analogous to cancelling a subscription)
- Deactivated patients remain visible in the Deactivated tab for ~**1 year** after deactivation; after 1 year they move to stored DB but no longer appear in the UI list
- **Deactivated tab is visible to Clinic Admin only** — not shown to physician, nurse, or DHN

### Deactivation Workflow

1. Physician or Nurse can **request** deactivation (creates a Task assigned to Clinic Admin)
2. **Only Clinic Admin can finalize** the deactivation — deliberate friction to reduce churn
3. Admin speaks with the patient, confirms consent to withdraw, then approves deactivation
4. Patient status changes to "Deactivated" with a recorded deactivation date

---

## 13. UI & Feature Decisions (May 8, 2026 Call)

### Theme (Locked)

- Left navigation: **blue** (dark blue, confirmed)
- CTAs (buttons): **blue** as default color
- Hover state on buttons: **gradient** (blue → green)
- No gradient on buttons by default — gradient only appears on hover

### Medication Tab

- **Three sources** for medications — each must be tagged with source:
  1. Fetched from EMR/EHR (auto-synced)
  2. Manually added by provider on the platform
  3. Added by the patient (via mobile app)
- **Filter by condition** — user can filter medications by the disease they treat (e.g., diabetes medications, blood pressure medications, other)
- **Active** and **Inactive** tabs
- Medications tied to care plan conditions should auto-associate with the relevant condition filter
- Medications for unrelated conditions (sleep, pain, supplements) appear in an "Other" category
- EMR data: synced from the clinic's primary EMR at minimum; refresh either on chart open or on a scheduled daily basis

### Vitals Tab

- **Two data sources** — must be visually differentiated (by color or symbol):
  1. **Clinic readings** — pulled from EHR; represent a discrete in-clinic visit data point
  2. **Home device readings** — transmitted from the patient's RPM device
- Clicking a clinic reading shows: date, that it was a clinic visit, values collected
- Clicking a home device reading shows: device type, timestamp, reading values
- **SpO2** added as a vital (from pulse oximeter device)

### RPM Devices (4 Confirmed)

1. Weight Scale — body weight, BMI
2. CGM (Dexcom / FreeStyle Libre) — continuous glucose
3. Blood Pressure Cuff — systolic/diastolic BP, heart rate
4. **Pulse Oximeter** — SpO2 (oxygen saturation), heart rate

### Activity Log

- **Billing alerts and threshold indicators** (e.g., RPM day-count warnings, time thresholds for 99457/99458/99470) are visible **only to Clinic Admin and Super Admin** — not shown to physicians or nurses
- Each activity entry should include an **estimated time** for that task (for time-tracking purposes supporting 99470/99457/99458)
- Time tracked per activity accumulates over the month per patient
- Filter options: last week, last 15 days, last 30 days

### Care Plan — Goals & HEDIS Quality Metrics

- Goals display with **green/red indicators** showing whether the patient is at target or not
- Key HEDIS metrics to track per patient:
  - **A1c control** — target A1c <7% for diabetes patients; show last reading vs. previous
  - **Blood pressure control** — target <140/90 for hypertension patients
  - **Statin therapy** — whether patient is on appropriate statin medication
- Care plan is **bi-directional**: patient sees their goals AND which medications they're taking for each condition
- Population-level dashboard shows: % of patients meeting each HEDIS target

### RPM Threshold Update (2025)

- Minimum threshold changed from 16 days to **2 readings** (new CPT 99445 for 2–15 days)
- Platform should target 2 readings minimum to unlock billing; 16+ days unlocks the higher 99454 tier
- **Billing alert for RPM thresholds visible to admin/super admin only**

---

## 14. Key KPIs

### RPM KPIs

- Device adherence rate (% of patients meeting data-transmission threshold)
- Average days of data transmission per patient per month
- Time spent per patient per month
- Alert response time
- Billing capture rate

### APCM KPIs

- Enrollment rate (% of eligible patients enrolled)
- Consent documentation rate
- Patient retention / disenrollment rate
- % patients using asynchronous consultation per month
- % using AI agent to address concerns
- Average number of times patients view their care plan per month

### BHI KPIs

- BHI enrollment rate (% of APCM patients with psychiatric comorbidity enrolled)
- DHN check-in completion rate (weekly/bi-weekly cadence adherence)
- Psychiatric consultant initial evaluation completion rate

---

## 15. Design Sprint Priorities (March–May 2026)

1. Core care management workflow — patient enrollment, care plan creation, team communication
2. RN RPM data review feed — patient-by-patient data view, intervention documentation, monthly reporting
3. Patient multi-channel experience — mobile app, text messaging, NLP phone agent
4. EMR interoperability architecture — Epic bidirectional flow, SMART on FHIR, HIE connectivity
5. Population health dashboard — quality metrics, risk stratification, care gap alerts
6. Monthly reporting engine — care management summaries, RPM auditable reports
