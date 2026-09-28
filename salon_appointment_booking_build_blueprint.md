# Salon Appointment Booking System — Build Blueprint

## 1. Product Overview

### Product
A premium, modern appointment booking and salon management web application for a **single salon**.

### Primary goal
Allow customers to discover salon services, select a service/staff/date/time, and book an appointment easily. Give salon admins a dashboard to manage appointments, staff, services, customers, payments, reviews, and business settings.

### Product positioning
- Premium salon experience
- Mobile-first customer booking
- Clean and modern admin dashboard
- Simple enough for an actual salon to use
- Architected cleanly enough to extend to SaaS later

### MVP scope
Customer:
- Home
- Services
- Service details
- Staff
- Booking
- Confirmation
- My appointments
- Appointment details
- Profile
- Authentication
- Reviews

Admin:
- Dashboard
- Appointments
- Calendar
- Customers
- Staff
- Services
- Payments
- Offers/coupons
- Reviews
- Analytics
- Settings

Not in initial MVP:
- Multi-salon SaaS
- Native mobile app
- Payroll
- Inventory/accounting
- AI chatbot
- Complex loyalty system

---

# 2. Target Users

## Customer
A salon customer who wants to:
1. Browse services
2. Check prices/durations
3. Choose a preferred stylist or any available stylist
4. Find an available date/time
5. Book
6. Receive confirmation
7. Manage upcoming appointments
8. Review completed appointments

## Salon Admin
The salon owner/manager who wants to:
1. See today's activity
2. Manage appointments
3. View calendar
4. Manage staff
5. Manage services
6. Manage customers
7. Track payments
8. Manage offers
9. Moderate reviews
10. View basic analytics

## Staff
Optional MVP role. Staff can later:
- View assigned appointments
- See customer details
- Mark appointment completed/no-show
- Manage personal availability

---

# 3. UI/UX Direction

## Visual style

The product should look like a real premium salon product, not a college CRUD project.

Style:
- Minimal
- Premium
- Elegant
- Spacious
- Mobile-first
- High-quality imagery
- Subtle animations
- Strong typography hierarchy
- Rounded cards used selectively
- Avoid excessive gradients and colors

Suggested palette:
- Background: warm off-white
- Primary: near-black/charcoal
- Accent: muted brown/champagne/rose depending on final salon branding
- Success: subtle green
- Warning: subtle amber
- Error: subtle red

Do not hard-code the final colors everywhere. Put design tokens in one location so branding can be changed easily.

## Typography
Use a modern sans-serif for UI. A tasteful display font may be used for hero headings if it remains readable.

## Customer navigation

Desktop:
- Logo
- Services
- Stylists
- About
- Book Now
- Login/Profile

Mobile:
- Home
- Bookings
- Offers
- Profile

## Admin navigation
Sidebar:
- Dashboard
- Appointments
- Calendar
- Customers
- Staff
- Services
- Payments
- Offers
- Reviews
- Analytics
- Settings

---

# 4. Customer Screens

## 4.1 Home

Sections:
1. Navigation
2. Hero
3. Primary CTA: Book Appointment
4. Featured services
5. Meet the experts
6. Why choose us
7. Reviews
8. Location/opening hours
9. Footer

Hero copy should be configurable from admin settings.

## 4.2 Services

Service categories:
- Hair
- Skin
- Nails
- Spa
- Other configurable categories

Each service:
- Name
- Description
- Price
- Duration
- Category
- Image
- Book button

## 4.3 Staff

Staff cards:
- Photo
- Name
- Role
- Short bio
- Services
- Book with this staff member

## 4.4 Booking

Booking flow:

Service -> Staff -> Date -> Time -> Customer Details -> Confirmation

Rules:
- Staff selection is optional
- "Any available staff" is supported
- Availability is calculated dynamically
- Service duration affects available slots
- Working hours, breaks, leaves, holidays, and existing appointments affect availability
- Do not expose unavailable slots as bookable
- Prevent double booking server-side

