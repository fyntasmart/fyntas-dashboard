// api/daily-cycle.js
export default async function handler(req, res) {
  // केवल POST अनुरोध स्वीकार करें (Cron Job भी POST भेजता है)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const masterUrl = process.env.MASTER_AGENT_URL;
    const orchestratorUrl = process.env.ORCHESTRATOR_URL;

    if (!masterUrl || !orchestratorUrl) {
      return res.status(500).json({
        error: 'Environment variables MASTER_AGENT_URL and ORCHESTRATOR_URL must be set',
      });
    }

    // 1. Master Agent को टास्क भेजें
    const masterRes = await fetch(masterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start_cycle' }),
    });
    const masterData = await masterRes.json();

    // 2. थोड़ा इंतज़ार करें ताकि टास्क पूरी तरह बन जाएँ (3 सेकंड)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 3. Orchestrator को चलाएँ (सभी एजेंट्स को ट्रिगर करेगा)
    const orchRes = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const orchData = await orchRes.json();

    // सफलता का जवाब
    return res.status(200).json({
      message: 'Daily cycle completed',
      master: masterData,
      orchestrator: orchData,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
