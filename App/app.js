// ✅ Use the FULL endpoint including /register
const API_URL = "https://oltbr08l3h.execute-api.us-east-1.amazonaws.com/register";

function showError(msg, err) {
  console.error(msg, err);
  alert(msg + " Check console for details.");
}

async function safeJson(res) {
  const text = await res.text();
  try {
    return { json: JSON.parse(text), raw: text };
  } catch {
    return { json: null, raw: text };
  }
}

/**
 * 1) REGISTER (POST)
 */
document.getElementById("submitBtn").addEventListener("click", async () => {
  const btn = document.getElementById("submitBtn");
  btn.innerText = "Processing...";
  btn.disabled = true;

  try {
    // Get location (client-side)
    const geoRes = await fetch("https://ipapi.co/json/");
    const geoData = await geoRes.json();

    const payload = {
      city: geoData.city || "Unknown",
      state: geoData.region || "Unknown",
      country: geoData.country_name || "Unknown"
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const { json, raw } = await safeJson(res);

    if (!res.ok) {
      // API gateway might return {"message": "..."} or HTML
      throw new Error(`API failed (${res.status}). Response: ${raw}`);
    }

    if (!json || typeof json.id === "undefined") {
      throw new Error(`Missing 'id' in response: ${raw}`);
    }

    document.getElementById("newId").innerText = json.id;
    document.getElementById("registerResult").classList.remove("hidden");
    btn.innerText = "Joined Successfully!";
  } catch (err) {
    showError("Join failed.", err);
    btn.innerText = "Get My ID";
    btn.disabled = false;
  }
});

/**
 * 2) LOOKUP (GET)
 */
document.getElementById("fetchBtn").addEventListener("click", async () => {
  const idToFind = document.getElementById("lookupId").value;
  const fetchResultDiv = document.getElementById("fetchResult");

  if (!idToFind) return alert("Please enter an ID number!");

  try {
    const res = await fetch(`${API_URL}?id=${encodeURIComponent(idToFind)}`);

    const { json, raw } = await safeJson(res);

    if (res.status === 404) {
      alert("This ID does not exist in our records.");
      return;
    }

    if (!res.ok) {
      throw new Error(`Lookup failed (${res.status}). Response: ${raw}`);
    }

    if (!json) {
      throw new Error(`Invalid JSON response: ${raw}`);
    }

    document.getElementById("resLoc").innerText = `${json.city}, ${json.region}`;
    document.getElementById("resIp").innerText = json.ip;
    fetchResultDiv.classList.remove("hidden");
  } catch (err) {
    showError("Error retrieving data.", err);
  }
});