## 4.5 Confirmation

Show:
- Success state
- Booking ID
- Service
- Staff
- Date
- Time
- Salon
- Amount
- Payment status
- Add to calendar
- View appointment

## 4.6 My Appointments

Tabs:
- Upcoming
- Past
- Cancelled

Appointment card:
- Service
- Staff
- Date/time
- Status
- Amount
- Actions

Actions:
- View
- Reschedule
- Cancel, subject to policy

## 4.7 Profile

Fields:
- Name
- Phone
- Email
- Profile image
- Preferences if needed

---

# 5. Admin Screens

## 5.1 Dashboard

Cards:
- Today's appointments
- Today's revenue
- Total customers
- Pending appointments

Sections:
- Today's schedule
- Recent bookings
- Recent customers
- Revenue/appointment summary

## 5.2 Appointments

Table/list:
- Customer
- Service
- Staff
- Date
- Time
- Amount
- Payment status
- Appointment status
- Actions

Filters:
- Date
- Staff
- Service
- Status
- Payment status

## 5.3 Calendar

Views:
- Day
- Week
- Month

Appointments should be shown against staff schedules.

Clicking an appointment opens details:
- Customer
- Service
- Staff
- Time
- Amount
- Status
- Payment status

Actions:
- Confirm
- Reschedule
- Cancel
- Complete
- Mark no-show

## 5.4 Customers

List:
- Name
- Phone
- Email
- Total visits
- Total spend
- Last visit

Customer detail:
- Profile
- Upcoming appointments
- Appointment history
- Spending summary
- Favorite service if derivable

## 5.5 Staff

CRUD:
- Add
- Edit
- Activate/deactivate
- Profile image
- Name
- Role
- Phone
- Bio
- Services
- Working hours
- Breaks
- Leave

## 5.6 Services

CRUD:
- Name
- Category
- Description
- Price
- Duration
- Image
- Assigned staff
- Active/inactive

## 5.7 Payments

Track:
- Appointment
- Customer
- Amount
- Method
- Status
- Payment reference
- Created date

Initial payment methods:
- Pay at salon
- Online payment

Online payment integration can be added with Razorpay after MVP.

## 5.8 Offers

CRUD:
- Coupon code
- Discount type
- Discount value
- Minimum amount
- Valid from/to
- Usage limit
- Active/inactive

## 5.9 Reviews

Show:
- Customer
- Rating
- Review
- Appointment
- Date
- Moderation status

Only customers with completed appointments should be eligible to review.

## 5.10 Analytics

Initial metrics:
- Appointments per day/week/month
- Revenue
- Completed/cancelled/no-show appointments
- Top services
- Staff appointment counts
- New vs returning customers

## 5.11 Settings

- Salon name
- Logo
- Address
- Phone
- Email
- Opening hours
- Booking rules
- Cancellation policy
- Slot interval
- Payment settings
- Notification settings
- Branding

---

# 6. Appointment Status Model

Appointment status:

- PENDING
- CONFIRMED
- COMPLETED
- CANCELLED
- NO_SHOW

Payment status:

- PENDING
- PAID
- REFUNDED
- FAILED

Keep appointment status and payment status separate.

---

# 7. Core Booking Logic

Availability must NOT be stored as a static list.

It should be calculated from:

1. Salon business hours
2. Staff working hours
3. Staff breaks
4. Staff leave
5. Salon holidays/closures
6. Existing appointments
7. Selected service duration
8. Configured booking slot interval

Example:

Staff:
10:00 AM - 7:00 PM

Break:
1:00 PM - 2:00 PM

Existing appointments:
10:00-10:30
11:30-12:00
3:00-4:00

For a 30-minute service, the backend calculates valid slots.

The server must re-check availability immediately before creating an appointment to prevent race-condition double booking.

---

# 8. Recommended Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

## Backend
Use Next.js server-side capabilities for the MVP:
- Route handlers/server actions
- Server-side validation
- Business logic in service modules

