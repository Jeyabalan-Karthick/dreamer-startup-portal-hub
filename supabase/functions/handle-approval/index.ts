
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    console.log('Processing approval token:', token);

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
      console.error('Token not found or already used:', tokenError);
      return new Response(`
        <html>
          <head>
            <title>Invalid Link - Dreamers Incubation</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Invalid or Expired Link</h1>
              <p>This approval link is invalid or has already been used.</p>
              <p>If you need to review an application, please check your email for a valid link.</p>
            </div>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Check if token is expired
    if (new Date(approvalToken.expires_at) < new Date()) {
      console.log('Token expired:', approvalToken.expires_at);
      return new Response(`
        <html>
          <head>
            <title>Link Expired - Dreamers Incubation</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .warning { color: #ffc107; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="warning">⏰ Link Expired</h1>
              <p>This approval link has expired (valid for 7 days).</p>
              <p>Please contact the system administrator if you need to review this application.</p>
            </div>
          </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Get application details for better messaging
    const { data: application, error: appError } = await supabaseClient
      .from('applications')
      .select('founder_name, startup_name, incubation_centre')
      .eq('id', approvalToken.application_id)
      .single();

    // Update application status
    const newStatus = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const timestampField = approvalToken.action === 'approve' ? 'approved_at' : 'rejected_at';

    console.log('Updating application status to:', newStatus);

    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({ 
        status: newStatus,
        [timestampField]: new Date().toISOString()
      })
      .eq('id', approvalToken.application_id);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return new Response(`
        <html>
          <head>
            <title>Error - Dreamers Incubation</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f8f9fa; }
              .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .error { color: #dc3545; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 class="error">❌ Error Processing Request</h1>
              <p>There was an error processing your approval. Please try again or contact support.</p>
            </div>
          </body>
        </html>
      `, { 
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Mark token as used
    await supabaseClient
      .from('approval_tokens')
      .update({ used: true })
      .eq('token', token);

    console.log('Application', newStatus, 'successfully');

    const actionText = approvalToken.action === 'approve' ? 'approved' : 'rejected';
    const actionColor = approvalToken.action === 'approve' ? '#28a745' : '#dc3545';
    const actionIcon = approvalToken.action === 'approve' ? '✅' : '❌';

    return new Response(`
      <html>
        <head>
          <title>Application ${actionText.toUpperCase()} - Dreamers Incubation</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 40px; 
              text-align: center; 
              background-color: #f8f9fa; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              padding: 40px; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .success { color: ${actionColor}; }
            .details { 
              background-color: #f8f9fa; 
              padding: 20px; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="success">${actionIcon} Application ${actionText.toUpperCase()}</h1>
            ${application ? `
            <div class="details">
              <p><strong>Startup:</strong> ${application.startup_name}</p>
              <p><strong>Founder:</strong> ${application.founder_name}</p>
              <p><strong>Incubation Centre:</strong> ${application.incubation_centre}</p>
            </div>
            ` : ''}
            <p>The application has been successfully <strong>${actionText}</strong>.</p>
            <p>The applicant will be notified automatically via email.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #666; font-size: 14px;">
                Thank you for reviewing this application for ${application?.incubation_centre || 'your incubation center'}.
              </p>
            </div>
          </div>
        </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error: any) {
    console.error("Error in handle-approval function:", error);
    return new Response(`
      <html>
        <head>
          <title>Error - Dreamers Incubation</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f8f9fa; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="error">❌ Internal Server Error</h1>
            <p>An unexpected error occurred. Please try again later or contact support.</p>
          </div>
        </body>
      </html>
    `, { 
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
};

serve(handler);
