export function AcademicMetrics({
  label,
  items,
}: {
  label: string;
  items: readonly { label: string; value: string | number }[];
}) {
  return (
    <dl className="student-metrics" aria-label={label}>
      {items.map(({ label: name, value }) => (
        <div key={name}>
          <dt>{name}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
