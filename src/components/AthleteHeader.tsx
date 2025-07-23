interface Props { name: string; position?: string; }
export default function AthleteHeader({ name, position }: Props) {
  return (
    <header className="text-center my-6">
      <h1 className="text-4xl font-bold">{name}</h1>
      {position && <p className="text-xl text-gray-600">{position}</p>}
    </header>
  );
}