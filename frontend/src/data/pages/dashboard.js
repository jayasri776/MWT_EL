export const dashboardHtml = `
<div class="hero-banner">
          <div>
            <p class="hero-eyebrow" data-i18n="heroEyebrow">Namaskaram, Padmavathy</p>
            <p class="hero-title" data-i18n="heroTitle">Subramaniya Swamy Temple, Tiruchendur</p>
            <p class="hero-sub" data-i18n="heroSub">Here's how the temple is running today.</p>
          </div>
          <div class="hero-om">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none"><path d="M16 2L21 8H11L16 2Z" fill="#F3E3BE"/><path d="M8 8H24L26 13H6L8 8Z" fill="#F3E3BE" fill-opacity="0.85"/><path d="M4 13H28L29.5 18H2.5L4 13Z" fill="#F3E3BE" fill-opacity="0.7"/><rect x="7" y="18" width="18" height="11" rx="1" fill="#fff" fill-opacity="0.9"/><rect x="14" y="22" width="4" height="7" fill="#0D3A34"/></svg>
          </div>
        </div>

        <div class="alert">
          <div>
            <p class="alert-title" data-i18n="alertTitle">3 inventory items below reorder level</p>
            <p class="alert-sub"><span data-i18n="alertSub">Sandalwood Paste, Cow Ghee and Karpuram need reordering before Kandha Sashti Utsavam.</span> <a href="#" class="btn-ghost" data-goto="inventory" data-i18n="reviewInventory">Review inventory →</a></p>
          </div>
        </div>

        <div class="stat-grid">
          <div class="stat-card" style="--accent:var(--sindoor)">
            <p class="stat-label" data-i18n="statActivities">Today's Activities</p>
            <p class="stat-value">8</p>
            <p class="stat-sub up" data-i18n="statActivitiesSub">5 completed · 3 upcoming</p>
          </div>
          <div class="stat-card" style="--accent:var(--teal)">
            <p class="stat-label" data-i18n="statPriests">Priests On Duty</p>
            <p class="stat-value">6 <span style="font-size:14px;color:var(--ink-faint);">/ 9</span></p>
            <p class="stat-sub" data-i18n="statPriestsSub">2 on leave · 1 off duty</p>
          </div>
          <div class="stat-card" style="--accent:var(--gold)">
            <p class="stat-label" data-i18n="statDonations">Donations — This Month</p>
            <p class="stat-value mono" style="font-family:'IBM Plex Mono';font-size:22px;">₹4,82,600</p>
            <p class="stat-sub up" data-i18n="statDonationsSub">↑ 12% vs July</p>
          </div>
          <div class="stat-card" style="--accent:var(--sindoor)">
            <p class="stat-label" data-i18n="statAnnadhanam">Annadhanam Beneficiaries</p>
            <p class="stat-value">1,240</p>
            <p class="stat-sub" data-i18n="statAnnadhanamSub">This week across 6 sittings</p>
          </div>
        </div>

        <div class="dash-grid">
          <div>
            <div class="panel">
              <div class="panel-head">
                <h3 data-i18n="panelSevaRhythm">Today's Seva Rhythm</h3>
                <button class="btn-ghost" data-i18n="fullSchedule">Full schedule →</button>
              </div>
              <div class="panel-body">
                <div class="rhythm-rail">
                  <div class="rhythm-item">
                    <div class="rhythm-time">5:00 AM</div>
                    <div class="rhythm-dot-wrap"><div class="rhythm-dot done"></div></div>
                    <div class="rhythm-body">
                      <p class="rhythm-name">Viswaroopa Darshan & Suprabhatam</p>
                      <p class="rhythm-meta">Chief Priest — Sri Ganesan Sivachariar</p>
                      <span class="rhythm-status completed">Completed</span>
                    </div>
                  </div>
                  <div class="rhythm-item">
                    <div class="rhythm-time">6:30 AM</div>
                    <div class="rhythm-dot-wrap"><div class="rhythm-dot done"></div></div>
                    <div class="rhythm-body">
                      <p class="rhythm-name">Udayamarthanda Abhishekam & Milk Pooja</p>
                      <p class="rhythm-meta">Sponsored — Rajaraman family · Daily seva</p>
                      <span class="rhythm-status completed">Completed</span>
                    </div>
                  </div>
                  <div class="rhythm-item">
                    <div class="rhythm-time">12:00 PM</div>
                    <div class="rhythm-dot-wrap"><div class="rhythm-dot done"></div></div>
                    <div class="rhythm-body">
                      <p class="rhythm-name">Uchikala Pooja & Annadhanam Seva</p>
                      <p class="rhythm-meta">318 beneficiaries served, Dining Hall</p>
                      <span class="rhythm-status completed">Completed</span>
                    </div>
                  </div>
                  <div class="rhythm-item">
                    <div class="rhythm-time">6:00 PM</div>
                    <div class="rhythm-dot-wrap"><div class="rhythm-dot upcoming"></div></div>
                    <div class="rhythm-body">
                      <p class="rhythm-name">Sayaraksha Pooja & Vibhuti Abhishekam</p>
                      <p class="rhythm-meta">Assistant Priest — Krishnamurthy Bhat</p>
                      <span class="rhythm-status scheduled">Scheduled</span>
                    </div>
                  </div>
                  <div class="rhythm-item">
                    <div class="rhythm-time">8:30 PM</div>
                    <div class="rhythm-dot-wrap"><div class="rhythm-dot upcoming"></div></div>
                    <div class="rhythm-body">
                      <p class="rhythm-name">Ardha Jama Pooja & Palli Arai</p>
                      <p class="rhythm-meta">Closing rites, temple lock-up</p>
                      <span class="rhythm-status scheduled">Scheduled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <h3 data-i18n="panelRecentDonations">Recent Donations</h3>
                <button class="btn-ghost" data-goto="donations" data-i18n="viewAll">View all →</button>
              </div>
              <table>
                <thead><tr><th>Devotee</th><th>Purpose</th><th>Type</th><th>Amount</th><th>Receipt</th></tr></thead>
                <tbody>
                  <tr><td><div class="row-flex"><div class="avatar-sm">S</div><div><div class="cell-name">Sundaram Iyer</div><div class="cell-sub">+91 98410 22xxx</div></div></div></td><td>Annadhanam</td><td><span class="pill grey">Online</span></td><td class="mono">₹5,000</td><td class="mono">RCT-88213</td></tr>
                  <tr><td><div class="row-flex"><div class="avatar-sm">L</div><div><div class="cell-name">Lakshmi Narayanan</div><div class="cell-sub">+91 90031 45xxx</div></div></div></td><td>General</td><td><span class="pill grey">Cash</span></td><td class="mono">₹1,100</td><td class="mono">RCT-88214</td></tr>
                  <tr><td><div class="row-flex"><div class="avatar-sm">A</div><div><div class="cell-name">Anand Traders (Org)</div><div class="cell-sub">Kind — 40kg rice</div></div></div></td><td>Annadhanam</td><td><span class="pill grey">Kind</span></td><td class="mono">₹3,200</td><td class="mono">RCT-88215</td></tr>
                  <tr><td><div class="row-flex"><div class="avatar-sm">K</div><div><div class="cell-name">Kalpana Ramesh</div><div class="cell-sub">+91 99400 71xxx</div></div></div></td><td>Renovation</td><td><span class="pill grey">Online</span></td><td class="mono">₹25,000</td><td class="mono">RCT-88216</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div class="panel">
              <div class="panel-head"><h3 data-i18n="panelUpcomingFestival">Upcoming Festival</h3></div>
              <div class="panel-body" style="padding-top:0;">
                <div class="festival-strip" style="margin-top:16px;">
                  <div>
                    <div class="fb-eyebrow">Annual · Aippasi Masam</div>
                    <div class="fb-title">Kandha Sashti Utsavam</div>
                    <div class="fb-sub">25 Oct 2026 · Expecting 5,00,000+ devotees</div>
                  </div>
                  <div class="festival-countdown">
                    <div class="fc-box"><div class="n">35</div><div class="l">Days</div></div>
                  </div>
                </div>
                <div class="bar-row"><div class="bar-label">Priests assigned</div><div class="bar-track"><div class="bar-fill" style="width:80%;background:var(--teal)"></div></div><div class="bar-val">4/5</div></div>
                <div class="bar-row"><div class="bar-label">Inventory readiness</div><div class="bar-track"><div class="bar-fill" style="width:62%;background:var(--gold)"></div></div><div class="bar-val">62%</div></div>
                <div class="bar-row"><div class="bar-label">Sponsorships filled</div><div class="bar-track"><div class="bar-fill" style="width:45%;"></div></div><div class="bar-val">₹68k</div></div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <h3 data-i18n="panelInventoryAlerts">Inventory Alerts</h3>
                <button class="btn-ghost" data-goto="inventory" data-i18n="manageArrow">Manage →</button>
              </div>
              <table>
                <thead><tr><th>Item</th><th>Stock</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td class="cell-name">Sandalwood Paste</td><td><span class="stock-meter"><i style="width:20%;background:var(--sindoor)"></i></span><span class="mono">8 Kg</span></td><td><span class="pill red">Low Stock</span></td></tr>
                  <tr><td class="cell-name">Camphor (Karpuram)</td><td><span class="stock-meter"><i style="width:70%;background:var(--teal)"></i></span><span class="mono">12 Kg</span></td><td><span class="pill green">In Stock</span></td></tr>
                  <tr><td class="cell-name">Pure Cow Ghee</td><td><span class="stock-meter"><i style="width:85%;background:var(--teal)"></i></span><span class="mono">45 Liters</span></td><td><span class="pill green">In Stock</span></td></tr>
                </tbody>
              </table>
            </div>

            <div class="panel">
              <div class="panel-head"><h3 data-i18n="panelStaffOnDuty">Staff On Duty</h3></div>
              <div class="panel-body" style="padding-top:14px;">
                <div class="bar-row"><div class="bar-label">Security</div><div class="bar-track"><div class="bar-fill" style="width:100%;background:var(--teal)"></div></div><div class="bar-val">4/4</div></div>
                <div class="bar-row"><div class="bar-label">Cleaning</div><div class="bar-track"><div class="bar-fill" style="width:75%;background:var(--teal)"></div></div><div class="bar-val">3/4</div></div>
                <div class="bar-row"><div class="bar-label">Accounts</div><div class="bar-track"><div class="bar-fill" style="width:100%;background:var(--teal)"></div></div><div class="bar-val">2/2</div></div>
                <div class="bar-row"><div class="bar-label">Volunteers</div><div class="bar-track"><div class="bar-fill" style="width:58%;"></div></div><div class="bar-val">7/12</div></div>
              </div>
            </div>
          </div>
        </div>
`;
