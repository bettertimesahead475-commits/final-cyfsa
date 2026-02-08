# CYFSA Ontario – Parent Education Platform + Lawyer Spot Marketplace

**Educational platform (Not Legal Advice) – Ontario jurisdiction only**

---

## Overview

This is a full-stack web application for Ontario parents involved with the Child, Youth and Family Services Act (CYFSA) and related Family Court processes.

The platform provides:
- Parent education (CYFSA, Family Court, child development impacts)
- Educational document analyzer (PDF / DOCX / TXT / Image OCR)
- Draft preparation templates (educational only)
- Parent memberships (tiered access)
- Public lawyer finder by city
- Lawyer spot marketplace (monthly paid city placement – not a membership)
- Lead routing with explicit user consent

This platform is **educational only** and **does not provide legal advice**.

---

## Legal & Compliance (Non-Negotiable)

- Jurisdiction: **Ontario, Canada only**
- Sources:  
  - Ontario e-Laws (https://www.ontario.ca/laws)  
  - CanLII (https://www.canlii.org)  
  - Government of Ontario  
  - Department of Justice Canada  
  - Ontario Court of Justice  
  - Superior Court of Justice  
  - Supreme Court of Canada  
- No legal advice  
- No guarantees of legal outcomes  
- If information cannot be verified from primary sources, the system must state:  
  > “Not verifiable from primary sources.”

---

## Features

### Parent Section
- CYFSA guide (authority limits, timelines, evidence vs hearsay)
- Family court procedures (motions, conferences, affidavits)
- Child development impacts (evidence-based summaries)
- Educational document analyzer
- Draft document tools (non-court, educational)
- Tiered memberships

### Document Analyzer
- Client-side extraction (PDF, DOCX, TXT, image OCR)
- Flags:
  - hearsay  
  - speculation  
  - missing affidavits  
  - unsupported claims  
  - procedural gaps  
- Outputs structured JSON for lawyer intake  
- No document storage by default  

### Lawyer Section (City Spot Marketplace)
- Lawyers buy **city inventory**, not memberships  
- Monthly recurring pricing  
- Tiered placement:
  - Exclusive (1 per city)
  - Priority (limited slots)
  - Standard (limited slots)
- Public lawyer finder ordered by tier
- Lead routing only to lawyers with active spots
- Explicit user consent required before sharing any contact info

---

## Pricing Model

### Parent Memberships (monthly)
- Basic – CYFSA + Family Court access  
- Pro – + Document Analyzer  
- Premium – + Templates + future voice assistant  

Payment (current):
- Interac e-Transfer: **mr.pelkie@gmail.com**  
- Stripe / PayPal: coming soon  
- No refunds after first use  

### Lawyer Spots (monthly)

Lawyers purchase **city placement inventory**.

Pricing is dynamically returned based on:
- City entered by the lawyer
- Tier selected (Exclusive / Priority / Standard)

City-specific pricing and slot limits are returned at runtime and are not hardcoded into the frontend.

---

## Tech Stack

- Next.js (App Router)
- React 18
- Deployed on Vercel
- Client-side document extraction (PDF.js, Mammoth, Tesseract – can be self-hosted later)
- No database included by default (designed for later Postgres integration)

---

## Routes

- `/` – Home  
- `/cyfsa` – CYFSA Guide  
- `/family-court` – Family Court  
- `/child-development` – Child Development Impact  
- `/membership` – Parent memberships  
- `/analyzer` – Document analyzer  
- `/find-a-lawyer` – Public lawyer finder (by city)  
- `/lawyer-spots` – Lawyer spot marketplace  
- `/lawyer-onboard` – Lawyer onboarding  

---

## Data Handling & Privacy

- Documents processed in-browser by default  
- No document storage unless explicitly added later  
- Explicit consent required before sending any user info to lawyers  
- No analytics on document contents  

---

## Deployment

```bash
npm install
npm run dev
npm run build
