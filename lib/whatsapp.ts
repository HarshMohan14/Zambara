/**
 * WhatsApp Notification Utility helper for Zambaara TagCon
 * Integrates with Meta WhatsApp Cloud API to send template notifications.
 */

export async function sendWhatsAppNotification(mobile: string, name: string): Promise<boolean> {
  const enabled = process.env.WHATSAPP_ENABLED === 'true';
  
  if (!enabled) {
    console.log(`[WhatsApp Mock] Notifications disabled. Would have sent to ${mobile} for player ${name}`);
    return true;
  }

  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
  const languageCode = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';
  const defaultCountryCode = process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '91';

  if (!accessToken || !phoneNumberId || !templateName) {
    console.error('[WhatsApp Error] Missing required environment variables:', {
      WHATSAPP_ACCESS_TOKEN: accessToken ? 'PRESENT' : 'MISSING',
      WHATSAPP_PHONE_NUMBER_ID: phoneNumberId ? 'PRESENT' : 'MISSING',
      WHATSAPP_TEMPLATE_NAME: templateName ? 'PRESENT' : 'MISSING'
    });
    return false;
  }

  try {
    // Normalize phone number
    let cleanPhone = mobile.replace(/\D/g, '');
    
    // Strip leading zero if 11 digits
    if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Prefix default country code if exactly 10 digits
    if (cleanPhone.length === 10) {
      cleanPhone = defaultCountryCode + cleanPhone;
    }

    console.log(`[WhatsApp Info] Sending Meta template message to ${cleanPhone} (${name}) using template "${templateName}"`);

    const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: name
                }
              ]
            }
          ]
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[WhatsApp Error] Meta Cloud API error response:', data);
      return false;
    }

    console.log('[WhatsApp Success] Message sent successfully:', data);
    return true;
  } catch (err) {
    console.error('[WhatsApp Exception] Failed to send WhatsApp notification:', err);
    return false;
  }
}
