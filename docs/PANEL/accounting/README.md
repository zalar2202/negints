# Accounting & Finance Documentation

This application includes a comprehensive accounting system for managing invoices, tracking expenses, and monitoring financial health.

## Overview

The Accounting module (`/panel/admin/accounting`) provides a unified view of the company's financials, including:
- **Income (Invoices):** Track payments from clients.
- **Expenses:** Record operational costs (server, marketing, salaries).
- **Net Profit:** Real-time calculation of revenue minus expenses.
- **Profit Margin:** Percentage tracking of profitability.

---

## 1. Invoices & Payments

The system supports a full payment lifecycle, including partial payments and installment plans.

### Key Features
- **Dynamic Statuses:**
  - `Draft`: Not yet visible to client.
  - `Sent`: Issued to client (waiting for payment).
  - `Partially Paid`: Down payment received, remaining balance active.
  - `Paid`: Fully settled.
  - `Overdue`: Past due date.
- **Installment Plans:**
  - Support for **Down Payments** + **Deferred Installments**.
  - Invoices dynamically update labels based on status (e.g., "Down Payment Due" -> "Remaining Balance Due").
- **PDF & Email:**
  - Branded PDF generation.
  - Automated emails with "Pay Now" links and status-aware payment details.

### Workflow Example
1. **Create Invoice:** Set total ($300), Down Payment ($120). Status: `Pending`.
2. **Send:** Client receives email requesting $120.
3. **Receive Payment:** Update status to `Partially Paid`.
4. **Resend:** Client receives updated email requesting remaining $180.
5. **Finalize:** Update status to `Paid` upon final settlement.

---

## 2. Expense Tracking

Located in the **Expenses** tab of the accounting dashboard. Used to track all business outflows.

### Features
- **Categories:** Hosting, Domain, Software, Marketing, Salary, Office, Other.
- **Recurring Expenses:** Mark items as Monthly or Yearly recurring cost.
- **Status:** Track `Paid` vs `Pending` expenses.
- **Notes:** Add context to expenses.

---

## 3. Financial Metrics

The dashboard automatically calculates:

| Metric | Formula | Description |
| :--- | :--- | :--- |
| **Total Revenue** | `Sum(Paid Invoices)` | Only fulfilled payments count towards revenue. |
| **Total Expenses** | `Sum(Paid Expenses)` | Only paid costs are deducted. |
| **Net Profit** | `Revenue - Expenses` | Real cash-in-hand profit. |
| **Profit Margin** | `(Net Profit / Revenue) * 100` | Efficiency indicator. |
| **Outstanding** | `Sum(Sent/Partial/Overdue)` | Expected future income. |
