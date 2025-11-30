---
config:
  theme: redux-dark
---
graph TD
    classDef ai fill:#f9f,stroke:#333,stroke-width:2px,color:black;
    classDef db fill:#ff9,stroke:#333,stroke-width:2px,color:black;
    classDef drive fill:#4285F4,stroke:#333,stroke-width:2px,color:white;
    classDef file fill:#fff,stroke:#4285F4,stroke-width:2px,color:#4285F4,stroke-dasharray: 5 5;
    classDef process fill:#6CC24A,stroke:#333,stroke-width:2px,color:white;
    classDef decision fill:#ff9900,stroke:#333,stroke-width:2px,color:white;
    classDef api fill:#333,stroke:#fff,stroke-width:2px,color:white;

    subgraph INPUT [Langkah 1: Input Data]
        KAK[FILE 15: Upload PDF KAK]
        HPS[Upload Excel HPS/RAB]
    end

    subgraph NODEJS [Server Node.js Processing - KPN FAST]
        Parser[PDF Parser & Excel Reader]:::process
        Router{Jenis Dokumen?}
        subgraph Logic_Admin [Jalur Automasi Statis]
            Templating[Template Engine]:::process
            Calc[Kalkulasi Penawaran & Terbilang]:::process
        end
        subgraph Logic_Ustek [Jalur AI GenAI]
            PromptBuilder[Build Prompt: Role Tenaga Ahli]:::process
            Gemini[Google Gemini API]:::ai
            UserReview{Review Draft AI?}:::decision
        end
        GDocsAPI[Google Docs API Writer]:::api
    end

    subgraph DATABASE [Gudang Data Perusahaan]
        DB_Profil[(Data Legalitas)]:::db
        DB_Personil[(Data Personil)]:::db
    end
    subgraph GDRIVE [Google Drive: Folder Proyek Baru]
        
        subgraph F00 [Folder 00. COVER & SPK]
            File00(Doc: 00. Cover.gdoc):::file
            File01(Doc: 01. SPK.gdoc):::file
        end

        subgraph F02 [Folder 02. PENAWARAN]
            File02(Doc: 02. Surat Penawaran.gdoc):::file
        end

        subgraph F04 [Folder 04. USULAN TEKNIS]
            File04(Doc: 04. Metodologi Teknis.gdoc):::file
        end

        subgraph F05 [Folder 05. TENAGA AHLI]
            File05(Doc: 05. CV & Ijazah.gdoc):::file
        end
        
        NoteDrive[Dan folder 06-14 lainnya...]:::drive
    end
    KAK --> Parser
    HPS --> Parser
    Parser -->|Extract Info Proyek| Router
    Router -->|Data Admin| Templating
    Router -->|Angka HPS| Calc
    DB_Profil --> Templating
    DB_Personil --> Templating
    Calc --> Templating
    Templating -->|JSON Data| GDocsAPI
    Router -->|Teks KAK| PromptBuilder
    PromptBuilder -->|Request| Gemini
    Gemini -->|Draft| UserReview
    UserReview -->|Revisi| PromptBuilder
    UserReview -->|ACC Final Text| GDocsAPI
    GDocsAPI -->|Create & Fill| File00
    GDocsAPI -->|Create & Fill| File01
    GDocsAPI -->|Create & Fill| File02
    GDocsAPI -->|Create & Fill| File04
    GDocsAPI -->|Create & Fill| File05