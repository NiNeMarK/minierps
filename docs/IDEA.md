# IDEA.md
# MiniERP - Product Idea & Vision

> Version: 1.0
> Tech Stack: Next.js + Neon Postgres + Drizzle + Better Auth
> (เอกสารนี้เป็น idea ตั้งต้น; รายละเอียด stack ปัจจุบันดู README.md)
> Target: SME / ร้านอาหาร / คาเฟ่ / ร้านค้าปลีก / ร้านบริการ
> Architecture: Modular ERP

---

# Vision

สร้างระบบ MiniERP ที่มีความง่ายในการใช้งาน แต่สามารถขยายเป็น ERP เต็มรูปแบบได้ในอนาคต

ระบบต้องสามารถเปิด/ปิด Module ได้
รองรับธุรกิจหลายประเภทโดยไม่ต้องแก้ไข Source Code มาก

เป้าหมายคือ

- ใช้งานง่าย
- Deploy ง่าย
- Cloud Native
- Mobile Friendly
- รองรับหลายสาขา
- รองรับหลายผู้ใช้งาน
- สามารถเพิ่ม Module ได้ในอนาคต

---

# Core Principles

## 1. Modular

ทุก Module แยกอิสระ

ตัวอย่าง
Inventory
Sales
Purchase
CRM
Accounting
POS


สามารถเปิดใช้งานเฉพาะ Module ที่ต้องการ

---

## 2. Configuration First

ทุกอย่างควรถูกตั้งค่าผ่านหน้า Admin

เช่น

- VAT
- Currency
- Warehouse
- Printer
- Prefix Running Number
- Unit
- Category
- Tax
- Discount

ไม่ Hardcode

---

## 3. Low Code Configuration

ผู้ดูแลระบบสามารถ

- เพิ่มฟิลด์
- เปลี่ยน Workflow
- ตั้งค่าเอกสาร

โดยไม่ต้องแก้ไข Code

---

## 4. Multi Business

รองรับ

- ร้านอาหาร
- คาเฟ่
- ร้านกาแฟ
- ร้านเครื่องดื่ม
- ร้านขายยา
- ร้านวัสดุก่อสร้าง
- ร้านค้าปลีก
- ร้านเสริมสวย
- ร้านซ่อม
- โรงงานขนาดเล็ก
- บริษัทบริการ

---

## 5. Mobile First

ทุกหน้าต้องรองรับ

- Desktop
- Tablet
- Mobile

---

# Technology

## Frontend

- Next.js 15
- React
- TypeScript
- TailwindCSS
- Shadcn UI
- TanStack Query
- React Hook Form
- Zod

---

## Backend

ใช้ Next.js Route Handler

