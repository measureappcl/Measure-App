import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()
    
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL')

    // Log environment variables (sin mostrar la API key completa)
    console.log('Config:', {
      apiKeyExists: !!SENDGRID_API_KEY,
      apiKeyStart: SENDGRID_API_KEY?.substring(0, 10),
      fromEmail: FROM_EMAIL,
      to,
      subject
    })

    const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    })

    const responseText = await sendgridResponse.text()
    console.log('SendGrid Response:', {
      status: sendgridResponse.status,
      body: responseText
    })

    if (!sendgridResponse.ok) {
      throw new Error(`SendGrid Error (${sendgridResponse.status}): ${responseText}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', {
      message: error.message,
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 