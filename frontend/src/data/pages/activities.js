export const initialActivities = [
  {
    id: 1,
    name: "Viswaroopa Darshan & Suprabhatam",
    sub: "Sanctum sanctorum opening",
    type: "Daily",
    when: "08 Sep · 5:00 AM",
    priest: "Ganesan Sivachariar",
    status: "Completed",
  },
  {
    id: 2,
    name: "Udayamarthanda Abhishekam & Milk Pooja",
    sub: "Morning sacred milk bath",
    type: "Daily",
    when: "08 Sep · 6:30 AM",
    priest: "Krishnamurthy Bhat",
    status: "Completed",
  },
  {
    id: 3,
    name: "Shanmuga Homam & Vel Vazhibadu",
    sub: "Veda parayanam & fire ritual",
    type: "Daily",
    when: "08 Sep · 8:30 AM",
    priest: "Ravishankar Gurukkal",
    status: "Completed",
  },
  {
    id: 4,
    name: "Uchikala Pooja & Annadhanam Seva",
    sub: "Noon grand Alankaram & prasadam",
    type: "Daily",
    when: "08 Sep · 12:00 PM",
    priest: "Ganesan Sivachariar",
    status: "Completed",
  },
  {
    id: 5,
    name: "Sayaraksha Pooja & Vibhuti Abhishekam",
    sub: "Evening rites & sacred ash bath",
    type: "Daily",
    when: "08 Sep · 6:00 PM",
    priest: "Krishnamurthy Bhat",
    status: "Scheduled",
  },
  {
    id: 6,
    name: "Kandha Sashti Kavacham & Sahasranama Archana",
    sub: "Weekly Friday special chanting",
    type: "Weekly",
    when: "12 Sep · 9:00 AM",
    priest: "Ravishankar Gurukkal",
    status: "Scheduled",
  },
  {
    id: 7,
    name: "Krittika (Karthigai) Deepam & Shanmugar Procession",
    sub: "Monthly Karthigai star special seva",
    type: "Monthly",
    when: "18 Sep · 6:30 AM",
    priest: "Ganesan Sivachariar",
    status: "Scheduled",
  },
  {
    id: 8,
    name: "Kandha Sashti Festival Sthapana Pooja",
    sub: "Annual festival opening ritual",
    type: "Festival",
    when: "25 Oct · 6:00 AM",
    priest: "Ganesan Sivachariar",
    status: "Scheduled",
  },
];

export const activitiesHtml = `
<div class="table-toolbar">
  <div class="chip-row">
    <div class="chip active">All</div>
    <div class="chip">Daily</div>
    <div class="chip">Weekly</div>
    <div class="chip">Monthly</div>
    <div class="chip">Festival</div>
    <div class="chip">Special</div>
  </div>
  <button class="btn-primary">+ Schedule Activity</button>
</div>
`;
