class UIOverlay {
  constructor() {
    this.bindTabEvents();
  }

  bindTabEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (btn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.render(btn.getAttribute('data-tab'));
      }
    });
  }

  render(tab = 'upgrades') {
    const container = document.getElementById('sidebar-content-area');
    if (!container) return;

    if (tab === 'upgrades') {
      container.innerHTML = `
        <div id="ad-gold-boost" class="upgrade-card" style="background: linear-gradient(135deg, #FF9F43 0%, #FF671F 100%); color:#12100E; cursor:pointer;">
          <div>
            <div style="font-weight:bold; font-size:13px;">📺 Watch Ad: x2 Gold for 5 Mins</div>
            <div style="font-size:11px;">Instant passive revenue multiplier</div>
          </div>
          <span style="font-size:20px;">⚡</span>
        </div>

        <div class="upgrade-card">
          <div>
            <div style="font-size:13px; font-weight:bold;">🔱 Gada Swing Power</div>
            <div style="font-size:11px; color:#A0A5C0;">+20 damage per strike</div>
          </div>
          <button id="buy-swing" class="buy-btn">🪙 75</button>
        </div>

        <div class="upgrade-card">
          <div>
            <div style="font-size:13px; font-weight:bold;">🔥 Agni Forge Resonance</div>
            <div style="font-size:11px; color:#A0A5C0;">+10% critical block shatter</div>
          </div>
          <button id="buy-forge" class="buy-btn">🪙 250</button>
        </div>
      `;

      document.getElementById('ad-gold-boost').onclick = () => {
        cgManager.showRewardedAd(() => {
          window.threeStage.multiplier = 2;
          alert("x2 Gold Multiplier Active!");
        });
      };
      document.getElementById('buy-swing').onclick = () => {
        if (window.threeStage.coins >= 75) {
          window.threeStage.coins -= 75;
          window.threeStage.clickPower += 20;
          document.getElementById('gold-val').innerText = window.threeStage.coins;
          window.threeStage.saveGameProgress();
        }
      };
    } else if (tab === 'tools') {
      container.innerHTML = `
        <div style="font-size:11px; color:#A0A5C0; margin-bottom:8px;">
          Equipped Vedic Tool Set. Forge duplicates to ascend tool star levels.
        </div>

        <div class="tools-grid">
          <div class="tool-box">
            <span class="tool-badge">LOKAPALA</span>
            <span style="font-size:26px; margin:4px;">🔱</span>
            <div style="font-size:11px; font-weight:bold;">Panchaloha Gada</div>
            <div style="font-size:10px; color:#FFC72C;">+165 Power</div>
          </div>

          <div class="tool-box">
            <span class="tool-badge">AGNI</span>
            <span style="font-size:26px; margin:4px;">🔥</span>
            <div style="font-size:11px; font-weight:bold;">Agni Trishula</div>
            <div style="font-size:10px; color:#FFC72C;">+340 Power</div>
          </div>

          <div class="tool-box">
            <span class="tool-badge">VAJRA</span>
            <span style="font-size:26px; margin:4px;">⚡</span>
            <div style="font-size:11px; font-weight:bold;">Indra Spike</div>
            <div style="font-size:10px; color:#FFC72C;">+820 Power</div>
          </div>

          <div class="tool-box">
            <span class="tool-badge">KUBERA</span>
            <span style="font-size:26px; margin:4px;">💎</span>
            <div style="font-size:11px; font-weight:bold;">Kubera Chisel</div>
            <div style="font-size:10px; color:#FFC72C;">+1,500 Power</div>
          </div>
        </div>

        <div style="margin-top: 10px; display:flex; flex-direction:column; gap:6px;">
          <button id="ad-tool-crate" class="ad-reward-btn" style="width:100%; padding:8px;">📺 Watch Ad: Summons Mythic Astra Tool Crate</button>
          <button id="ad-tool-forge" class="ad-reward-btn" style="width:100%; padding:8px; background:linear-gradient(180deg,#7367F0,#5E50EE); color:#fff;">📺 Watch Ad: Instant Tool Tier Ascension (+100% Power)</button>
        </div>
      `;

      document.getElementById('ad-tool-crate').onclick = () => {
        cgManager.showRewardedAd(() => alert("Obtained Mythic Agni Astra Tool!"));
      };
      document.getElementById('ad-tool-forge').onclick = () => {
        cgManager.showRewardedAd(() => {
          window.threeStage.clickPower *= 2;
          window.threeStage.saveGameProgress();
          alert("All Tools Ascended: +100% Strike Power!");
        });
      };
    } else if (tab === 'research') {
      container.innerHTML = `
        <div style="font-size:11px; color:#A0A5C0; margin-bottom:8px;">
          Unlock ancient Vedic alchemy combinations & elemental catalysts.
        </div>

        <div class="research-card">
          <div style="font-weight:bold; font-size:12px; color:#FFC72C;">1. Prithvi-Jala Alloy Bonding</div>
          <div style="font-size:10px; color:#A0A5C0;">Hardens earth blocks for +25% coin yield.</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:10px; color:#7367F0;">Cost: 50 Shards</span>
            <button class="buy-btn" style="padding:4px 8px; font-size:10px;">Unlock</button>
          </div>
        </div>

        <div class="research-card" style="border-color: #FF671F;">
          <div style="font-weight:bold; font-size:12px; color:#FF9F43;">2. Agni Plasma Resonance (Locked)</div>
          <div style="font-size:10px; color:#A0A5C0;">Melts core defenses automatically every 10s.</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:10px; color:#FF9F43;">Requires Level 5</span>
            <button id="ad-research-1" class="ad-reward-btn" style="padding:4px 8px; font-size:10px;">📺 Watch Ad to Unlock Now</button>
          </div>
        </div>

        <div class="research-card">
          <div style="font-weight:bold; font-size:12px; color:#00FFCC;">3. Vayu Kinetic Velocity Catalyst</div>
          <div style="font-size:10px; color:#A0A5C0;">Increases automatic swing speed by +50%.</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:10px; color:#7367F0;">Cost: 200 Shards</span>
            <button class="buy-btn" style="padding:4px 8px; font-size:10px;">Unlock</button>
          </div>
        </div>

        <div class="research-card" style="border-color: #8A2BE2;">
          <div style="font-weight:bold; font-size:12px; color:#8A2BE2;">4. Akasha Cosmic Void Extraction (Locked)</div>
          <div style="font-size:10px; color:#A0A5C0;">Multiplies all elemental drop rates by x3.5.</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span style="font-size:10px; color:#8A2BE2;">Requires Level 10</span>
            <button id="ad-research-2" class="ad-reward-btn" style="padding:4px 8px; font-size:10px;">📺 Watch Ad to Instant Unlock</button>
          </div>
        </div>
      `;

      document.getElementById('ad-research-1').onclick = () => {
        cgManager.showRewardedAd(() => alert("Agni Plasma Resonance Research Instantly Unlocked!"));
      };
      document.getElementById('ad-research-2').onclick = () => {
        cgManager.showRewardedAd(() => alert("Akasha Cosmic Void Extraction Instantly Unlocked!"));
      };
    } else if (tab === 'shastra') {
      container.innerHTML = `
        <div style="font-size:11px; color:#A0A5C0; margin-bottom:8px;">
          Sacred scriptures granting divine passive blessings & daily video rewards.
        </div>

        <div class="shastra-card">
          <div style="font-weight:bold; font-size:12px; color:#FFC72C;">📜 Dhatu Shastra (Metallurgy Codex)</div>
          <div style="font-size:10px; color:#D0D4E4;">Reveals atomic lattice flaws in Panchaloha ores for +30% critical strikes.</div>
          <button id="ad-shastra-1" class="ad-reward-btn" style="margin-top:4px; padding:6px;">📺 Watch Ad: Invoke Dhatu Blessing (+150% Gold for 10 Mins)</button>
        </div>

        <div class="shastra-card">
          <div style="font-weight:bold; font-size:12px; color:#00FFCC;">📜 Rasa Shastra (Alchemy Codex)</div>
          <div style="font-size:10px; color:#D0D4E4;">Transmutes raw sandstone blocks into rare Suryakanta liquid crystals.</div>
          <button id="ad-shastra-2" class="ad-reward-btn" style="margin-top:4px; padding:6px;">📺 Watch Ad: Invoke Rasa Transmutation (Instantly Spawns Rare Ore)</button>
        </div>

        <div class="shastra-card">
          <div style="font-weight:bold; font-size:12px; color:#FF9F43;">📜 Astra Shastra (Divine Weaponry Codex)</div>
          <div style="font-size:10px; color:#D0D4E4;">Channels celestial energy into Vajra, Agni, and Trishula active powers.</div>
          <button id="ad-shastra-3" class="ad-reward-btn" style="margin-top:4px; padding:6px;">📺 Watch Ad: Invoke Astra Overcharge (Zero Cooldown on Astras for 3 Mins)</button>
        </div>
      `;

      document.getElementById('ad-shastra-1').onclick = () => {
        cgManager.showRewardedAd(() => {
          window.threeStage.multiplier = 2.5;
          alert("Dhatu Divine Blessing Activated (+150% Gold)!");
        });
      };
      document.getElementById('ad-shastra-2').onclick = () => {
        cgManager.showRewardedAd(() => {
          window.threeStage.nextBlock();
          alert("Rasa Transmutation Instantly Spawned Rare Element Block!");
        });
      };
      document.getElementById('ad-shastra-3').onclick = () => {
        cgManager.showRewardedAd(() => alert("Astra Overcharge Activated: Infinite Astra Strikes!"));
      };
    }
  }
}