export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const masterUrl = process.env.MASTER_AGENT_URL;
    const orchestratorUrl = process.env.ORCHESTRATOR_URL;

    if (!masterUrl || !orchestratorUrl) {
      return res.status(500).json({ error: 'Environment variables not set' });
    }

    // Step 1: Master Agent
    const masterRes = await fetch(masterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start_cycle' }),
    });
    const masterData = await masterRes.json();

    // Step 2: Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Orchestrator
    const orchRes = await fetch(orchestratorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const orchData = await orchRes.json();

    res.status(200).json({
      message: 'Daily cycle completed',
      master: masterData,
      orchestrator: orchData,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
