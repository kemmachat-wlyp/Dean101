# Vintage Inventory System

A complete MVP web application for internal back-office use of a vintage clothing shop. This system helps manage inventory, track sales, and calculate profits for a vintage clothing business.

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: Cookie-based session authentication
- **File Storage**: Local filesystem storage

## Features

- **Authentication**: Secure login for admin user
- **Dashboard**: Overview of key metrics and statistics
- **Inventory Management**: Create, read, update, and delete inventory items
- **Item Details**: Comprehensive view of item information including photos and measurements
- **Photo Upload**: Upload and manage photos for items
- **Sales Recording**: Record sales with platform, fees, and profit calculation
- **Search & Filter**: Easily find items by various criteria
- **Responsive Design**: Works on desktop and mobile devices

## Folder Structure

```
.
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── inventory/         # Inventory pages
│   ├── login/             # Login page
│   ├── sales/             # Sales pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to dashboard)
├── prisma/                # Prisma schema and migrations
├── public/                # Static files and uploads
│   └── uploads/           # Uploaded item photos
├── .env.example           # Environment variables example
├── package.json           # Project dependencies
└── README.md              # This file
```

## Initial Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma client**
   ```bash
   npm run prisma:generate
   ```

3. **Run database migrations**
   ```bash
   npm run prisma:migrate
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

## Running the Application

### First Time Setup
If this is your first time running the application, follow the Initial Setup steps above, then:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Restarting the Application
If you've previously set up the application and just want to restart it:

```bash
npm run dev
```

The application will be available at `http://localhost:3000` (or the next available port if 3000 is in use)

### Production Mode
To run in production mode:

```bash
npm run build
npm start
```

## Default Login Credentials

- **Username**: admin
- **Password**: admin123

## How It Works

### Authentication
The application uses a simple cookie-based authentication system. After logging in, a session cookie is set to maintain the user's authenticated state.

### Database
The application uses SQLite with Prisma ORM for data persistence. The database file is located at `prisma/dev.db`.

### File Uploads
Photos are uploaded to the `public/uploads/items/[itemId]/` directory. Each item has its own folder for organized storage.

### Data Models
The application uses the following data models:
- **User**: Admin user for authentication
- **Item**: Inventory items with all relevant details
- **Measurement**: Size measurements for items
- **Photo**: Photos associated with items
- **Sale**: Sales records with financial details

## MVP Limitations

This is an MVP (Minimum Viable Product) implementation with the following limitations:
- Single admin user (no user management)
- No multi-user roles
- No external API integrations
- Basic photo management (no image editing)
- Local deployment only (no cloud hosting)

## Future Enhancements

Potential improvements for future versions:
- Multi-user support with role-based access control
- Advanced reporting and analytics
- Barcode/QR code scanning for inventory
- Email notifications for low stock or sales
- Integration with e-commerce platforms
- Advanced search and filtering options
- Data export functionality

## Development Notes

- All API routes are protected and require authentication
- The application follows Next.js App Router conventions
- Tailwind CSS is used for styling with a clean, admin-focused design
- TypeScript is used throughout for type safety
- Prisma is used for database operations with proper error handling

## Troubleshooting

If you encounter issues:
1. Ensure all dependencies are installed: `npm install`
2. Check that the database is properly initialized: `npm run prisma:migrate`
3. Verify environment variables are set correctly
4. Check the console for any error messages

For database issues, you can reset the database with:
```bash
npm run prisma:migrate:reset
```

This will reset the database and reapply all migrations.
