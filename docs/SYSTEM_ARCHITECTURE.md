# System Architecture - KPN Fast Project

## High Level Overview

This document describes the high-level architecture of the KPN Fast system, focusing on the "Penawaran" (Project Offer) generation workflow. The system integrates existing Company and Personnel databases with project-specific inputs (KAK, HPS) and leverages AI (Gemini) to generate technical proposals.

## System Context Diagram

```mermaid
graph TD
    User(("User / Staff"))

    subgraph "Data Sources (Databases)"
        DB_Comp[("Database Perusahaan")]
        DB_Pers[("Database Personel")]
    end

    subgraph "Project Input"
        Input_KAK["Input KAK (Kerangka Acuan Kerja)"]
        Input_HPS["Input HPS (Harga Perkiraan Sendiri)"]
    end

    subgraph "Core System (KPN Fast)"
        Project_Mgr["Project Manager Module"]
        Doc_Gen["Document Generator Engine"]
        AI_Agent["Gemini AI Agent"]
        Calc_Engine["Cost & Remuneration Calculator"]
    end

    subgraph "Output: Penawaran (17 Items)"
        Out_00["00. Cover Kontrak"]
        Out_01["01. SPK"]
        Out_02["02. Harga Penawaran"]
        Out_03["03. Prakualifikasi"]
        Out_04["04. Usulan Teknis (AI)"]
        Out_05["05. Tenaga Ahli"]
        Out_06["06. Remunerasi"]
        Out_07["07. Daftar Pengalaman"]
        Out_08["08. Kontrak Pengalaman"]
        Out_09["09. Company Profile"]
        Out_10["10. NPWP & KTP"]
        Out_11["11. KSWP & SPT"]
        Out_12["12. Lelang"]
        Out_13["13. PKP"]
        Out_14["14. CEK"]
        Out_15["15. KAK & HPS"]
        Out_16["16. BPJS"]
    end

    %% Relations
    User -- "1. Fill Data" --> DB_Comp
    User -- "1. Fill Data" --> DB_Pers
    User -- "2. Create Project" --> Project_Mgr
    User -- "3. Upload" --> Input_KAK
    User -- "3. Upload" --> Input_HPS

    Project_Mgr -- "Select Executor" --> DB_Comp
    Project_Mgr -- "Select Team" --> DB_Pers
    Project_Mgr -- "Trigger Generation" --> Doc_Gen

    Input_KAK --> Doc_Gen
    Input_HPS --> Calc_Engine

    Doc_Gen -- "Fetch Corp Docs" --> DB_Comp
    Doc_Gen -- "Fetch Person Docs" --> DB_Pers

    %% AI Generation Logic for Usulan Teknis
    Input_KAK --> AI_Agent
    DB_Comp --> AI_Agent
    DB_Pers --> AI_Agent
    AI_Agent -- "Generate Content" --> Out_04

    %% Calculator Logic
    DB_Pers --> Calc_Engine
    Input_HPS --> Calc_Engine
    Calc_Engine --> Out_06
    Calc_Engine --> Out_02

    %% Direct Mapping / Composition
    Project_Mgr --> Out_00
    Project_Mgr --> Out_01

    Doc_Gen --> Out_03
    Doc_Gen --> Out_05
    Doc_Gen --> Out_07
    Doc_Gen --> Out_08
    Doc_Gen --> Out_09
    Doc_Gen --> Out_10
    Doc_Gen --> Out_11
    Doc_Gen --> Out_12
    Doc_Gen --> Out_13
    Doc_Gen --> Out_14
    Doc_Gen --> Out_15
    Doc_Gen --> Out_16

    %% Styling
    style AI_Agent fill:#f9f,stroke:#333,stroke-width:2px,color:black
    style Doc_Gen fill:#bbf,stroke:#333,stroke-width:2px,color:black
    style Project_Mgr fill:#bfb,stroke:#333,stroke-width:2px,color:black
```

## Detailed Data Flow for "Penawaran" Generation

The following flowchart details the step-by-step process from data entry to the generation of the 17 output items.

