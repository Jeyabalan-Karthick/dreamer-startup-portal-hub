
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  applicationId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { applicationId }: EmailRequest = await req.json();

    // Get application details
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      console.error('Application not found:', appError);
      return new Response(JSON.stringify({ error: 'Application not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get incubation center admin email
    const { data: incubationCenter, error: centerError } = await supabaseClient
      .from('incubation_centres')
      .select('admin_email, name')
      .eq('name', application.incubation_centre)
      .single();

    if (centerError || !incubationCenter) {
      console.error('Incubation center not found:', centerError);
      return new Response(JSON.stringify({ error: 'Incubation center not found' }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create approval tokens
    const approveToken = crypto.randomUUID();
    const rejectToken = crypto.randomUUID();

    const { error: tokenError } = await supabaseClient
      .from('approval_tokens')
      .insert([
        { application_id: applicationId, token: approveToken, action: 'approve' },
        { application_id: applicationId, token: rejectToken, action: 'reject' }
      ]);

    if (tokenError) {
      console.error('Error creating tokens:', tokenError);
      return new Response(JSON.stringify({ error: 'Failed to create approval tokens' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email to admin
    const approveUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-approval?token=${approveToken}`;
    const rejectUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/handle-approval?token=${rejectToken}`;

    const emailResponse = await resend.emails.send({
      from: "Dreamers Incubation <noreply@resend.dev>",
      to: [incubationCenter.admin_email],
      subject: `New Application for ${incubationCenter.name}`,
      html: `
        <h2>New Application Received</h2>
        <p>A new application has been submitted for ${incubationCenter.name}.</p>
        
        <h3>Application Details:</h3>
        <ul>
          <li><strong>Founder:</strong> ${application.founder_name}</li>
          <li><strong>Startup:</strong> ${application.startup_name}</li>
          <li><strong>Email:</strong> ${application.email}</li>
          <li><strong>Phone:</strong> ${application.phone}</li>
          <li><strong>Company Type:</strong> ${application.company_type}</li>
          <li><strong>Team Size:</strong> ${application.team_size}</li>
          <li><strong>Website:</strong> ${application.website || 'Not provided'}</li>
        </ul>

        <h3>Startup Idea:</h3>
        <p>${application.idea_description}</p>

        <div style="margin: 30px 0;">
          <a href="${approveUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">
            ✅ APPROVE APPLICATION
          </a>
          <a href="${rejectUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            ❌ REJECT APPLICATION
          </a>
        </div>

        <p><small>These links will expire in 7 days.</small></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-approval-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
