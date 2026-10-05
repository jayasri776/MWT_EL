export const inventoryHtml = `
<div class="table-toolbar">
          <div class="chip-row">
            <div class="chip active">All Items</div>
            <div class="chip">Pooja Essentials</div>
            <div class="chip">Kitchen Items</div>
            <div class="chip">Pooja Utensils</div>
          </div>
          <button class="btn-primary">+ Add Item</button>
        </div>
        <div class="panel">
          <table>
            <thead><tr><th>Item</th><th>Category</th><th>Stock</th><th>Reorder Level</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td class="cell-name">Pure Cow Ghee</td><td>Pooja Essentials</td><td><span class="stock-meter"><i style="width:85%;background:var(--teal)"></i></span><span class="mono">45 Liters</span></td><td class="mono">10 Liters</td><td>Store Room 1</td><td><span class="pill green">In Stock</span></td></tr>
              <tr><td class="cell-name">Camphor (Karpuram)</td><td>Pooja Essentials</td><td><span class="stock-meter"><i style="width:70%;background:var(--teal)"></i></span><span class="mono">12 Kg</span></td><td class="mono">5 Kg</td><td>Store Room 1</td><td><span class="pill green">In Stock</span></td></tr>
              <tr><td class="cell-name">Sandalwood Paste</td><td>Pooja Essentials</td><td><span class="stock-meter"><i style="width:20%;background:var(--sindoor)"></i></span><span class="mono">8 Kg</span></td><td class="mono">10 Kg</td><td>Store Room 2</td><td><span class="pill red">Low Stock</span></td></tr>
              <tr><td class="cell-name">Raw Rice (Annadhanam)</td><td>Kitchen Items</td><td><span class="stock-meter"><i style="width:90%;background:var(--teal)"></i></span><span class="mono">450 Kg</span></td><td class="mono">100 Kg</td><td>Kitchen Store</td><td><span class="pill green">In Stock</span></td></tr>
              <tr><td class="cell-name">Jaggery</td><td>Kitchen Items</td><td><span class="stock-meter"><i style="width:80%;background:var(--teal)"></i></span><span class="mono">85 Kg</span></td><td class="mono">20 Kg</td><td>Kitchen Store</td><td><span class="pill green">In Stock</span></td></tr>
              <tr><td class="cell-name">Brass Oil Lamps (Dheepam)</td><td>Pooja Utensils</td><td><span class="stock-meter"><i style="width:60%;background:var(--teal)"></i></span><span class="mono">30 Pieces</span></td><td class="mono">5 Pieces</td><td>Store Room 3</td><td><span class="pill green">In Stock</span></td></tr>
            </tbody>
          </table>
        </div>
`;
