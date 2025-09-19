import { getProfile } from './actions';

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p>Profile: {profile?.displayName}</p>
      <p>User ID: {profile?.userId}</p>
      <p>Email: {profile?.avatar}</p>
    </div>
  );
}
