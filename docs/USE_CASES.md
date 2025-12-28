# Use Cases - KPN Fast Project

This document outlines the primary use cases for the KPN Fast system, specifically focusing on the workflow for generating Project Offers ("Penawaran").

## Actors

- **Administrator / Staff**: The primary user responsible for maintaining databases and generating project documents.
- **Gemini AI**: The system agent responsible for generating technical content ("Usulan Teknis") based on project context.

## Use Case List

### UC-01: Manage Company Database (Database Perusahaan)

**Description**: The user creates or updates company profiles to ensure all necessary legal and administrative documents are available for projects.
**Preconditions**: User is logged in.
**Main Flow**:

1.  User views the list of companies.
2.  User selects a company or adds a new one.
3.  User inputs details:
    - **Profile**: Name, Address, etc.
    - **Legal Docs**: Upload Akta, NIB, SBU, Kartu Anggota, Sertifikat Standar.
    - **Tax Docs**: NPWP, PKP, KSWP, SPT.
    - **Experience**: Upload "Daftar Pengalaman" and "Kontrak Pengalaman Kerja".
    - **Financial**: Upload "CEK" and "BPJS" documents.
4.  System saves the data to `DB_Perusahaan`.

### UC-02: Manage Personnel Database (Database Personel)

**Description**: The user manages the pool of experts and support staff.
**Preconditions**: User is logged in.
**Main Flow**:

1.  User views the list of personnel.
2.  User adds or edits a person.
3.  User inputs details:
    - **Personal Info**: Name, Title, Contact.
    - **Documents**: Upload KTP, NPWP, CV (Data Pribadi).
    - **Qualifications**: Diplomas, Certificates.
4.  System saves the data to `DB_Personel`.

### UC-03: Create Project & Generate Offer (Penawaran)

**Description**: The user creates a new project entry and generates the full suite of offer documents (17 items).
**Preconditions**: `DB_Perusahaan` and `DB_Personel` are populated with relevant data.
**Main Flow**:

1.  **Project Initialization**:
    - User creates a new Project.
    - User uploads **KAK (Kerangka Acuan Kerja)**.
    - User uploads **HPS (Harga Perkiraan Sendiri)**.
2.  **Resource Selection**:
    - User selects the **Executer Company** from `DB_Perusahaan`.
    - User selects the **Expert Team (Tenaga Ahli)** and **Support Staff** from `DB_Personel`.
3.  **Document Generation Trigger**:
    - User clicks "Generate Penawaran".
4.  **System Processing** (Iterative Generation of 17 Items):
    - **00. Cover Kontrak**: System places uploaded PDF / template.
    - **01. SPK**: System includes scanned SPK.
    - **02. Harga Penawaran**: System calculates offer price (HPS negotiation) => Spreadsheet/Word.
    - **03. Prakualifikasi**: System aggregates data from Company & Personnel DB + KAK.
    - **04. Usulan Teknis (AI Task)**:
      - System prompts **Gemini AI** with KAK content + Selected Personnel profiles + Company capabilities.
      - AI generates a technical proposal detailing the work plan and how the selected team fits the job.
    - **05. Tenaga Ahli**: System compiles CVs of all selected personnel into a single document.
    - **06. Remunerasi**: System calculates monthly salaries based on HPS and Personnel roles.
    - **07-09. Company Experience & Profile**: System fetches PDFs from `DB_Perusahaan`.
    - **10. NPWP & KTP**: System merges Company Directors' IDs with Selected Personnel's IDs.
    - **11, 13, 14, 16. Financial & Legal**: System fetches KSWP, SPT, PKP, CEK, BPJS from `DB_Perusahaan`.
    - **12. Lelang**: System creates placeholder or fetches auction docs if applicable.
    - **15. KAK & HPS**: System stores the input files here.
5.  **Output**:
    - System presents the user with a download link or access to the 17 generated folders/files.

### UC-04: Generate Usulan Teknis (Technical Proposal)

**Description**: A sub-process where AI generates the technical methodology.
**Preconditions**: Project created, KAK uploaded, Team selected.
**Main Flow**:

1.  System retrieves text from the uploaded KAK.
2.  System retrieves "Job Description" or skills from selected Personnel.
3.  System constructs a prompt: _"Generate a Technical Proposal based on this KAK [Content], using this Team [List]. Explain the methodology and how each team member contributes."_
4.  Gemini AI returns the text.
5.  User reviews and can request regeneration with specific instructions.

### UC-05: Calculate Remuneration & Offer Price

**Description**: Automatic calculation of costs.
**Preconditions**: HPS uploaded, Team selected.
**Main Flow**:

1.  System parses HPS to understand the budget ceiling.
2.  System retrieves standard billing rates for the selected Experts.
3.  System creates a "Remunerasi" schedule (Item 06).
4.  System adjusts the final "Harga Penawaran" (Item 02) to be slightly below or at HPS (negotiation strategy) formatted in Spreadsheet/Word.
