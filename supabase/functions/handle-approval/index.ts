
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
      return createErrorPage('Invalid or Expired Link', 'This approval link is invalid or has already been used.');
    }

    // Check if token is expired
    if (new Date(approvalToken.expires_at) < new Date()) {
      console.log('Token expired:', approvalToken.expires_at);
      return createErrorPage('Link Expired', 'This approval link has expired (valid for 7 days).');
    }

    // Get application details
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
      return createErrorPage('Error Processing Request', 'There was an error processing your approval. Please try again or contact support.');
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
        }
      });
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
    }

    console.log('Application', newStatus, 'successfully');

    return createSuccessPage(approvalToken.action, application);

  } catch (error: any) {
    console.error("Error in handle-approval function:", error);
    return createErrorPage('Internal Server Error', 'An unexpected error occurred. Please try again later or contact support.');
  }
};

function createErrorPage(title: string, message: string): Response {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Dreamers Incubation</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      </head>
      <body class="bg-gradient-to-br from-red-50 to-pink-50 min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div class="mb-6">
            <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-red-600 mb-2">${title}</h1>
            <p class="text-gray-600">${message}</p>
          </div>
          <button onclick="window.close()" class="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
            Close
          </button>
        </div>
        <script>
          // Auto close after 5 seconds
          setTimeout(() => {
            window.close();
          }, 5000);
        </script>
      </body>
    </html>
  `, {
    status: 400,
    headers: { 'Content-Type': 'text/html' },
  });
}

function createSuccessPage(action: string, application: any): Response {
  const isApproval = action === 'approve';
  const statusText = isApproval ? 'APPROVED' : 'REJECTED';
  const statusColor = isApproval ? 'green' : 'red';
  const statusIcon = isApproval ? '🎉' : '❌';
  const bgColor = isApproval ? 'from-green-50 to-emerald-50' : 'from-red-50 to-pink-50';
  
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Application ${statusText} - Dreamers Incubation</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
      </head>
      <body class="bg-gradient-to-br ${bgColor} min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div class="mb-6">
            <div class="text-6xl mb-4">${statusIcon}</div>
            <h1 class="text-3xl font-bold text-${statusColor}-600 mb-2">Application ${statusText}!</h1>
            <div class="inline-block bg-${statusColor}-100 text-${statusColor}-800 px-4 py-2 rounded-full font-semibold mb-4">
              ${statusText}
            </div>
          </div>
          
          ${application ? `
          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 class="font-semibold text-gray-800 mb-4">Application Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Startup:</span>
                <span class="font-semibold">${application.startup_name}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Founder:</span>
                <span class="font-semibold">${application.founder_name}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Incubation Centre:</span>
                <span class="font-semibold">${application.incubation_centre}</span>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="mb-6">
            <p class="text-gray-700 mb-2">
              <strong>The application has been successfully ${action === 'approve' ? 'approved' : 'rejected'}.</strong>
            </p>
            <p class="text-sm text-gray-600">
              ✅ The applicant has been notified automatically via email.
            </p>
          </div>
          
          <button onclick="showSuccessAlert()" class="bg-${statusColor}-600 hover:bg-${statusColor}-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors mb-4 mr-4">
            Show Success Message
          </button>
          <button onclick="window.close()" class="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Close
          </button>
          
          <div class="mt-6 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500">
              Thank you for reviewing this application for ${application?.incubation_centre || 'your incubation center'}.
            </p>
          </div>
        </div>
        
        <script>
          ${isApproval ? `
          // Trigger confetti for approvals
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          ` : ''}
          
          function showSuccessAlert() {
            Swal.fire({
              title: '${statusText}!',
              text: 'Application has been ${action === 'approve' ? 'approved' : 'rejected'} successfully!',
              icon: '${isApproval ? 'success' : 'info'}',
              confirmButtonText: 'Great!',
              confirmButtonColor: '${isApproval ? '#10b981' : '#ef4444'}'
            });
          }
          
          // Auto close after 10 seconds
          setTimeout(() => {
            window.close();
          }, 10000);
        </script>
      </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  });
}

serve(handler);
