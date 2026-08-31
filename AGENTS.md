# AGENTS.md — Plagiarisme Checker

## Project Goal

Build a campus plagiarism/similarity checking system for:
- Student thesis (skripsi)
- Seminar proposal (proposal sempro)

Users:
- Mahasiswa bimbingan
- Dosen pembimbing

Comparison source:
- Internal campus repository only
- Repository documents are organized by chapter

Development starts locally.

---

## Architecture

```text
plagiarism-checker/
├── AGENTS.md
├── frontend/       # Next.js
└── backend/        # FastAPI
```

```text
User
  ↓
Next.js
  ↓ HTTP/JSON
FastAPI
  ├── PostgreSQL
  ├── File Storage
  └── NLP Engine
       ├── PDF Extraction
       ├── Preprocessing
       ├── TF-IDF
       ├── Cosine Similarity
       └── Highlight/Matching
```

### Next.js responsibilities

- UI
- Dashboard
- Upload
- Processing status
- Similarity report
- Highlighted text
- History

### FastAPI responsibilities

- API
- File upload
- PDF extraction
- Text preprocessing
- NLP processing
- Similarity calculation
- Repository comparison
- Result generation
- Database access
- Business logic

### PostgreSQL responsibilities

Store:
- Document metadata
- Chapter metadata
- Plagiarism checks
- Similarity results
- Similarity matches
- User references

Do not put NLP logic inside Next.js.

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- React

### Backend
- Python
- FastAPI
- Uvicorn

### Initial NLP
- PyMuPDF
- Regex
- Sastrawi
- scikit-learn
- TF-IDF
- Cosine Similarity

### Future NLP
- Sentence Transformers
- Embeddings
- pgvector or FAISS

### Database
- PostgreSQL

### Python environment
- `.venv`

`.venv` is the Python virtual environment. `.env` is application configuration. They are different.

---

## Folder Structure

Target structure:

```text
plagiarism-checker/
│
├── AGENTS.md
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── .env.local
│
├── backend/
│   ├── .venv/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── documents.py
│   │   │   ├── plagiarism.py
│   │   │   └── repository.py
│   │   ├── services/
│   │   │   ├── pdf_service.py
│   │   │   ├── preprocessing_service.py
│   │   │   ├── tfidf_service.py
│   │   │   ├── similarity_service.py
│   │   │   └── highlight_service.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── database/
│   │   └── core/
│   ├── uploads/
│   ├── tests/
│   ├── .env
│   └── requirements.txt
│
└── .gitignore
```

Do not create every directory immediately. Add files when the relevant phase requires them.

---

## Development Order

Build from the core engine outward.

Required order:

```text
1. Python NLP prototype
2. TF-IDF
3. Cosine Similarity
4. Two-document comparison
5. PDF extraction
6. FastAPI
7. PostgreSQL
8. Repository comparison
9. Next.js
10. Highlighting
11. Semantic similarity
12. SADS integration
```

Do not skip directly to advanced architecture.

---

## Current Phase

### Phase 1 — NLP Prototype

Immediate goal:

```text
Text A
Text B
  ↓
Preprocessing
  ↓
TF-IDF
  ↓
Cosine Similarity
  ↓
Similarity %
```

Do not start with:
- Next.js UI
- SADS
- Production authentication
- Embeddings
- Redis
- Celery
- Deployment

The first milestone is the working similarity engine.

---

## NLP Pipeline

Initial pipeline:

```text
PDF
 ↓
Extract Text
 ↓
Normalize
 ↓
Lowercase
 ↓
Remove punctuation
 ↓
Remove unnecessary numbers
 ↓
Whitespace normalization
 ↓
Stopword removal
 ↓
Stemming
 ↓
Clean text
 ↓
TF-IDF
 ↓
Cosine Similarity
```

Use Sastrawi for Indonesian stopword removal/stemming where appropriate.

Keep preprocessing deterministic and testable.

Do not put preprocessing directly inside API route handlers.

Use:

```text
backend/app/services/preprocessing_service.py
```

---

## TF-IDF

