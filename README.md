# Unified Banking System - Full-Stack Bank Aggregator Portal

A full-stack banking portal that simulates a **multi-bank aggregation platform**.
Backend: **Spring Boot (Java)** · Frontend: **React + Vite** · Database: **MySQL**

---

## Features Overview

### Architecture & User Experience

* **Multi-Bank Aggregation:** Users register once and can link/manage accounts from multiple simulated banks (ICICI, HDFC, etc.).
* **Modern UI:** Custom-designed with glassmorphism, navy/blue gradients, and Inter font.
* **Dashboard:** Account balances, deposits, and recent transactions.
* **Page flow:** Register → PIN setup → Login → Dashboard → Transfer / Bills / Cards / Loans / Profile.

### Security & Authentication

| Feature                      | Description                                                          |
| ---------------------------- | -------------------------------------------------------------------- |
| **JWT Authentication**       | Stateless Spring Security + JSON Web Tokens                          |
| **Encrypted PIN Setup**      | 4-digit PIN created post-registration and stored securely            |
| **PIN Re-Verification**      | Required for fund transfer and bill payment                          |
| **Recipient Verification**   | Validates account number and displays recipient name before transfer |

### Core Banking Functionalities

* Transactions: Deposit, Transfer (with PIN), Bill Payment (with PIN).
* Debit Card Management: view details, CVV on demand, freeze, online / international toggles.
* Loan Application: submit a loan request from a linked account.
* Activity Log, Profile & Settings, Account Linking, Statement CSV download.

---

## Project Structure

```
/
├── banking frontend/             # React + Vite UI
│   ├── src/pages/
│   ├── src/api/api.js
│   └── vite.config.js            # Proxies /api → http://localhost:8080
│
├── src/main/java/com/example/bankingapp/
│   ├── config/                   # Spring Security configuration
│   ├── controller/               # REST API controllers
│   ├── dto/                      # Data Transfer Objects
│   ├── model/                    # JPA Entities
│   ├── repository/
│   ├── security/                 # JWT and UserDetails logic
│   └── service/
│
├── src/main/resources/application.properties   # MySQL + JWT settings
├── pom.xml
└── README.md
```

---

## Tech Stack

| Layer           | Technology                                                     |
| --------------- | -------------------------------------------------------------- |
| **Backend**     | Spring Boot 3, Java 17+, Spring Security (JWT), Spring Data JPA, Lombok |
| **Frontend**    | React 18, Vite, Axios, Framer Motion, Recharts                 |
| **Database**    | MySQL 8                                                        |
| **Other Tools** | Maven Wrapper (`mvnw`), Bootstrap Icons                        |

---

## Getting Started (any PC)

### Prerequisites

* **Java JDK 17+** (`java -version`)
* **Node.js 18+** (`node -v`)
* **MySQL Server** running
* Git (optional)

The repo includes Maven Wrapper, so a global Maven install is **not** required.

---

### 1. Clone / copy the project

```bash
git clone <your-repository-url>
cd <your-repository-folder>
```

Or copy the whole folder to the other PC.

---

### 2. Create the MySQL database

Open MySQL (Workbench, command line, or XAMPP) and run:

```sql
CREATE DATABASE IF NOT EXISTS banking_db;
```

Tables are created automatically on first backend start (`spring.jpa.hibernate.ddl-auto=update`).

---

### 3. Set YOUR MySQL username and password

On a different PC the MySQL password will almost certainly be different. Use **one** of these options.

#### Option A — Edit `application.properties` (simplest)

Open `src/main/resources/application.properties` and change:

```properties
spring.datasource.url=${MYSQL_URL:jdbc:mysql://localhost:3306/banking_db?createDatabaseIfNotExist=true}
spring.datasource.username=${MYSQL_USER:root}
spring.datasource.password=${MYSQL_PASSWORD:YOUR_MYSQL_PASSWORD}
```

Replace `YOUR_MYSQL_PASSWORD` with the password for **this PC**.

If your MySQL user is not `root`, change `MYSQL_USER:root` to `MYSQL_USER:your_user`.

If MySQL is not on localhost or uses another port (e.g. 3307):

```properties
spring.datasource.url=${MYSQL_URL:jdbc:mysql://localhost:3307/banking_db?createDatabaseIfNotExist=true}
```

#### Option B — Environment variables (no file edit)

**Windows PowerShell (this session only):**

```powershell
$env:MYSQL_USER = "root"
$env:MYSQL_PASSWORD = "your_mysql_password"
$env:MYSQL_URL = "jdbc:mysql://localhost:3306/banking_db?createDatabaseIfNotExist=true"
```

**Windows Command Prompt:**

```bat
set MYSQL_USER=root
set MYSQL_PASSWORD=your_mysql_password
set MYSQL_URL=jdbc:mysql://localhost:3306/banking_db?createDatabaseIfNotExist=true
```

**Mac / Linux:**

```bash
export MYSQL_USER=root
export MYSQL_PASSWORD='your_mysql_password'
export MYSQL_URL='jdbc:mysql://localhost:3306/banking_db?createDatabaseIfNotExist=true'
```

Then start the backend **in the same terminal**.

---

### 4. Run the backend (port 8080)

From the project root:

**Windows:**

```powershell
.\mvnw.cmd spring-boot:run
```

**Mac / Linux:**

```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Wait until you see something like `Started BankingappApplication`.

API: [http://localhost:8080](http://localhost:8080)

If it fails with `Access denied for user`: the MySQL username/password is wrong — go back to step 3.

If port 8080 is already in use, stop the other program or change `server.port` in `application.properties`.

---

### 5. Run the frontend (port 5173)

Open a **second terminal**:

```powershell
cd "banking frontend"
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

Vite proxies `/api` to `http://localhost:8080`, so the backend must be running.

---

### 6. Use the app

1. Open [http://localhost:5173/register](http://localhost:5173/register)
2. Register (password at least 6 characters)
3. Set a 4-digit PIN
4. You land on the Dashboard — click **Add Bank Account** to link ICICI / HDFC / etc.
5. Then use Transfer, Pay Bills, Cards, Loans, Transactions, Profile

---

## Quick troubleshooting

| Problem | Fix |
| --- | --- |
| `Access denied for user 'root'@'localhost'` | Wrong MySQL password — update `MYSQL_PASSWORD` or `application.properties` |
| `Communications link failure` | MySQL is not running — start the MySQL service |
| Frontend: "Cannot connect to server" | Backend is not running on port 8080 |
| `Port 8080 already in use` | Stop the old Java process or change `server.port` |
| Blank page / 404 on refresh | Use the Vite URL `http://localhost:5173`, not a file:// path |
| Lombok compile errors in IDE | Install the Lombok plugin; command-line `mvnw` still works |

---

## Future Enhancements

* AI-based expense categorization
* Email & SMS notifications
* Integration with real bank APIs (e.g. Razorpay Sandbox)

---

## License

This project is released under the **MIT License**.
