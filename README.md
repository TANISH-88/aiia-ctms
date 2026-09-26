# AIIA Clinical Trials Dashboard

A clinical-trial management dashboard for Ayurveda trials (SIH PS 26046). Built as a 3-person, 7-day hackathon project with React frontend and Supabase backend.

## Overview

The AIIA Clinical Trials Dashboard handles:
- Study/trial tracking and management
- KPIs and configurable alerts
- AE/SAE safety reporting with regulatory deadlines
- Role-based access control (RBAC)
- Immutable audit logging
- Ethics Committee submission workflow
- Organization and site management
- Participant interest tracking

## Architecture

The system uses a serverless architecture with Supabase as the unified backend:
- **Frontend**: React + Vite
- **Backend**: Supabase (PostgreSQL + Auth + PostgREST)
- **Security**: PostgreSQL Row-Level Security (RLS)
- **No custom backend server**: All business logic in database functions, triggers, and RLS

## Documentation

For detailed technical documentation, see:
- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md)** - Complete technical reference including:
  - Database schema (tables, views, enums)
  - RLS policies and role-based access model
  - API contract (frontend/database calls)
  - RPC functions and triggers
  - Built vs. out-of-scope features

## Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd p9-sih
   ```

2. **Set up Supabase**
   - Create a Supabase project
   - Run the SQL migrations in order:
     1. `schema.sql` (base schema)
     2. `organization_feature_migration.sql`
     3. `study_assignments_migration.sql`
     4. `sites_rls_migration.sql`
     5. `phase23_participant_interest_migration.sql`
   - Get your `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Project Settings → API

3. **Set up the frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```
   
   Edit `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_NCBI_API_KEY=your_ncbi_key  # Optional
   VITE_NCBI_EMAIL=your_ncbi_email # Optional
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - First user: Sign up (defaults to `study_coordinator` role)
   - Admin: Manually promote users via Supabase dashboard or use admin functions

## Project Structure

```
p9-sih/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── app/              # App routing and layout
│   │   ├── features/         # Feature modules (auth, studies, dashboard, etc.)
│   │   ├── api/              # Supabase client and API calls
│   │   └── components/       # Reusable UI components
│   ├── package.json
│   └── README.md             # Frontend-specific setup
├── backend/                  # Supabase migrations and functions
│   ├── supabase/functions/   # Edge functions
│   └── *.sql                 # Database migration files
├── docs/                     # Project documentation
│   └── PROJECT_DOCUMENTATION.md
├── schema.sql                # Base database schema
└── README.md                 # This file
```

## Key Features

### Role-Based Access
- **Principal Investigator**: Study oversight, enrollment monitoring, safety signals
- **Study Coordinator**: Day-to-day operations, subject enrollment, AE reporting
- **Monitor**: Site monitoring and oversight
- **Ethics Committee**: Study review and approval decisions
- **Pharmacovigilance**: Safety signal monitoring
- **Admin**: System administration and user management
- **Regulator**: Read-only regulatory access

### Workflows
- **Study Creation**: Admin creates studies, assigns PIs, sites, and Ethics Committees
- **Ethics Submission**: Coordinators submit studies for EC review
- **Subject Enrollment**: Coordinators enroll subjects and track visits
- **AE/SAE Reporting**: Automated deadline calculation (24h for SAE, 15 days for non-serious)
- **Audit Trail**: Immutable logging of all data changes

### Security
- Supabase Auth for authentication
- Row-Level Security (RLS) on all tables
- Role-based data access
- Immutable audit log
- No service_role keys in frontend code

## Database Migrations

Run migrations in the Supabase SQL editor in this order:

1. **schema.sql** - Base schema (tables, views, triggers, RLS)
2. **organization_feature_migration.sql** - Organization management
3. **study_assignments_migration.sql** - Role-based study assignments
4. **sites_rls_migration.sql** - Sites RLS policies
5. **phase23_participant_interest_migration.sql** - Participant interest form

Additional migration files may exist for specific features - check the `backend/` directory.

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Database Changes
1. Create a new migration file in the root or `backend/` directory
2. Follow the naming convention: `feature_name_migration.sql`
3. Include verification queries at the end
4. Update `docs/PROJECT_DOCUMENTATION.md` if schema changes
5. Test on a staging environment before production

### Code Style
- React functional components with hooks
- Supabase client for all database operations
- TypeScript for type safety (where applicable)
- Follow existing patterns in the codebase

## Testing

### Manual Testing Checklist
- [ ] User signup and login
- [ ] Role-based dashboard access
- [ ] Study creation and assignment
- [ ] Ethics Committee submission workflow
- [ ] AE/SAE reporting and deadlines
- [ ] Audit log verification
- [ ] RLS policy testing (each role sees only their data)

### Database Verification
Use the provided SQL check files to verify:
- `check_study_submissions.sql` - Study submission workflow
- `check_monitor_assignments.sql` - Monitor access to studies
- `verify_pi_monitor_dashboard.sql` - PI/Monitor dashboard data

## Troubleshooting

### Common Issues

**Frontend can't connect to Supabase**
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Check browser console for CORS errors

**Users can't see assigned studies**
- Verify `study_assignments` table has correct records
- Check RLS policies on `study_assignments` table
- Ensure user role matches assignment role

**AE deadlines not calculating**
- Verify `trg_set_ae_deadline` trigger exists
- Check trigger is enabled on `adverse_events` table
- Test with new AE insertion

**Audit log not recording changes**
- Verify audit triggers exist on tables
- Check `auth.uid()` is not null when making changes
- Ensure RLS policies allow inserts to `audit_log`

## Support

For technical questions or issues:
1. Check the [Project Documentation](docs/PROJECT_DOCUMENTATION.md)
2. Review migration files for implementation details
3. Check Supabase dashboard for database issues
4. Review browser console for frontend errors

## License

This project was developed for the Smart India Hackathon (SIH PS 26046).

## Team

This was a 3-person, 7-day hackathon project with the following team structure:
- **Frontend**: React UI and user experience
- **Backend**: Supabase database, RLS, RPCs, alerts
- **AI**: AI features, embeddings, RAG, seed/demo data
