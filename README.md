# Hostel Management System

A browser-based hostel management app built with HTML, CSS and JavaScript. It is the web version of a C console project that manages students, rooms and fees.

## Features

**Landing page**: introduction with Student login and Admin login.

**Student portal** (sign in with student ID and PIN)
- View room availability and request a free room
- See allocated room, fee paid and fee due
- Raise complaints and track their status
- Read notices from the warden, change PIN

**Admin portal**
- Overview with totals, occupancy, course and fee-status charts, activity log
- Add, edit, search, filter, sort, vacate, delete students and reset PINs
- Approve or reject room requests
- Room grid with the option to block rooms for maintenance
- Record fee payments and filter by paid, partial or unpaid
- Resolve complaints and post notices
- Settings: hostel fee, admin password, backup and restore, demo data, reset

## Extra features

- Smart allocate: places roomless students automatically, grouping course mates together
- Gate pass: students request time out, the warden approves, rejects or marks returned, overdue passes are flagged
- Printable fee receipts and payment history for students and the warden
- Overview donut chart for fee collection and plain-language smart insights
- Export students as CSV, light and dark theme toggle

## Rules

- 20 rooms, numbered 101 to 120
- Maximum 2 students per room
- Student IDs must be unique

## Run it

Open `index.html` in any browser. No build step or server needed.

## Demo logins

- Admin: username `admin`, password `1234`
- Students: go to Admin > Settings > Load demo students, then sign in with ID `1001` and PIN `1001`. A new student's PIN is their ID until they change it.

## Files

- `index.html`: page structure (launch page, login, student portal, admin portal)
- `style.css`: styling, light and dark themes, responsive layout
- `script.js`: login, validation, room logic, fees, localStorage

## Limitations

Data is stored in the browser's `localStorage`, so it is per browser and per device. Login is client-side and meant for demonstration only. A production system would need a server-side backend, a database and hashed credentials.
