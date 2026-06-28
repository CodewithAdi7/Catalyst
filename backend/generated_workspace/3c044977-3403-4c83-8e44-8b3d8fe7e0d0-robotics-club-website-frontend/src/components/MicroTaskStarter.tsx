type Props = { title: string; onComplete: () => void };

export function MicroTaskStarter({ title, onComplete }: Props) {
  return (
    <section className="rounded border p-4">
      <h2>Create the minimal project shell</h2>
      <p>{title}</p>
      <button onClick={onComplete}>Complete step</button>
    </section>
  );
}
