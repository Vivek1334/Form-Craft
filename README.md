# FormCraft | Dynamic Survey & Quiz Builder

> [!CAUTION]
> ### 🛑 Reading & Demo Purpose Only
> This repository is published for viewing and demonstration purposes only. Copying, reproducing, redistributing, or reusing any part of this codebase, structure, or styles without explicit written permission from the owner (Vivek1334) is strictly prohibited.

FormCraft is a modern, minimalist web application built with **Spring Boot** and **Vanilla Javascript/CSS** to construct interactive surveys and quizzes, compile response submissions, and view visual analytics in real-time.

Live Server URL: **[https://survey-builder-ll65.onrender.com](https://survey-builder-ll65.onrender.com)**

---

## 🌟 Key Features

- **Dynamic Survey Builder**: Add, remove, and configure multiple-choice or short-answer questions dynamically on a drag-and-drop feeling layout.
- **Clean Questionnaire UI**: An optimized form-taking interface (`take.html`) utilizing solid-card grid alignments and modern micro-interactions.
- **Live Response Analytics**: Visual, real-time percentage-distribution results pages (`results.html`) displaying responses immediately as they are submitted.
- **Modern Minimalist Aesthetics**: Built using the *Inter* font, crisp zinc borders, glassmorphic panels, and floating backdrop watermark graphics with 8% opacity.
- **Cloud Database Integration**: Auto-swaps between a local H2 file database during development and a robust **PostgreSQL** database in production.
- **Dockerized Architecture**: Pre-configured with a multi-stage `Dockerfile` and `render.yaml` blueprints for automated, zero-configuration cloud hosting.

---

## 🛠️ Technology Stack

- **Backend**: Spring Boot 3.3.0, Spring Data JPA, Hibernate, PostgreSQL Driver, H2 Database
- **Frontend**: HTML5, Vanilla CSS3 (Flexbox/Grid), Vanilla JS, FontAwesome (icons), Google Fonts (Inter)
- **Containerization & Hosting**: Docker, Render.com Blueprints

---

## 💻 Local Setup & Installation

### Prerequisites
- **Java JDK 21** installed on your system.
- Git (optional, for cloning).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Vivek1334/Form-Craft.git
   cd Form-Craft
   ```

2. **Setup Maven Wrapper**:
   If Maven is not installed globally, execute the setup script (Windows PowerShell) to download a local portable Maven:
   ```powershell
   .\setup.ps1
   ```

3. **Run the Application**:
   ```powershell
   .\.maven\bin\mvn spring-boot:run
   ```
   Open your browser and visit: **[http://localhost:8080](http://localhost:8080)**

---

## ☁️ Cloud Deployment (Render.com)

This project contains a `render.yaml` Blueprint file, which handles deployment automatically.

1. Log in to [Render.com](https://render.com).
2. Click **New +** and select **Blueprint**.
3. Link this GitHub repository (`Form-Craft`).
4. Render will read `render.yaml` and set up the PostgreSQL database and web service automatically.
5. Click **Apply** to deploy!
