const API_BASE = "";

function readCookie(name) {
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  return cookie ? cookie.split("=")[1] : "";
}

async function bootstrapCsrf() {
  await fetch(`${API_BASE}/api/csrf-token`, {
    method: "GET",
    credentials: "include",
  });
}

function mapRiskToUi(result) {
  const risk = result.risk || "low";
  const score = result.score || 0;
  const warning = result.layer4Triggered;

  return {
    risk,
    score,
    warning,
    ringClass: risk === "high" ? "ring-red-500" : risk === "medium" ? "ring-amber-400" : "ring-green-500",
    badgeClass: risk === "high" ? "bg-red-500 text-white" : risk === "medium" ? "bg-amber-400 text-black" : "bg-green-500 text-white",
  };
}

function updateRiskUi(mapped, result) {
  const riskBadge = document.getElementById("risk-badge");
  const riskScore = document.getElementById("risk-score");
  const riskAdvice = document.getElementById("risk-advice");
  const demoCard = document.getElementById("risk-card");

  if (!riskBadge || !riskScore || !riskAdvice || !demoCard) return;

  riskBadge.className = `inline-block px-3 py-1 rounded-full text-xs font-bold mb-6 ${mapped.badgeClass}`;
  riskBadge.textContent = `Risk Level: ${mapped.risk.toUpperCase()}`;

  riskScore.textContent = `Score: ${mapped.score}`;
  riskAdvice.textContent = result.advice;

  demoCard.classList.remove("ring-red-500", "ring-amber-400", "ring-green-500");
  demoCard.classList.add(mapped.ringClass);

  if (mapped.warning) {
    demoCard.classList.add("animate-pulse");
  } else {
    demoCard.classList.remove("animate-pulse");
  }
}

async function analyzeSampleTelemetry() {
  const payload = {
    senderId: "A1",
    message: "URGENT: Your account is blocked. Verify immediately or police complaint will be filed. Click now!!!",
    url: "https://bit.ly/3x8k2v1",
    fileName: "security_update.apk",
    source: "browser",
  };

  const csrfToken = readCookie("digiguard_csrf");

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": csrfToken,
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze telemetry");
  }

  return response.json();
}

function connectLiveSocket() {
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${wsProtocol}://${window.location.host}/ws`);
  ws.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type !== "risk-update") return;

      const mapped = mapRiskToUi(data.payload);
      updateRiskUi(mapped, data.payload);
    } catch (_err) {
      // Ignore malformed event payloads from external senders.
    }
  });

  return ws;
}

async function initDigiGuardDemo() {
  await bootstrapCsrf();
  connectLiveSocket();

  const analyzeBtn = document.getElementById("analyze-btn");
  if (!analyzeBtn) return;

  analyzeBtn.addEventListener("click", async () => {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {
      const result = await analyzeSampleTelemetry();
      const mapped = mapRiskToUi(result);
      updateRiskUi(mapped, result);
    } catch (_err) {
      const riskAdvice = document.getElementById("risk-advice");
      if (riskAdvice) {
        riskAdvice.textContent = "Unable to reach security engine. Check backend connection.";
      }
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Run Onion Analysis";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initDigiGuardDemo().catch(() => {
    // Keep landing page functional even if backend is down.
  });
});
