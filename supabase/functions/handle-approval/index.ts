// @ts-ignore Deno types
/// <reference lib="deno.ns" />
// @ts-ignore Deno HTTP import
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore Deno ESM import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid token' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get approval token details
    const { data: approvalToken, error: tokenError } = await supabaseClient
      .from('approval_tokens')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (tokenError || !approvalToken) {
      return new Response(JSON.stringify({ status: 'error', message: 'Invalid or expired link' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Check if token is expired
    if (new Date(approvalToken.expires_at) < new Date()) {
      return new Response(JSON.stringify({ status: 'error', message: 'Link expired' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Get application details for better messaging
    const { data: application } = await supabaseClient
      .from('applications')
      .select('founder_name, startup_name, incubation_centre, email')
      .eq('id', approvalToken.application_id)
      .single();

    // Update application status
    const newStatus = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const timestampField = approvalToken.action === 'approve' ? 'approved_at' : 'rejected_at';

    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({ 
        status: newStatus,
        [timestampField]: new Date().toISOString()
      })
      .eq('id', approvalToken.application_id);

    if (updateError) {
      return new Response(JSON.stringify({ status: 'error', message: 'Error updating application status' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    // Mark token as used
    await supabaseClient
      .from('approval_tokens')
      .update({ used: true })
      .eq('token', token);

    // Send notification email to applicant
    try {
      await supabaseClient.functions.invoke('send-status-notification', {
        body: { 
          applicationId: approvalToken.application_id, 
          status: newStatus 
        },
        from: "Dreamers Incubation <noreply@brandmindz.com>",
        to: [application.email]
      });
    } catch (notificationError) {
      // Log but don't fail the main flow
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: `Application ${newStatus} successfully`,
      application: application || null,
      action: approvalToken.action
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ status: 'error', message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

serve(handler);