The initial similarity algorithm MUST be:

```text
TF-IDF + Cosine Similarity
```

TF-IDF is a vector representation. It is not a plagiarism verdict.

Do not replace TF-IDF with embeddings until the semantic-similarity phase.

Example:

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

documents = [text_a, text_b]

vectorizer = TfidfVectorizer()
tfidf = vectorizer.fit_transform(documents)

score = cosine_similarity(tfidf[0], tfidf[1])[0][0]
percentage = score * 100
```

---

## Similarity Interpretation

The system reports similarity, not automatic plagiarism.

Correct:

```text
Tingkat kemiripan: 82%
```

Avoid:

```text
Anda terbukti melakukan plagiarisme.
```

Similarity thresholds must NOT be hard-coded as official campus rules without explicit requirements or validated research.

Example prototype thresholds may be configurable only.

---

## Repository

Repository is internal campus material.

Conceptually:

```text
repository/
├── skripsi/
│   ├── bab_1/
│   ├── bab_2/
│   ├── bab_3/
│   ├── bab_4/
│   └── bab_5/
│
└── proposal/
    ├── bab_1/
    ├── bab_2/
    └── bab_3/
```

The physical storage may change.

Database metadata should identify:
- Document
- Type
- Year
- Chapter
- File path

Prefer chapter-aware comparison where appropriate.

Example:

```text
Submitted Bab 2
    ↓
Repository Bab 2
```

Do not assume every submitted chapter must always be compared against every chapter.

---

## PDF Processing

Use PyMuPDF initially.

Responsibilities of `pdf_service.py`:
- Open PDF
- Extract page text
- Preserve page information where possible
- Return structured extraction results

Initial scope focuses on text-based PDFs.

OCR for scanned PDFs is a future feature.

---

## Highlighting

The final system must show:

1. Overall similarity
2. Most similar repository documents
3. Specific matching text
4. Highlighted matching segments

Preferred granularity:

```text
Document
  ↓
Chapter
  ↓
Paragraph
  ↓
Sentence
  ↓
Matching segment
```

Do not simply highlight the entire document because one paragraph matched.

Future match data should preserve:
- Submitted text
- Source text
- Similarity score
- Page
- Chapter
- Position/range when practical

---

## Database

Use PostgreSQL.

Initial logical entities:

```text
users
documents
document_chapters
plagiarism_checks
similarity_results
similarity_matches
```

### users

```text
id
external_user_id
name
role
created_at
```

`external_user_id` is intended for future SADS integration.

### documents

```text
id
title
document_type
owner_reference
year
file_path
status
created_at
```

### document_chapters

```text
id
document_id
chapter
file_path
extracted_text
created_at
```

### plagiarism_checks

```text
id
document_id
overall_similarity
status
created_at
completed_at
```

Status can be:

```text
pending
processing
completed
failed
```

### similarity_results

```text
id
check_id
source_document_id
chapter
similarity_score
```

### similarity_matches

```text
id
result_id
source_text
submitted_text
similarity_score
page_number
start_position
end_position
```

Schema can evolve after the algorithm is implemented.

Do not over-engineer the database before the NLP pipeline works.

---

## File Storage

For local development:

```text
backend/uploads/
```

Store PDFs as files.

Store metadata and file paths in PostgreSQL.

Validate uploads.

Never blindly use the raw uploaded filename as a filesystem path.

---

## FastAPI Rules

Keep routes thin.

Preferred flow:

```text
Route
  ↓
Service
  ↓
Database / Processing
```

Do not put PDF extraction, preprocessing, TF-IDF, similarity, and database logic all inside `main.py`.

`main.py` should primarily:
- Create the FastAPI app
- Register middleware
- Register routers
- Provide health endpoint

Initial API:

```text
GET  /api/health

POST /api/documents/upload
GET  /api/documents
GET  /api/documents/{id}

POST /api/plagiarism/check
GET  /api/plagiarism/check/{id}
GET  /api/plagiarism/check/{id}/matches

