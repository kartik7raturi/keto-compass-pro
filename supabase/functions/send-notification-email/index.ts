import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  to: string;
  subject: string;
  userName: string;
  messageSubject: string;
  adminResponse: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notification-email function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, userName, messageSubject, adminResponse }: NotificationEmailRequest = await req.json();
    
    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "KetoDiet <onboarding@resend.dev>",
        to: [to],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .response-box { background: white; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Response to Your Message</h1>
              </div>
              <div class="content">
                <p>Hi ${userName},</p>
                <p>We've responded to your message regarding: <strong>"${messageSubject}"</strong></p>
                <div class="response-box">
                  <p style="margin: 0; white-space: pre-wrap;">${adminResponse}</p>
                </div>
                <p>If you have any follow-up questions, feel free to send us another message through the app.</p>
                <p>Best regards,<br>The KetoDiet Team</p>
              </div>
              <div class="footer">
                <p>© 2024 KetoDiet. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify(result), {
      status: emailResponse.ok ? 200 : 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
