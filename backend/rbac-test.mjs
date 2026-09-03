import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nvicdgbjbrxdunifjigd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_bCy-eKk5i-7xVyE0ioYRdg_yKeQGaxT';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const users = [
  {
    name: 'PI1',
    email: 'phase5.pi1@test.com',
    password: '1234',
    expectedStudies: 1,
    expectedStudy: '11111111-1111-1111-1111-111111111111',
  },
  {
    name: 'PI2',
    email: 'phase5.pi2@test.com',
    password: '1234',
    expectedStudies: 1,
    expectedStudy: '2eac0e4a-cc42-4d7f-9c02-d0772cdf0721',
  },
  {
    name: 'Coordinator',
    email: 'phase5.coordinator@test.com',
    password: '1234',
    expectedStudies: 1,
    expectedStudy: '11111111-1111-1111-1111-111111111111',
  },
  {
    name: 'Monitor',
    email: 'phase5.monitor@test.com',
    password: '1234',
    expectedStudies: 1,
    expectedStudy: '2eac0e4a-cc42-4d7f-9c02-d0772cdf0721',
  },
  {
    name: 'Admin',
    email: 'phase5.admin@test.com',
    password: '1234',
    expectedStudies: 2,
  },
  {
    name: 'Ethics Committee',
    email: 'phase5.ethics@test.com',
    password: '1234',
    expectedStudies: 2,
  },
  {
    name: 'Pharmacovigilance',
    email: 'phase5.pv@test.com',
    password: '1234',



    expectedStudies: 2,
  },
];

for (const user of users) {
  console.log(`\n==============================`);
  console.log(`Testing ${user.name}`);
  console.log(`==============================`);

  await supabase.auth.signOut();

  // LOGIN
  const { data: loginData, error: loginError } =
    await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });

  if (loginError) {
    console.log(`❌ LOGIN FAILED: ${loginError.message}`);
    continue;
  }

  console.log(`✅ Login successful`);

  // CHECK AUTH USER
  const {
    data: { user: authUser },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !authUser) {
    console.log(`❌ Could not get authenticated user`);
    console.log(userError);
    continue;
  }

  console.log(`Authenticated user ID: ${authUser.id}`);

  // CHECK PROFILE
  const { data: profile, error: profileError } =
    await supabase
      .from('profiles')
      .select('id, role, site_id')
      .eq('id', authUser.id)
      .single();

  if (profileError) {
    console.log(`❌ PROFILE QUERY FAILED: ${profileError.message}`);
  } else {
    console.log(`Profile:`, profile);
  }

  // CHECK STUDIES
  const { data: studies, error: studiesError } =
    await supabase
      .from('studies')
      .select('id, title, pi_id');

  if (studiesError) {
    console.log(`❌ STUDIES QUERY FAILED: ${studiesError.message}`);
    continue;
  }

  console.log(`Visible studies: ${studies.length}`);
  console.log(studies);

  // VERIFY RESULT
  const countCorrect =
    studies.length === user.expectedStudies;

  const studyCorrect =
    user.expectedStudy === undefined ||
    (
      studies.length === 1 &&
      studies[0].id === user.expectedStudy
    );

  if (countCorrect && studyCorrect) {
    console.log(`✅ ${user.name} PASSED`);
  } else {
    console.log(`❌ ${user.name} FAILED`);
  }
}

await supabase.auth.signOut();