
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response('Invalid token', { status: 400 });
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
      return new Response(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>❌ Invalid or Expired Link</h1>
            <p>This approval link is invalid or has already been used.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token is expired
    if (new Date(approvalToken.expires_at) < new Date()) {
      return new Response(`
        <html>
          <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
            <h1>⏰ Link Expired</h1>
            <p>This approval link has expired.</p>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

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
      console.error('Error updating application:', updateError);
      return new Response('Error processing approval', { status: 500 });
    }

    // Mark token as used
    await supabaseClient
      .from('approval_tokens')
      .update({ used: true })
      .eq('token', token);

    const actionText = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const actionColor = approvalToken.action === 'approve' ? '#10b981' : '#ef4444';
    const actionIcon = approvalToken.action === 'approve' ? '✅' : '❌';

    return new Response(`
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: ${actionColor};">${actionIcon} Application ${actionText.toUpperCase()}</h1>
          <p>The application has been successfully ${actionText}.</p>
          <p>The applicant will be notified automatically.</p>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error("Error in handle-approval function:", error);
    return new Response('Internal server error', { status: 500 });
  }
};

serve(handler);