Do not create unnecessary microservices.

## Database
- PostgreSQL
- Supabase as hosted PostgreSQL platform

## Authentication
- Supabase Auth

## Storage
- Supabase Storage for:
  - Salon logo
  - Staff photos
  - Service images
  - Customer avatars if enabled

## Deployment
- Vercel for Next.js
- Supabase for database/auth/storage

## Future integrations
- Razorpay for online payments
- Resend for email
- WhatsApp provider later
- Google Calendar later

---

# 9. Database Schema

## users
- id UUID PK
- email
- role
- created_at
- updated_at

Roles:
- CUSTOMER
- ADMIN
- STAFF

## customers
- id UUID PK
- user_id FK -> users.id
- full_name
- phone
- email
- avatar_url
- created_at
- updated_at

## staff
- id UUID PK
- user_id nullable FK -> users.id
- full_name
- role_title
- bio
- phone
- photo_url
- is_active
- created_at
- updated_at

## service_categories
- id UUID PK
- name
- description
- sort_order
- is_active
- created_at
- updated_at

## services
- id UUID PK
- category_id FK
- name
- description
- price
- duration_minutes
- image_url
- is_active
- created_at
- updated_at

## staff_services
Many-to-many:
- staff_id FK
- service_id FK
- primary key(staff_id, service_id)

## business_hours
- id UUID PK
- day_of_week
- is_open
- open_time
- close_time

## staff_working_hours
- id UUID PK
- staff_id FK
- day_of_week
- is_working
- start_time
- end_time

## staff_breaks
- id UUID PK
- staff_id FK
- day_of_week
- start_time
- end_time

## staff_leaves
- id UUID PK
- staff_id FK
- start_datetime
- end_datetime
- reason

## salon_closures
- id UUID PK
- start_datetime
- end_datetime
- reason

## customers_appointments
Use table name `appointments`.

appointments:
- id UUID PK
- booking_code unique
- customer_id FK
- staff_id nullable FK
- service_id FK
- start_datetime
- end_datetime
- appointment_status
- payment_status
- payment_method
- amount
- notes
- cancellation_reason
- created_at
- updated_at

## appointment_events (recommended)
For audit/history:
- id UUID PK
- appointment_id FK
- event_type
- old_status
- new_status
- metadata JSONB
- created_at

## payments
- id UUID PK
- appointment_id FK
- amount
- method
- status
- provider
- provider_reference
- created_at
- updated_at

## coupons
- id UUID PK
- code unique
- discount_type
- discount_value
- minimum_amount
- valid_from
- valid_until
- usage_limit
- used_count
- is_active
- created_at
- updated_at

## coupon_redemptions
- id UUID PK
- coupon_id FK
- customer_id FK
- appointment_id FK
- discount_amount
- created_at

## reviews
- id UUID PK
- appointment_id FK
- customer_id FK
- rating
- comment
- moderation_status
- created_at
- updated_at

## notifications
- id UUID PK
- user_id FK
- type
- title
- message
- read_at
- created_at

## salon_settings
Single-row/single-salon configuration:
- id UUID PK
- salon_name
- logo_url
- address
- phone
- email
- cancellation_policy
- booking_interval_minutes
- created_at
- updated_at

---

# 10. Important Database Rules

1. Use UUID primary keys.
2. Use foreign keys.
3. Add indexes to frequently queried fields.
4. Store appointment start/end timestamps consistently.
5. Keep appointment and payment status separate.
6. Never trust client-side availability.
7. Re-check availability inside a server-side transaction before booking.
8. Use database constraints/locking where appropriate to prevent overlapping appointments.
9. Use Row Level Security in Supabase.
10. Never expose service-role keys to the browser.
11. Keep secrets in environment variables.
12. Store monetary values safely; avoid floating-point calculations for money.

---

# 11. Application Flow

## Customer booking