GET  /api/repository/documents
POST /api/repository/documents
```

Do not create unnecessary endpoints.

---

## Next.js Rules

Next.js is the presentation layer.

It should:
- Call FastAPI
- Display loading states
- Display processing states
- Display errors
- Display similarity results
- Display source documents
- Display highlights

Do not duplicate the NLP algorithm in TypeScript.

Use a centralized API client where practical.

Frontend environment:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Authentication / SADS

Final authentication will come through SADS.

Do not build a separate production authentication system unless explicitly requested.

For local development, use a mock user or temporary development authentication.

Future flow:

```text
SADS
 ↓
Identity / Token
 ↓
Plagiarism Checker
 ↓
Authenticated User
```

Do not invent the SADS API contract.

Do not block the NLP prototype on SADS integration.

---

## Sempro / Sidang Flow

Target final flow:

```text
Mahasiswa
  ↓
Ajukan Sempro / Sidang di SADS
  ↓
SADS checks plagiarism status
  ↓
Not checked?
  → Plagiarism Checker
  ↓
Similarity result
  ↓
Campus threshold evaluation
  ↓
Eligible / Needs Revision
  ↓
Return status to SADS
```

SADS integration is a later phase.

---

## Result UI

The result page should eventually contain:

```text
Overall Similarity
37.42%

Status
Needs Review

Most Similar Documents
1. Document A   82%
2. Document B   64%
3. Document C   57%

Chapter Breakdown
Bab 1   21%
Bab 2   47%
Bab 3   12%

Highlighted Text
[matching text highlighted]

Source
Document A
Bab 2
Page 15
```

Do not imply that a similarity score alone proves plagiarism.

---

## Environment

Backend `.env`:

```env
APP_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/plagiarism_checker
UPLOAD_DIR=uploads
```

Frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Never put backend secrets in `NEXT_PUBLIC_*`.

Never commit real `.env` files.

Provide `.env.example` files instead.

---

## Testing

Important services should have tests:

```text
tests/
├── test_pdf_service.py
├── test_preprocessing.py
├── test_tfidf.py
├── test_similarity.py
└── test_highlight.py
```

Test:
- Identical documents
- Very similar documents
- Slight modifications
- Paraphrased documents
- Unrelated documents
- Empty text
- Indonesian stopwords
- PDF extraction

Test the NLP engine independently from FastAPI.

---

## Evaluation

Before deciding an official campus threshold, create an evaluation dataset containing:

```text
Original
Copy-paste
Minor modification
Paraphrase
Unrelated document
```

Evaluate:
- Similarity score
- False positives
- False negatives
- Chapter-level behavior
- Sentence-level matching

Do not choose an official threshold based only on intuition.

---

## Future Semantic Similarity

After TF-IDF is stable:

```text
TF-IDF
  ↓
Sentence Transformers
  ↓
Embeddings
  ↓
Semantic Similarity
```

Possible technologies:
- sentence-transformers
- pgvector
- FAISS

Do not introduce these in Phase 1 unless explicitly requested.

---

## Performance

For a small repository, direct comparison is acceptable.

As the repository grows:

```text
100
→ 1,000
→ 10,000+ documents
```

consider:
- Precomputed representations
- Vector indexing
- pgvector
- FAISS
- Background processing

Do not add Redis/Celery without a real workload reason.

---

## Background Processing

Initial MVP may process synchronously if processing time is acceptable.

If processing becomes slow:

```text
Upload
 ↓
Create check
 ↓
Background job
 ↓
NLP processing
 ↓
Save result
 ↓
