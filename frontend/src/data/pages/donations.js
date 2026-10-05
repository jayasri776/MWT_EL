export const donationsHtml = `
<div class="dash-grid" style="grid-template-columns:1.4fr 1fr;">
          <div>
            <div class="table-toolbar">
              <div class="chip-row">
                <div class="chip active">All</div>
                <div class="chip">Cash</div>
                <div class="chip">Online</div>
                <div class="chip">Kind</div>
              </div>
              <button class="btn-primary">+ Record Donation</button>
            </div>
            <div class="panel">
              <table>
                <thead><tr><th>Devotee</th><th>Purpose</th><th>Type</th><th>Date</th><th>Amount</th><th>Receipt</th></tr></thead>
                <tbody>
                  <tr><td class="cell-name">Sundaram Iyer</td><td>Annadhanam</td><td><span class="pill grey">Online</span></td><td class="mono">08 Aug</td><td class="mono">₹5,000</td><td class="mono">RCT-88213</td></tr>
                  <tr><td class="cell-name">Lakshmi Narayanan</td><td>General</td><td><span class="pill grey">Cash</span></td><td class="mono">08 Aug</td><td class="mono">₹1,100</td><td class="mono">RCT-88214</td></tr>
                  <tr><td class="cell-name">Anand Traders</td><td>Annadhanam</td><td><span class="pill grey">Kind</span></td><td class="mono">07 Aug</td><td class="mono">₹3,200</td><td class="mono">RCT-88215</td></tr>
                  <tr><td class="cell-name">Kalpana Ramesh</td><td>Renovation</td><td><span class="pill grey">Online</span></td><td class="mono">07 Aug</td><td class="mono">₹25,000</td><td class="mono">RCT-88216</td></tr>
                  <tr><td class="cell-name">Venkatesh Prasad</td><td>General</td><td><span class="pill grey">UPI</span></td><td class="mono">06 Aug</td><td class="mono">₹501</td><td class="mono">RCT-88217</td></tr>
                </tbody>
              </table>
            </div>
            <div class="panel">
              <div class="panel-head"><h3>Pooja Sponsorships</h3><button class="btn-ghost">+ New</button></div>
              <table>
                <thead><tr><th>Sponsor</th><th>Activity</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td class="cell-name">Rajaraman Family</td><td>Ganapathy Homam — Daily</td><td class="mono">₹1,500</td><td><span class="pill green">Paid</span></td></tr>
                  <tr><td class="cell-name">Priya Textiles (Org)</td><td>Varalakshmi Vratham Kalasam</td><td class="mono">₹15,000</td><td><span class="pill amber">Pending</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <div class="panel">
              <div class="panel-head"><h3>Purpose Breakdown — Aug</h3></div>
              <div class="panel-body">
                <div class="bar-row"><div class="bar-label">Annadhanam</div><div class="bar-track"><div class="bar-fill" style="width:48%;"></div></div><div class="bar-val">₹2.3L</div></div>
                <div class="bar-row"><div class="bar-label">General</div><div class="bar-track"><div class="bar-fill" style="width:30%;background:var(--teal)"></div></div><div class="bar-val">₹1.4L</div></div>
                <div class="bar-row"><div class="bar-label">Renovation</div><div class="bar-track"><div class="bar-fill" style="width:22%;background:var(--gold)"></div></div><div class="bar-val">₹1.0L</div></div>
              </div>
            </div>
            <div class="panel">
              <div class="panel-head"><h3>Registered Devotees</h3></div>
              <div class="panel-body" style="padding-top:14px;">
                <div class="row-flex" style="padding:8px 0;border-bottom:1px dashed var(--stone);"><div class="avatar-sm">S</div><div><div class="cell-name">Sundaram Iyer</div><div class="cell-sub">7 donations · since 2021</div></div></div>
                <div class="row-flex" style="padding:8px 0;border-bottom:1px dashed var(--stone);"><div class="avatar-sm">L</div><div><div class="cell-name">Lakshmi Narayanan</div><div class="cell-sub">3 donations · since 2023</div></div></div>
                <div class="row-flex" style="padding:8px 0;"><div class="avatar-sm">K</div><div><div class="cell-name">Kalpana Ramesh</div><div class="cell-sub">1 donation · new devotee</div></div></div>
              </div>
            </div>
          </div>
        </div>
`;