```text
Home
  ↓
Services
  ↓
Select Service
  ↓
Select Staff / Any Available
  ↓
Select Date
  ↓
Fetch Available Slots
  ↓
Select Time
  ↓
Login / Signup if required
  ↓
Customer Details
  ↓
Optional Coupon
  ↓
Choose Payment Method
  ↓
Review Booking
  ↓
Server Availability Check
  ↓
Create Appointment Transaction
  ↓
Payment if online
  ↓
Confirmation
  ↓
Notification
```

## Admin appointment flow

```text
Dashboard
  ↓
Appointments / Calendar
  ↓
Open Appointment
  ↓
View Details
  ↓
Confirm / Reschedule / Cancel / Complete / No-show
  ↓
Update appointment
  ↓
Create audit event
  ↓
Send notification if applicable
```

---

# 12. API / Backend Modules

Suggested server modules:

```text
auth
appointments
availability
services
staff
customers
payments
coupons
reviews
notifications
settings
analytics
```

Important endpoints/actions:

### Appointments
- GET appointments
- GET appointment by id
- POST/create appointment
- PATCH/update appointment
- POST/cancel appointment
- POST/reschedule appointment

### Availability
- GET available staff
- GET available slots

### Services
- GET services
- POST service
- PATCH service
- DELETE/deactivate service

### Staff
- GET staff
- POST staff
- PATCH staff
- POST staff availability

### Customers
- GET customers
- GET customer profile
- PATCH customer

### Reviews
- POST review
- GET reviews
- PATCH moderation status

---

# 13. Security

Implement:
- Supabase Auth
- Role-based authorization
- Row Level Security
- Server-side validation with Zod
- Secure environment variables
- No service-role key in frontend
- Input sanitization/validation
- Rate limiting for sensitive endpoints where appropriate
- Server-side booking availability validation
- Authorization checks on every admin operation

Roles must not be trusted from client-provided values.

---

# 14. Implementation Phases

## Phase 0 — Project setup
- Create Next.js project
- TypeScript
- Tailwind
- shadcn/ui
- Supabase project
- Environment variables
- Folder structure
- Basic design system

## Phase 1 — Database/Auth
- Create schema
- Relationships
- RLS
- Seed demo data
- Authentication
- Role handling

## Phase 2 — Customer UI
- Home
- Services
- Staff
- Authentication
- Profile
- Responsive navigation

## Phase 3 — Booking engine
- Service selection
- Staff selection
- Date selection
- Availability calculation
- Slot selection
- Booking transaction
- Confirmation

## Phase 4 — Customer appointment management
- Upcoming appointments
- Past appointments
- Appointment detail
- Cancel/reschedule
- Notifications

## Phase 5 — Admin dashboard
- Dashboard
- Appointment list
- Calendar
- Appointment actions

## Phase 6 — Admin management
- Customers
- Staff
- Staff schedules
- Services
- Categories
- Settings

## Phase 7 — Payments/offers/reviews
- Payment tracking
- Coupon system
- Reviews
- Basic notification system

## Phase 8 — Analytics
- Revenue
- Appointments
- Customers
- Service performance
- Staff performance

## Phase 9 — Testing/polish
- Mobile testing
- Booking edge cases
- Double-booking tests
- Authorization tests
- Loading/error/empty states
- Accessibility
- Performance
- Production deployment

---

# 15. Cursor Development Rules

When using Cursor:

1. Build incrementally.
2. Do not generate the entire application in one giant change.
3. Read existing files before modifying them.
4. Reuse components.
5. Keep business logic out of UI components.
6. Use TypeScript strictly.
7. Validate forms with Zod.
8. Keep database queries in server-side modules.
9. Never put secrets in client code.
10. Add loading, error, and empty states.
11. Make all customer pages responsive.
12. Do not use fake availability logic in production code.
13. Do not duplicate business logic.
14. Keep components small and reusable.
15. After each feature, run lint/type checks and fix errors.
16. Do not change unrelated files.
17. Prefer simple architecture over unnecessary abstraction.
18. Use realistic seed data for development.
19. Explain important architectural decisions in code comments only where useful.
20. Before implementing a major feature, inspect the current project structure and existing patterns.

