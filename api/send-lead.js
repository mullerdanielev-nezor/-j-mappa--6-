export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { nev, tel, hol } = req.body || {};

  if (!nev || !tel || !hol) {
    return res.status(400).json({ ok: false, error: 'Hiányzó mezők' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Szerver konfigurációs hiba' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Fiák Balázs E.v. – Weboldal', email: 'miklosjelencsity@gmail.com' },
        to: [
          { email: 'fiakbalazs455@gmail.com' },
          { email: 'miklosjelencsity@gmail.com' },
          { email: 'mullerdanielev@gmail.com' },
        ],
        subject: `Új ajánlatkérés – ${nev} (${hol})`,
        htmlContent: `
        <div style="background:#faf7f1;padding:32px 16px;font-family:Segoe UI,Roboto,Arial,sans-serif;color:#171a0a">
          <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4ddc9">
            <tr>
              <td style="background:#1f2a12;padding:22px 28px">
                <span style="color:#f2c94c;font-size:12px;letter-spacing:.12em;font-weight:700;text-transform:uppercase">Fiák Balázs E.v.</span>
                <h1 style="color:#ffffff;font-size:20px;margin:6px 0 0;font-weight:600">Új ajánlatkérés érkezett</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px">
                <table role="presentation" width="100%" style="border-collapse:collapse">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e4ddc9;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a6a1f;font-weight:700;width:110px">Név</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e4ddc9;font-size:15px">${nev}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e4ddc9;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a6a1f;font-weight:700">Telefon</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e4ddc9;font-size:15px"><a href="tel:${tel}" style="color:#171a0a;text-decoration:none">${tel}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#8a6a1f;font-weight:700">Helyszín</td>
                    <td style="padding:10px 0;font-size:15px">${hol}</td>
                  </tr>
                </table>
                <a href="tel:${tel}" style="display:inline-block;margin-top:24px;background:#c9a24b;color:#171a0a;font-weight:700;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:999px">Visszahívom most</a>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;background:#f1ead9;font-size:12px;color:#5a5f4a;text-align:center">
                Ez az üzenet automatikusan érkezett a fiakbalazs weboldal ajánlatkérő űrlapjáról.
              </td>
            </tr>
          </table>
        </div>
        `,
      }),
    });

    if (!brevoRes.ok) {
      const errText = await brevoRes.text();
      console.error('Brevo error:', errText);
      return res.status(502).json({ ok: false, error: 'Email küldés sikertelen' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Send-lead error:', err);
    return res.status(500).json({ ok: false, error: 'Szerver hiba' });
  }
}
