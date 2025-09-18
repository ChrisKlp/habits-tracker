import { getProfile } from './actions';

export default async function HomePage() {
  const profile = await getProfile();

  console.log(profile);

  return (
    <>
      <p>HomePage</p>
    </>
  );
}
