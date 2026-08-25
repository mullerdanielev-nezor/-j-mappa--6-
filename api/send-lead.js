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
        sender: { name: 'Weboldal ajánlatkérés', email: 'miklosjelencsity@gmail.com' },
        to: [
          // TESZT: balazsfiak5@gmail.com ideiglenesen kikapcsolva, vissza kell tenni éles előtt
          { email: 'miklosjelencsity@gmail.com' },
        ],
        subject: `Új ajánlatkérés – ${nev} (${hol})`,
        htmlContent: `
          <p><strong>Új ajánlatkérés érkezett a weboldalról:</strong></p>
          <ul>
            <li><strong>Név:</strong> ${nev}</li>
            <li><strong>Telefonszám:</strong> ${tel}</li>
            <li><strong>Hol:</strong> ${hol}</li>
          </ul>
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
