type Props = { title: string; onComplete: () => void };

export function MicroTaskStarter({ title, onComplete }: Props) {
  return (
    <section className="rounded border p-4">
      <h2>Micro-task 2</h2>
      <p>{title}</p>
      <button onClick={onComplete}>Complete step</button>
    </section>
  );
}
