import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with anon key (for auth verification)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Verify the caller is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller has admin role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { email, name, role, study_id, password } = await req.json();

    // Validate required fields
    if (!email || !name || !role || !study_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, name, role, study_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate role is one of the allowed target roles
    const allowedRoles = ["principal_investigator", "study_coordinator", "monitor"];
    if (!allowedRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify study_id exists
    const { data: study, error: studyError } = await supabase
      .from("studies")
      .select("id")
      .eq("id", study_id)
      .single();

    if (studyError || !study) {
      return new Response(
        JSON.stringify({ error: "Study not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize service role client for user creation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Build createUser payload — include password only when supplied
    const createUserPayload: {
      email: string;
      email_confirm: boolean;
      user_metadata: { full_name: string };
      password?: string;
    } = {
      email,
      email_confirm: true,
      user_metadata: { full_name: name },
    };

    if (password && password.trim().length >= 8) {
      createUserPayload.password = password.trim();
    }

    // Create the Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(
      createUserPayload,
    );

    if (authError) {
      return new Response(
        JSON.stringify({ error: `Failed to create auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = authData.user.id;

    // Create/update the profiles row
    const { error: profileUpdateError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: name,
        role: role,
        profile_completed: false,
      });

    if (profileUpdateError) {
      // Cleanup: delete the auth user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: `Failed to create profile: ${profileUpdateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert study_assignments
    const { error: assignmentError } = await supabaseAdmin
      .from("study_assignments")
      .insert({
        study_id: study_id,
        profile_id: newUserId,
        role: role,
      });

    if (assignmentError) {
      // Cleanup: delete the auth user and profile if assignment creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      await supabaseAdmin.from("profiles").delete().eq("id", newUserId);
      return new Response(
        JSON.stringify({ error: `Failed to create study assignment: ${assignmentError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        user_id: newUserId,
        email: email,
        name: name,
        role: role,
        study_id: study_id,
        message: "User created and assigned successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
