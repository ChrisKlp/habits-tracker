'use client';

import { useEffect } from 'react';

import { apiClient } from '@/lib/api/api-client';

export default function HomePage() {
  useEffect(() => {
    console.log('Attempting to fetch habits from the client...');
    apiClient
      .GET('/habits', {})
      .then(({ data }) => {
        console.log('Habits fetched successfully:', data);
      })
      .catch(error => {
        console.error('Error fetching habits:', error);
      });
  }, []);

  return (
    <>
      <p>HomePage</p>
      <p>Check the browser console to see the result of the habits fetch.</p>
    </>
  );
}