Frontend checks status
```

Potential future tools:
- Celery
- Redis
- Other task queues

---

## Security

At minimum:
- Validate file extension
- Validate MIME type
- Limit upload size
- Sanitize filenames
- Never expose `.env`
- Never commit credentials
- Validate document ownership
- Protect repository endpoints
- Apply role/permission checks
- Do not expose internal filesystem paths unnecessarily

---

## What the Agent Must NOT Do

Do not:

1. Replace FastAPI with another backend framework.
2. Replace Next.js with another frontend framework.
3. Replace PostgreSQL without explicit approval.
4. Add Redis/Celery unnecessarily.
5. Add embeddings before TF-IDF is complete.
6. Build SADS authentication before the core system works.
7. Put NLP logic inside Next.js.
8. Put all backend logic inside `main.py`.
9. Hard-code official campus thresholds.
10. Claim similarity equals confirmed plagiarism.
11. Store secrets in source code.
12. Commit `.env`.
13. Commit `.venv`.
14. Create unnecessary abstractions.
15. Rewrite working code without a reason.
16. Install large dependencies without explaining their purpose.
17. Change architecture without documenting why.

---

## Agent Workflow

Before implementing a feature:

1. Read this file.
2. Inspect the current project structure.
3. Inspect existing code.
4. Identify the current phase.
5. Reuse existing services/utilities.
6. Make the smallest reasonable change.
7. Test the changed behavior.
8. Avoid unrelated modifications.
9. Report what changed.
10. Report assumptions.

If a requirement is ambiguous:
- Follow this document where possible.
- Ask before making a major architectural change.
- Never invent external SADS API details.

---

## Roadmap

### Phase 1 — NLP Prototype
- [ ] Preprocessing
- [ ] TF-IDF
- [ ] Cosine Similarity
- [ ] Two-document comparison

### Phase 2 — PDF
- [ ] PDF upload
- [ ] Text extraction
- [ ] Page tracking
- [ ] Chapter handling

### Phase 3 — FastAPI
- [ ] FastAPI app
- [ ] Upload endpoint
- [ ] Similarity endpoint
- [ ] Result endpoint

### Phase 4 — PostgreSQL
- [ ] Connection
- [ ] Documents
- [ ] Chapters
- [ ] Checks
- [ ] Results
- [ ] Matches

### Phase 5 — Repository
- [ ] Import documents
- [ ] Organize chapters
- [ ] Compare submissions
- [ ] Rank similar sources

### Phase 6 — Next.js
- [ ] Dashboard
- [ ] Upload
- [ ] Processing status
- [ ] Result page
- [ ] History

### Phase 7 — Highlighting
- [ ] Sentence segmentation
- [ ] Matching segments
- [ ] Highlight UI
- [ ] Source references

### Phase 8 — Evaluation
- [ ] Evaluation dataset
- [ ] Accuracy analysis
- [ ] Threshold analysis
- [ ] False positive analysis

### Phase 9 — Semantic Similarity
- [ ] Sentence Transformers
- [ ] Embeddings
- [ ] Semantic comparison
- [ ] Compare against TF-IDF

### Phase 10 — Optimization
- [ ] Precomputed vectors
- [ ] Vector search
- [ ] pgvector/FAISS if needed
- [ ] Background processing if needed

### Phase 11 — SADS
- [ ] Authentication integration
- [ ] User mapping
- [ ] Sempro workflow
- [ ] Sidang workflow
- [ ] Eligibility/status integration

---

## MVP Definition

MVP is successful when:

- [ ] Student can upload supported PDF
- [ ] Backend extracts text
- [ ] Text is preprocessed
- [ ] TF-IDF is generated
- [ ] Cosine similarity is calculated
- [ ] Document is compared with repository
- [ ] Similarity percentage is displayed
- [ ] Most similar documents are displayed
- [ ] Results are stored in PostgreSQL
- [ ] User can view previous checks
- [ ] Matching text can be identified/highlighted

SADS integration is NOT required for MVP.

---

## Immediate Next Task

The immediate task is:

```text
Create a minimal Python prototype that accepts two text documents,
preprocesses them, converts them using TF-IDF, calculates cosine
similarity, and prints the similarity percentage.
```

Then:

```text
PDF
 ↓
Extract text
 ↓
Preprocess
 ↓
TF-IDF
 ↓
Similarity
```

Then move the working processing engine into FastAPI.

---

## Guiding Principle

> Build the similarity engine first. Turn it into an API second. Build the web application around the API third. Integrate SADS last.

Preserve this incremental development approach unless the user explicitly changes the plan.
