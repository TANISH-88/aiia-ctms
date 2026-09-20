# admin-create-user Edge Function

This Edge Function allows admin users to create new users and assign them to studies.

## Deployment

To deploy this function to Supabase:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Deploy the function:
   ```bash
   supabase functions deploy admin-create-user
   ```

4. Set the required environment variables in the Supabase dashboard:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (never expose this to frontend)

## Usage

Call the function from your frontend:

```javascript
const { data, error } = await supabase.functions.invoke('admin-create-user', {
  body: {
    email: 'newuser@example.com',
    name: 'John Doe',
    role: 'study_coordinator',
    study_id: 'uuid-of-study'
  }
});
```

## Security

- Only users with `admin` role in the `profiles` table can call this function
- The function uses the service role key internally (never exposed to frontend)
- The function validates the study_id exists before creating the user
- Only allows creation of users with roles: `principal_investigator`, `study_coordinator`, `monitor`
- Includes cleanup logic to delete orphaned users if profile/assignment creation fails
- Includes CORS headers for proper browser integration

## Allowed Roles

The function only allows creating users with the following roles:
- `principal_investigator`
- `study_coordinator`
- `monitor`

This prevents privilege escalation and ensures only appropriate roles can be assigned via this endpoint.