---

# 16. Definition of Done

The MVP is done when:

### Customer
- Customer can register/login
- Browse services
- Browse staff
- Select service
- Select staff or any available staff
- Select date/time
- See only valid slots
- Book appointment
- Receive confirmation
- View appointments
- Cancel/reschedule according to policy
- Submit review after completed appointment

### Admin
- Admin can login
- View dashboard
- View/manage appointments
- Use calendar
- Manage services
- Manage staff
- Manage schedules
- Manage customers
- Manage payments
- Manage offers
- Moderate reviews
- Configure salon settings

### System
- Prevents double booking
- Uses server-side availability validation
- Uses PostgreSQL/Supabase
- Uses RLS
- Is responsive
- Handles loading/error/empty states
- Has no exposed secrets
- Can deploy to Vercel

---

# 17. Cursor Master Prompt

Copy the following prompt into Cursor at the beginning of the project:

---

You are the senior full-stack engineer responsible for building a production-quality single-salon appointment booking and management system.

## Product

Build a premium, modern, mobile-first salon appointment booking web application.

This is for ONE salon, not a multi-salon SaaS.

The application has:
1. Customer-facing website
2. Admin dashboard
3. Optional staff role foundation

## Tech stack

Use:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- React Hook Form
- Zod

Deployable to Vercel.

Do not introduce unnecessary technologies.

## Design direction

The UI must feel like a premium real-world salon product.

Visual direction:
- Minimal
- Elegant
- Premium
- Spacious
- Modern
- Mobile-first
- Strong typography
- High-quality imagery
- Subtle animations
- Warm off-white background
- Near-black primary text
- One configurable accent color

Avoid:
- Generic Bootstrap appearance
- Excessive gradients
- Excessive shadows
- Too many colors
- Huge unnecessary animations
- Cluttered dashboards

Build reusable components and a consistent design system.

## Customer features

Implement:

Home:
- Hero
- Book Appointment CTA
- Featured services
- Staff
- Why choose us
- Reviews
- Location/hours
- Footer

Services:
- Categories
- Service cards
- Service detail
- Price
- Duration
- Description
- Book button

Staff:
- Staff cards
- Profile
- Services
- Book with staff

Booking:
1. Select service
2. Select staff or any available
3. Select date
4. Calculate available slots
5. Select time
6. Login/signup if needed
7. Customer details
8. Coupon
9. Payment method
10. Review
11. Confirm
12. Confirmation page

Appointments:
- Upcoming
- Past
- Cancelled
- Appointment details
- Cancel
- Reschedule

Profile:
- Name
- Phone
- Email
- Avatar

Reviews:
- Customer can review only completed appointments

## Admin features

Dashboard:
- Today's appointments
- Revenue
- Customer count
- Pending appointments
- Today's schedule
- Recent bookings

Appointments:
- List
- Filters
- Details
- Confirm
- Cancel
- Reschedule
- Complete
- No-show

Calendar:
- Day
- Week
- Month
- Staff-based schedule

Customers:
- List
- Profile
- History
- Visits
- Spend

Staff:
- CRUD
- Services
- Working hours
- Breaks
- Leaves
- Active/inactive

Services:
- CRUD
- Category
- Price
- Duration
- Description
- Image
- Assigned staff
- Active/inactive

Payments:
- Pay at salon
- Online payment foundation
- Payment status

Offers:
- Coupon CRUD
- Discount
- Validity
- Usage limits

Reviews:
- List
- Moderation

Analytics:
- Revenue
- Appointments
- Top services
- Staff performance
- New/returning customers

Settings:
- Salon information
- Opening hours
- Booking rules
- Cancellation policy
- Branding

## Database

Use PostgreSQL through Supabase.

Tables:

