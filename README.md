# MagneticMemory V7: Quantum Data Integrity (QDI) Audit Core

![Status](https://img.shields.io/badge/Status-Production--Ready-emerald)
![Engine](https://img.shields.io/badge/Engine-MMV7--PRO-blue)
![Scientific](https://img.shields.io/badge/Protocol-IEEE--P2847-amber)

**MagneticMemory V7** is a high-fidelity diagnostic dashboard and simulation engine designed to verify the integrity of quantum datasets. It serves as a rigorous gatekeeper against "quantum-washing" and data spoofing by combining semantic analysis with physical plausibility verification.

---

## 🚀 Quick Start Guide

Follow these steps to deploy the diagnostic dashboard on your local machine:

### 1. Prerequisites
Ensure you have the following installed:
*   **Node.js** (Version 18.0 or higher)
*   **NPM** (Node Package Manager)
*   **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/) (Required for semantic inference).

### 2. Installation
Open your terminal and execute the following commands:

```bash
# Clone the repository
git clone https://github.com/harihardiyan/magnetic-memory-v7-audit-core.git

# Navigate to the project directory
cd magnetic-memory-v7-audit-core

# Install required dependencies
npm install
```

### 3. API Configuration
The application utilizes the Gemini 3 Pro engine for intelligent data auditing.
1.  Create a file named `.env` in the root directory.
2.  Add your API key to the file:
    ```env
    VITE_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```

### 4. Launching the Dashboard
Start the development server:
```bash
npm run dev
```
Once started, the terminal will provide a local URL (typically `http://localhost:5173`). Open this link in your web browser.

---

## 🔬 Scientific Overview

In the current **NISQ (Noisy Intermediate-Scale Quantum)** era, data integrity is paramount. Researchers often struggle to distinguish high-entropy physical noise from structured quantum states. MagMem V7 addresses this challenge through a dual-verdict audit protocol:

1.  **Numerical Plausibility Gate:** Analyzes probability distributions, variance, and Hilbert space dimensionality ($2^N$) to ensure the data adheres to the fundamental laws of quantum mechanics.
2.  **Semantic Guardrails:** Cross-references metadata terminology against statistical reality to detect "keyword stuffing" or adversarial data spoofing attempts.

## 🛠 Technical Stack

- **Core Framework:** React 19 + TypeScript
- **Inference Engine:** Gemini 3 Pro Vision via Google GenAI SDK
- **Data Visualization:** Recharts + Tailwind CSS for high-density telemetry
- **Quantum Simulator:** Custom 6-Qubit Hilbert Space Engine (64-dimensional complex mapping)

## 📊 Audit Methodology

The engine calculates a **P-Value Null-Acc Gain** by comparing observed training accuracy against a generated null distribution (label shuffling). An experiment is only categorized as **VALID** if:
- `Domain Confidence >= 0.8`
- `P-Value < 0.05`
- `Physical Range Match == TRUE` (Data must not contain non-physical values or absurd outliers)

## 📖 Citation

If you utilize this tool in your research, please use the following BibTeX entry:

```bibtex
@software{magmem_v7,
  author = {Hari Hardiyan},
  title = {MagneticMemory V7: Quantum Data Integrity Dashboard},
  year = {2025},
  url = {https://github.com/harihardiyan/magnetic-memory-v7-audit-core},
  version = {7.0.2-PRO}
}
```

---

## 👨‍💻 Author

**Hari Hardiyan**  
📧 [lorozloraz@gmail.com](mailto:lorozloraz@gmail.com)  
*Lead Engineer - MagneticMemory Research Group*

---
*Disclaimer: This dashboard provides simulated diagnostic results for research and educational purposes. Always verify critical data against hardware-level benchmarks.*