app/api/*


สำหรับ API

Business Logic แยกออกเป็น


/services
/repositories
/lib


---

## Database

Supabase

ใช้

- PostgreSQL
- Row Level Security (RLS)
- Auth
- Storage
- Edge Functions (ถ้าจำเป็น)
- Realtime

---

## Authentication

Supabase Auth

รองรับ

- Email
- Google
- Github

อนาคต

- Line Login
- Microsoft

---

## Deployment

- Vercel
- Supabase

---

# Architecture
UI

↓

Components

↓

Feature

↓

Service

↓

Repository

↓

Supabase


---

# Design Philosophy

หน้าจอทุกหน้าควรมี

- Search
- Filter
- Sort
- Pagination
- Export
- Import

---

# Dashboard

Dashboard ต้องแสดง

- Today's Sales
- Monthly Sales
- Profit
- Expense
- Stock Alert
- Pending Orders
- Low Stock
- Best Seller
- Recent Activities

---

# Master Data

- Company
- Branch
- Warehouse
- Customer
- Supplier
- Employee
- User
- Role
- Permission
- Unit
- Category
- Product
- Tax
- Payment Method

---

# Sales Module

ประกอบด้วย

- Quotation
- Sales Order
- Invoice
- POS
- Payment
- Return
- Credit Note

---

# Purchase Module

- Purchase Request
- Purchase Order
- Goods Receive
- Purchase Invoice
- Supplier Payment
- Return

---

# Inventory

- Stock
- Stock Movement
- Transfer
- Adjustment
- Cycle Count
- Lot
- Expire Date
- Barcode

---

# POS

รองรับ

- Touch Screen
- Barcode
- QR Payment
- Cash
- Credit Card
- PromptPay
- Receipt

---

# CRM

- Customer
- Point
- Coupon
- Promotion
- Campaign
- Member

---

# Finance

เบื้องต้น

- Income
- Expense
- Cash Flow
- Daily Closing

อนาคต

- GL
- AP
- AR

---

# Reports

รายงานทั้งหมด Export ได้

รองรับ

- Excel
- PDF
- CSV

ตัวอย่าง

- Sales Report
- Product Report
- Customer Report
- Inventory Report
- Profit Report
- Purchase Report

---

# Notification

รองรับ

- Email
- Browser Notification

อนาคต

- LINE Notify
- LINE OA
- Telegram

---

# Workflow Engine

เอกสารทุกตัวควรมี Status

เช่น

Draft

↓

Pending

↓

Approved

↓

Completed

↓

Cancelled

สามารถกำหนด Workflow ได้

---

# Permission

RBAC

Role

↓

Permission

↓

Menu

↓

Action

Action เช่น

- View
- Create
- Edit
- Delete
- Approve
- Export

---

# Audit Log

ทุกการแก้ไขต้องถูกบันทึก

เก็บ

- User
- เวลา
- IP
- Action
- Old Value
- New Value

---

# File Management

เก็บไฟล์บน

Supabase Storage

รองรับ

- รูปภาพ
- PDF
- Excel
- Word

---

# Search Engine

Global Search

ค้นหาได้จาก

- Product
- Customer
- Invoice
- Purchase
- Supplier

---

# Barcode

รองรับ

- Barcode
- QRCode

---

# Multi Branch

รองรับหลายสาขา

ข้อมูลสามารถ

- แยกตามสาขา
- รวมทุกสาขา

---

# Multi Warehouse

รองรับหลายคลัง

---

# Localization

รองรับ

- ไทย
- English

---

# Theme

- Light
- Dark

---

# KPI

Dashboard KPI

- Sales
- GP
- Margin
- Cost
- Profit
- Stock Turnover
- Customer Growth

---

# Automation

อนาคต

- Auto Purchase
- Auto Stock Alert
- Auto Email
- Auto Invoice

---

# AI Features (Future)

- Sales Forecast
- Demand Forecast
- Chat Assistant
- Auto Report Summary
- OCR Invoice
- AI Product Suggestion

---

# Integration

รองรับ

- LINE OA
- Facebook
- Shopee
- Lazada
- TikTok Shop
- Stripe
- Omise
- PromptPay
- Google Calendar
- Google Sheets

---

# Non Functional Requirements

- Responsive
- Fast
- Secure
- Scalable
- Offline Cache (บางส่วน)
- SEO (Public Pages)
- Accessibility
- Clean Code
- Reusable Component
- Modular Architecture
- Testable
- CI/CD Ready

---

# Project Structure (High Level)

apps/
web/

docs/

supabase/
migrations/
seed.sql

src/
app/
components/
features/
hooks/
services/
repositories/
lib/
types/
schemas/
utils/
constants/
stores/

public/


---

# MVP Priority

Phase 1

- Authentication
- Dashboard
- Product
- Customer
- Supplier
- Sales
- Purchase
- Inventory
- User
- Permission

Phase 2

- POS
- CRM
- Promotion
- Reports
- Notification

Phase 3

- Accounting
- Workflow
- Automation
- AI
- Integration

---

# Long-term Goal

MiniERP ไม่ใช่เพียงระบบจัดการร้านค้า แต่เป็นแพลตฟอร์ม ERP แบบ Modular ที่สามารถรองรับธุรกิจ SME ได้หลากหลายประเภท โดยมีโครงสร้างที่ยืดหยุ่น ขยายความสามารถได้ และพร้อมเชื่อมต่อกับบริการภายนอกเพื่อรองรับการเติบโตของธุรกิจในอนาคต