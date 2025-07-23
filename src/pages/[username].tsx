import { GetServerSideProps } from 'next';
import { supabase } from '../utils/supabaseClient';
import AthleteHeader from '../components/AthleteHeader';

export interface Athlete {
  id: string;
  username: string;
  name: string;
  position?: string;
  highlightVideoUrl: string;
  stats: { label: string; value: string }[];
  testimonials: { author: string; quote: string }[];
  awards: string[];
}

export default function AthletePage({ athlete }: { athlete: Athlete | null }) {
  if (!athlete) return <p>Profile not found.</p>;

  return (
    <div className="container mx-auto p-8">
      <AthleteHeader name={athlete.name} position={athlete.position} />
      <video
        src={athlete.highlightVideoUrl}
        controls
        className="mx-auto my-4 w-full max-w-xl rounded"
      />
      {/* TODO: map stats, testimonials, awards */}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const username = params?.username as string;
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('username', username)
    .single();

  return { props: { athlete: error || !data ? null : data } };
};