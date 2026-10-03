# Repeated Complaint Root-Cause Finder

> **Incident Intelligence Platform:** An end-to-end full-stack web application that ingests unstructured service and IT complaint tickets, analyzes natural language patterns, and dynamically groups related complaints into underlying root-cause incidents using TF-IDF vectorization, cosine similarity, and Union-Find graph clustering.

![Dashboard Preview](https://img.shields.io/badge/Status-Complete-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.141.1-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.9.1-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-SQLAlchemy-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 1. Executive Summary & Problem Statement

Organizations, universities, and IT service desks traditionally process helpdesk tickets one by one. In large operations, support staff frequently experience **ticket fragmentation** and **alert fatigue**:

* *"WiFi keeps disconnecting in Block A"*
* *"Campus WiFi drops every few minutes"*
* *"Network connection unstable in Block A"*
* *"Unable to stay connected to campus WiFi"*

These four tickets describe the **exact same physical root cause** (e.g., an overloaded wireless access point in Block A). However, because each complainant uses different words, support teams often treat them as 4 separate isolated tickets, wasting technical labor and missing the systemic problem.

**Repeated Complaint Root-Cause Finder** solves this by replacing isolated ticket lists with an **Incident Case Board**. It ingests unstructured text, builds high-dimensional sublinear TF-IDF vectors, computes pairwise cosine similarities, and applies Union-Find (Disjoint Set Union) graph partitioning to cluster tickets transitively with mathematical confidence metrics—**100% locally with zero external API costs**.

---

## 2. Key Features

- **Real-Time Dynamic Clustering:** Open tickets are clustered on-demand. Clusters are **never** statically persisted in database tables, eliminating stale states and cache invalidation bugs.
- **Explainable Root-Cause Extraction (NLP):**
  - **Centroid Keyword Extraction:** Extracts the top distinctive TF-IDF keywords for each incident cluster.
  - **Representative Symptom Selection:** Determines the ticket closest to the mathematical cluster centroid.
  - **Location & Entity Detection:** Automatically detects recurring location mentions (e.g., *Block A*, *Room 204*, *Science Block*).
- **Interactive Sensitivity Tuning (Threshold Slider):** An interactive control allowing operators to adjust the cosine similarity threshold from `0.05` (broad grouping) to `0.35` (strict grouping) with real-time recalculation.
- **Incident Resolution & Bulk Actions:** Single-click resolution for individual tickets or **bulk resolution** of an entire incident group.
- **Full-Featured Intake Form with 1-Click Templates:** Allows instant testing of realistic campus incidents.
- **Audit Table & Global Search:** Searchable log of all historical tickets (both open and resolved) with status tracking.
- **100% Local & Cost-Free:** Zero dependence on paid cloud LLMs (OpenAI/Anthropic). Runs fully on CPU with sub-100ms latency for $N=500$ tickets.

---

## 3. System Architecture

```text
+-------------------------------------------------------------------------+
|                              END USER / OPERATOR                        |
+-------------------------------------------------------------------------+
                                    |
            HTTP Requests           |           Responses
            (JSON Payloads)         |           (JSON DTOs)
                                    v
+-------------------------------------------------------------------------+
|                  FRONTEND CLIENT (React 18 + Vite)                      |
|  - View 1: Incident Case Board (Clusters, Metrics, Resolution Actions)  |
|  - View 2: Complaint Intake Form (Real-time submission + 1-Click Demos) |
|  - View 3: All Tickets Audit Log (Searchable table with status badges)  |
+-------------------------------------------------------------------------+
                                    |
               REST API calls over HTTP (CORS Enabled)
               Port 8000 (FastAPI) <---> Port 5173 (Vite)
                                    v
+-------------------------------------------------------------------------+
|                             FASTAPI BACKEND                             |
|  ├── CORSMiddleware (Port 5173 / 3000)                                  |
|  ├── OpenAPI / Swagger (/docs)                                          |
|  └── Router Modules:                                                    |
|      ├── /api/complaints   -->  CRUD & Bulk Resolve Controller          |
|      ├── /api/clusters     -->  Dynamic Clustering Controller           |
|      └── /api/stats        -->  Live KPI Stats Controller               |
+-------------------------------------------------------------------------+
            |                                           |
            | Queries & Mutations                       | Open Tickets Only
            v                                           v
+------------------------------------+   +--------------------------------+
|     DATA ACCESS LAYER (crud.py)    |   |     NLP CLUSTERING ENGINE      |
|  - get_complaints()                |   |        (clustering.py)         |
|  - get_open_complaints()           |   |  1. Text Normalization         |
|  - create_complaint()              |   |  2. Title Boosting (2x Weight) |
|  - update_complaint()              |   |  3. Sublinear TF-IDF (1-2 gram)|
|  - delete_complaint()              |   |  4. Cosine Similarity Matrix   |
|  - bulk_resolve_complaints()       |   |  5. Threshold Filter (0.12)    |
|  - count_complaints()              |   |  6. Union-Find Graph Merge     |
+------------------------------------+   |  7. Intra-Cluster Confidence   |
            |                            |  8. Centroid Keyword Extract   |
            v                            +--------------------------------+
+------------------------------------+                  |
|        PERSISTENT STORAGE          |                  |
|      (backend/complaints.db)       |                  |
|  Table: complaints                 |                  |
|  - id (PK)                         |                  |
|  - title, description              |                  |
|  - category, submitter             |                  |
|  - status ("open" | "resolved")    |                  v
|  - created_at (UTC Timestamp)      |   +--------------------------------+
+------------------------------------+   | Serialized via Pydantic DTOs   |
                                         +--------------------------------+
```

---

## 4. The Clustering Algorithm & Mathematical Foundation

### Step 1: Text Preparation & Title Boosting
In ticket reporting, the user's **Title** is dense in primary intent, whereas the **Description** often contains extraneous narrative details. The input document is normalized and the title is assigned double weighting:
$$\text{Document} = \text{Title} + \text{" "} + \text{Title} + \text{" "} + \text{Description}$$
Synonyms and common abbreviations are normalized via regex (e.g., `wi-fi` $\rightarrow$ `wifi`, `a/c` $\rightarrow$ `air conditioning`, `cafeteria` $\rightarrow$ `canteen`).

### Step 2: Sublinear TF-IDF Vectorization
The text is vectorized using unigrams and bigrams (`ngram_range=(1, 2)`), English stop-word removal, and **sublinear term frequency scaling**:
$$\text{TF}_{\text{sublinear}} = 1 + \log(\text{TF}) \quad \text{for } \text{TF} > 0$$
$$\text{TF-IDF}(t, d) = \text{TF}_{\text{sublinear}}(t, d) \times \left(\log\frac{1 + N}{1 + \text{DF}(t)} + 1\right)$$
Vectors are $L_2$-normalized to unit spheres: $\|\vec{v}\|_2 = 1$.

### Step 3: Pairwise Cosine Similarity
Pairwise similarity is computed across all $N$ active complaints:
$$\text{Sim}(i, j) = \vec{u}_i \cdot \vec{u}_j = \cos(\theta_{ij}) \in [0.0, 1.0]$$
A safe domain consistency reinforcement ($+0.03$) is added if both tickets share the identical category **and** already possess positive semantic similarity ($> 0.05$).

### Step 4: Transitive Graph Grouping (Union-Find / DSU)
Why Union-Find instead of K-Means or DBSCAN?
- **K-Means** requires pre-specifying $K$ (impossible in incident management where root causes are unknown).
- **DBSCAN** requires density parameters that drop valid 2-ticket clusters as noise.
- **Union-Find** captures **transitive relationships**: If ticket $A \sim B$ and ticket $B \sim C$, then $\{A, B, C\}$ belong to the same underlying physical failure, even if $A$ and $C$ share minimal direct vocabulary.

The Disjoint Set Union (DSU) operates in near-linear time $O(\alpha(N))$ using **path compression** and **union by rank**:

```python
class UnionFind:
    def find(self, x: int) -> int:
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]

    def union(self, x: int, y: int) -> None:
        root_x, root_y = self.find(x), self.find(y)
        if root_x != root_y:
            # Union by rank keeps tree balanced
            if self.rank[root_x] < self.rank[root_y]:
                self.parent[root_x] = root_y
            elif self.rank[root_x] > self.rank[root_y]:
                self.parent[root_y] = root_x
            else:
                self.parent[root_y] = root_x
                self.rank[root_x] += 1
```

### Step 5: Root-Cause Explainability & Confidence
- **Intra-Cluster Confidence:** Computed as the mean pairwise similarity across all unique pairs in the cluster:
  $$\text{Confidence}(C) = \frac{1}{\binom{|C|}{2}} \sum_{i < j \in C} \text{Sim}(i, j)$$
- **Cluster Centroid & Representative Ticket:** The cluster centroid vector is $\vec{c} = \frac{1}{|C|} \sum_{i \in C} \vec{u}_i$. The representative ticket is:
  $$\text{Representative} = \arg\max_{i \in C} \cos(\vec{u}_i, \vec{c})$$
- **Top Distinctive Keywords:** Top 5 vocabulary dimensions with the highest weights in $\vec{c}$.

---

## 5. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend** | Python | `3.12.10` | Server runtime & computation |
| **API Framework** | FastAPI | `0.141.1` | Asynchronous REST API & OpenAPI docs |
| **ASGI Server** | Uvicorn | `0.52.4` | High-throughput web server |
| **ORM** | SQLAlchemy | `2.0.52` | Declarative relational data access |
| **Validation** | Pydantic | `2.13.5` | Data contracts & input validation |
| **Machine Learning**| scikit-learn | `1.9.1` | TF-IDF Vectorizer & Cosine Similarity |
| **Array Handler** | NumPy | `2.5.3` | Matrix manipulation |
| **Database** | SQLite 3 | Embedded | ACID file-based relational store |
| **Frontend** | React | `18` | Interactive user interface |
| **Build Tool** | Vite | `8.3.2` | Fast HMR & production bundler |
| **Icons** | Lucide React | `1.16.0` | Accessible vector interface icons |
| **Test Runner** | Pytest + HTTPX | `9.1.1` | Unit & REST API integration tests |

---

## 6. Project Directory Structure

```text
repeated-complaint-root-cause-finder/
├── .gitignore                      # Git exclusion rules
├── README.md                       # Comprehensive documentation
├── backend/
│   ├── complaints.db               # SQLite database file
│   ├── requirements.txt            # Python dependencies
│   ├── seed.py                     # 15 realistic seed complaints
│   ├── evaluation_dataset.py       # 30-complaint benchmarking dataset
│   ├── benchmark_clustering.py     # Precision/Recall/F1 benchmark runner
│   ├── benchmark_performance.py    # Latency & scalability benchmark (N=50..500)
│   ├── test_clustering.py          # Unit tests for clustering engine (9 tests)
│   ├── test_api.py                 # REST API integration tests (13 tests)
│   └── app/
│       ├── __init__.py             # Package marker
│       ├── database.py             # SQLite connection & sessionmaker
│       ├── models.py               # SQLAlchemy Complaint model
│       ├── schemas.py              # Pydantic schemas (contracts)
│       ├── crud.py                 # Data access queries & mutations
│       ├── clustering.py           # NLP engine + Union-Find + Explainability
│       ├── main.py                 # FastAPI application & CORS setup
│       └── routes/
│           ├── __init__.py         # Routes marker
│           ├── complaints.py       # CRUD & Bulk-Resolve endpoints
│           ├── clusters.py         # Dynamic /api/clusters endpoint
│           └── stats.py            # Dynamic /api/stats endpoint
└── frontend/
    ├── package.json                # Frontend dependencies
    ├── vite.config.js              # Vite configuration
    ├── index.html                  # HTML entry point with SEO metadata
    └── src/
        ├── main.jsx                # React root mount
        ├── App.jsx                 # Master application controller
        ├── index.css               # Design system & glassmorphic styling
        ├── api/
        │   └── client.js           # Centralized API HTTP client
        └── components/
            ├── Header.jsx          # Top navbar & connectivity badge
            ├── StatsBar.jsx        # 6 KPI metric cards
            ├── ThresholdControl.jsx# Sensitivity slider (0.05 - 0.35)
            ├── ComplaintForm.jsx   # Ticket intake form + 1-Click templates
            ├── ClusterCard.jsx     # Incident cluster card with explainability
            ├── IndividualReports.jsx# Standalone tickets grid
            └── NotificationToast.jsx# User action feedback toast
```

---

## 7. How to Run the Application

### Prerequisites
- **Python:** `3.10+` (Python 3.12 recommended)
- **Node.js:** `18+` or `20+` (npm included)

### Step 1: Setup and Run the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (if not already present)
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed the database with 15 realistic incident complaints
python seed.py

# Start the FastAPI server on port 8000
python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```

The backend will start at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

### Step 2: Setup and Run the Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server on port 5173
npm run dev -- --port 5173
```

Open your browser at: **`http://localhost:5173/`**

---

## 8. REST API Reference

| Method | Endpoint | Query / Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | None | System health check (`{"status": "ok"}`) |
| `POST` | `/api/complaints` | JSON: `title`, `description`, `category?`, `submitter?` | Ingests a new complaint (HTTP 201) |
| `GET` | `/api/complaints` | None | Returns all complaints ordered newest first |
| `PATCH`| `/api/complaints/{id}` | JSON: `status?`, `title?`, `description?` | Updates a complaint (e.g. mark resolved) |
| `DELETE`| `/api/complaints/{id}` | None | Deletes a complaint by ID |
| `POST` | `/api/complaints/bulk-resolve` | JSON: `complaint_ids: [1, 2, 3]` | Resolves all complaints in an incident cluster |
| `GET` | `/api/clusters` | `threshold` (default `0.12`) | Dynamically computes root-cause clusters & explanations |
| `GET` | `/api/stats` | `threshold` (default `0.12`) | Returns KPI dashboard metrics |

---

## 9. Testing & Benchmarking Results

### 1. Automated Test Suite (22/22 Passing)

```bash
# Run clustering unit tests (9 tests)
python backend/test_clustering.py

# Run REST API integration tests (13 tests)
pytest backend/test_api.py -v
```

All 22 automated tests pass with 100% success:
- `test_empty_input`: Edge case of zero complaints.
- `test_single_complaint`: Single complaint resolves to individual report.
- `test_similar_complaints_cluster`: High semantic similarity clusters accurately.
- `test_unrelated_stay_separate`: Dissimilar complaints remain isolated.
- `test_transitive_clustering`: Verifies $A \sim B \land B \sim C \implies \{A, B, C\}$.
- `test_threshold_changes_behaviour`: High threshold suppresses clustering.
- `test_avg_similarity_in_cluster`: Intra-cluster confidence computation.
- `test_union_find_basic`: Direct DSU tree structure verification.
- `test_create_complaint_success` / `test_create_complaint_validation_error`: Ingestion validation.
- `test_update_complaint_status` / `test_delete_complaint`: Status transitions.
- `test_bulk_resolve`: Multi-ticket resolution.
- `test_clusters_endpoint_with_similar_and_unrelated`: Full API clustering.
- `test_end_to_end_cluster_and_resolve_flow`: Dynamic recalculation lifecycle.

### 2. Algorithmic Precision, Recall & F1 Benchmarks

Evaluated on the 30-complaint benchmark dataset (`backend/evaluation_dataset.py`):

| Threshold | Discovered Clusters | Precision | Recall | F1 Score | True Positives | False Positives | False Negatives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **0.10** | 5 | **1.000** | **1.000** | **1.000** | 24 | 0 | 0 |
| **0.12 (Default)**| 6 | **1.000** | **0.833** | **0.909** | 20 | 0 | 4 |
| **0.14** | 6 | **1.000** | **0.833** | **0.909** | 20 | 0 | 4 |
| **0.18** | 5 | **1.000** | **0.583** | **0.737** | 14 | 0 | 10 |
| **0.22 (Old)** | 3 | **1.000** | **0.375** | **0.545** | 9 | 0 | 15 |

*Key Finding:* At calibrated thresholds `0.10 - 0.12`, the improved algorithm achieves **1.000 Precision (Zero False Positives)** and up to **1.000 Recall** across diverse, paraphrased campus incidents.

### 3. Latency & Scalability Benchmarks

Measured using `backend/benchmark_performance.py`:

| Number of Complaints ($N$) | Execution Latency | Scalability Rating |
| :--- | :--- | :--- |
| **$N = 50$** | **12.1 ms** | Real-time instantaneous |
| **$N = 100$** | **10.5 ms** | Real-time instantaneous |
| **$N = 250$** | **29.1 ms** | Sub-30ms |
| **$N = 500$** | **86.1 ms** | Well below 200ms target |

---

## 10. Security & Quality Standards

- **Zero Hardcoded Credentials:** No exposed passwords, tokens, or external API keys.
- **SQL Injection Prevention:** 100% parameterized queries via SQLAlchemy ORM.
- **Cross-Site Scripting (XSS) Protection:** Strict React JSX attribute escaping.
- **Input Validation:** Strict Pydantic models with min/max bounds and typed enums.
- **CORS Hardening:** Configured for local development origins (`localhost:5173`, `127.0.0.1:5173`).

---

## 11. Known Limitations & Future Roadmap

- **Cosine Similarity Matrix Scaling:** Pairwise similarity is $O(N^2)$. While responsive for $N \le 2000$ open complaints ($< 250\text{ms}$), datasets exceeding $N > 10,000$ active open tickets would benefit from Approximate Nearest Neighbors (ANN) indexing via FAISS or HNSW.
- **Deep Semantic Paraphrasing:** TF-IDF relies on lexical overlap and n-grams. Tickets describing the same physical issue with completely disjoint vocabularies (e.g., *"monitors blank"* vs *"optoma projector failed"*) require threshold sensitivity tuning or lightweight local embeddings (e.g. `all-MiniLM-L6-v2` via ONNX).
- **Multi-Tenancy:** The current implementation uses a single unified database. Adding organization-level multi-tenancy and JWT authentication would be the next step for enterprise deployment.

---

## 12. License & Academic Attribution

Developed as an open-source, production-quality portfolio and educational reference demonstrating how to combine modern web architecture, deterministic graph algorithms, and explainable natural language processing to solve real-world operational problems.