```mermaid
flowchart TD
    %% Start
    Start([Start]) --> CheckDB{Data Check}

    CheckDB -- "Incomplete" --> UpdateDB["Update DB Perusahaan / Personel"]
    UpdateDB --> CheckDB
    CheckDB -- "Complete" --> InitProject["Initialize Project"]

    %% Project Inputs
    subgraph "Project Setup Phase"
        InitProject --> SelectComp["Select Company (Executor)"]
        SelectComp --> SelectTeam["Select Personnel (Tenaga Ahli & Pendukung)"]
        SelectTeam --> UploadDocs["Upload KAK & HPS"]
    end

    UploadDocs --> Generate{Generate Documents}

    %% Logic Branches
    subgraph "Processing Engines"
        direction TB

        %% Branch 1: Static & Manual Files
        Generate --> |Static Files| ManualProc["Manual & Static Processing"]
        ManualProc --> Op1["Get Template/Upload"]
        Op1 --> Item00["00. Cover Kontrak"]
        ManualProc --> OpScan["Scan & Print Logic"]
        OpScan --> Item01["01. SPK"]
        ManualProc --> OpRaw["pass-through"]
        OpRaw --> Item12[12. Lelang]
        OpRaw --> Item15[15. KAK & HPS]

        %% Branch 2: Financial Calculations
        Generate --> |Calculations| FinanceProc["Financial Engine"]
        FinanceProc --> ParseHPS["Parse HPS Limit"]
        FinanceProc --> GetRates["Get Personnel Rates"]
        ParseHPS & GetRates --> CalcRemun["Calculate Remunerasi"]
        CalcRemun --> Item06["06. Remunerasi"]
        CalcRemun --> AdjustPrice["Adjust Price < HPS"]
        AdjustPrice --> Item02["02. Harga Penawaran"]

        %% Branch 3: Database Extractor (Company)
        Generate --> |DB Query| CompProc["Company Data Extractor"]
        CompProc --> GetLegal["Fetch Legal Docs"]
        GetLegal --> Item09["09. Company Profile (Bundle: Akta, SBU, NIB, etc)"]

        CompProc --> GetTax["Fetch Tax Docs"]
        GetTax --> Item11["11. KSWP & SPT"]
        GetTax --> Item13["13. PKP"]

        CompProc --> GetExp["Fetch Experience"]
        GetExp --> Item07["07. Daftar Pengalaman"]
        GetExp --> Item08["08. Kontrak Pengalaman"]

        CompProc --> GetFin["Fetch Financial Check"]
        GetFin --> Item14["14. CEK"]
        GetFin --> Item16["16. BPJS"]

        %% Branch 4: Database Extractor (Personnel)
        Generate --> |DB Query| PersProc["Personnel Data Extractor"]
        PersProc --> GetCVs["Compile CVs"]
        GetCVs --> Item05["05. Tenaga Ahli (Merged CVs)"]
        PersProc --> GetIDs["Fetch KTP/NPWP"]
        GetIDs --> CombineIDs["Combine with Director IDs"]
        CombineIDs --> Item10["10. NPWP & KTP"]

        %% Branch 5: AI Generation
        Generate --> |AI Generation| AIProc["Gemini AI Agent"]
        AIProc --> ReadKAK["Read KAK Context"]
        AIProc --> ReadTeam["Read Team Capabilities"]
        ReadKAK & ReadTeam --> PromptAI["Prompt: Generate Methodology"]
        PromptAI --> GenText["Generate Textual Proposal"]
        GenText --> Item04["04. Usulan Teknis"]

        %% Branch 6: Data Integration
        Item04 & Item06 & Item07 --> DataInteg["Data Integration"]
        DataInteg --> Item03["03. Prakualifikasi"]
    end

    %% Final Output
    subgraph "Final Bundle (17 Folders)"
        BundleNode["Bundle All Items"]
    end

    Item00 & Item01 & Item12 & Item15 --> BundleNode
    Item02 & Item06 --> BundleNode
    Item09 & Item11 & Item13 & Item07 & Item08 & Item14 & Item16 & Item10 --> BundleNode
    Item04 & Item03 --> BundleNode
    Item05 --> BundleNode

    BundleNode --> Finish([End: Penawaran Ready])

    %% Styling
    style AIProc fill:#ff9,stroke:#333
    style FinanceProc fill:#9f9,stroke:#333
    style CompProc fill:#9ff,stroke:#333
    style PersProc fill:#f9f,stroke:#333
```
