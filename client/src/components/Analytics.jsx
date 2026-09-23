export default function Analytics({
  data,
  Comparison,
  ThisWeekCard,
  WeekComparisonCard,
  formatMinutes,
}) {
  if (!data)
    return (
      <div className="page narrow-page">
        <div className="page-title">
          <span className="eyebrow">A CLEARER PICTURE</span>
          <h1>Analytics</h1>
          <p>Notice what improved, what slipped, and where your time went.</p>
        </div>
        <section className="panel empty-panel">
          Not enough data yet.
          <br />
          Keep tracking to see your progress.
        </section>
      </div>
    );
  const categories = Object.entries(data.categories);
  const consistency = data.consistency || [];
  const time = Object.entries(data.time);
  return (
    <div className="page">
      <div className="page-title">
        <span className="eyebrow">A CLEARER PICTURE</span>
        <h1>Analytics</h1>
        <p>Notice what improved, what slipped, and where your time went.</p>
      </div>
      <div className="analytics-grid">
        <Comparison data={data} />
        <ThisWeekCard summary={data.currentWeek} />
        <WeekComparisonCard
          current={data.currentWeek}
          previous={data.previousWeek}
        />
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Task categories</h2>
          </div>
          {categories.length ? (
            categories.map(([label, value]) => (
              <div className="category-row" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <div className="category-bar">
                  <i style={{ width: `${Math.min(value * 25, 100)}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No completed tasks yet.</p>
          )}
          <div className="carried">
            <strong>Carried over</strong>
            <span>{data.carried} tasks</span>
          </div>
        </section>
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Habit consistency</h2>
          </div>
          {consistency.length ? (
            consistency.map((item) => (
              <div className="consistency-row" key={item.key}>
                <span>{item.name}</span>
                <strong>{item.days} / 7</strong>
                <div className="progress">
                  <i style={{ width: `${(item.days / 7) * 100}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">No habit records yet.</p>
          )}
        </section>
        <section className="panel analytics-card">
          <div className="panel-heading">
            <h2>Recorded time</h2>
          </div>
          {time.length ? (
            time.map(([label, value]) => (
              <div className="time-row" key={label}>
                <span>{label}</span>
                <strong>{formatMinutes(value)}</strong>
              </div>
            ))
          ) : (
            <p className="empty-state">No completed task time yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