users
customers
staff
service_categories
services
staff_services
business_hours
staff_working_hours
staff_breaks
staff_leaves
salon_closures
appointments
appointment_events
payments
coupons
coupon_redemptions
reviews
notifications
salon_settings

Use UUID primary keys and proper foreign keys.

Use indexes for important queries.

Use Row Level Security.

Never expose the Supabase service-role key to the browser.

## Appointment logic

This is critical.

Do NOT store availability as a static list.

Calculate availability using:

- Salon business hours
- Staff working hours
- Staff breaks
- Staff leaves
- Salon closures
- Existing appointments
- Service duration
- Booking interval

The client may display slots, but the server MUST recalculate and validate availability before creating an appointment.

Prevent double booking using proper database transaction/locking/constraint strategy.

Example:

Staff working:
10:00–19:00

Break:
13:00–14:00

Existing appointments:
10:00–10:30
11:30–12:00
15:00–16:00

A 30-minute service should only show valid slots.

Different service durations must produce different availability.

## Appointment statuses

PENDING
CONFIRMED
COMPLETED
CANCELLED
NO_SHOW

Payment statuses:

PENDING
PAID
REFUNDED
FAILED

Keep these separate.

## Security

Implement:
- Supabase Auth
- Role-based authorization
- RLS
- Server-side Zod validation
- Secure environment variables
- Authorization on every admin operation
- No secrets in frontend
- Server-side booking validation

Never trust role/status/price values supplied by the client.

## Architecture

Use a clean modular structure.

Keep:
- UI components
- Server logic
- Database access
- Validation
- Business rules

reasonably separated.

Do not create microservices.

Use server-side Next.js capabilities for the backend.

Do not over-engineer.

## UX requirements

Every important page needs:
- Loading state
- Error state
- Empty state
- Success feedback
- Mobile responsiveness

Forms should have:
- Validation
- Helpful error messages
- Disabled/loading submit states

Booking should clearly show:
- Service
- Staff
- Date
- Time
- Duration
- Price
- Payment status

## Development process

IMPORTANT:

Do NOT build the whole project in one response/change.

Work phase by phase.

Before implementing a phase:
1. Inspect the existing project.
2. Explain what files you plan to create/change.
3. Implement only that phase.
4. Run type checking/linting.
5. Fix errors.
6. Summarize what changed.
7. Wait for the next instruction.

Do not modify unrelated files.

If a requirement is ambiguous, ask before making a major architectural decision.

Prefer simple, maintainable code.

Use realistic demo data for development.

## First task

Do NOT start implementing the full application immediately.

First:
1. Inspect the repository.
2. Tell me the current project structure.
3. Identify whether a Next.js/React project already exists.
4. Identify existing dependencies.
5. Identify existing Supabase configuration.
6. Propose the folder structure for this application.
7. Propose the implementation phases.
8. List the files you expect to create in Phase 1.

Do not make major code changes until I approve the plan.

---

# 18. Recommended Cursor Build Order

After Cursor accepts the master prompt, build in this order:

1. Repository/project inspection
2. Next.js + UI foundation
3. Supabase connection
4. Database migrations/schema
5. Auth + roles
6. Seed/demo data
7. Customer home/services/staff
8. Availability engine
9. Booking flow
10. Customer appointments
11. Admin dashboard
12. Admin calendar
13. Staff/service management
14. Customers
15. Payments
16. Offers
17. Reviews
18. Notifications
19. Analytics
20. Security/RLS audit
21. Testing
22. Deployment

Do not skip the availability engine or server-side double-booking protection.

---

# 19. First Milestone

The first usable milestone should be:

Customer can:

Home
-> Services
-> Select service
-> Select staff
-> Select date
-> See real availability
-> Select time
-> Login
-> Confirm booking
-> See confirmation

Admin can:

Login
-> Dashboard
-> See appointment
-> Open appointment
-> Confirm/complete/cancel

Once this works reliably, expand the rest of the system.
